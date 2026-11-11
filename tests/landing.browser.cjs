// Run with Playwright installed; see tests/README.md. The HTTP server is test-only.
const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { readFile, mkdir } = require('node:fs/promises');
const { join, extname, resolve, sep } = require('node:path');
const { chromium, webkit } = require('playwright');

const root = resolve(__dirname, '..');
const artifacts = process.env.ARTIFACT_DIR;
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = createServer(async (request, response) => {
    try {
        const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
        const file = resolve(root, `.${pathname}`, pathname.endsWith('/') ? 'index.html' : '');
        if (!file.startsWith(root + sep)) throw new Error('Invalid path');
        const content = await readFile(file);
        response.setHeader('Content-Type', mime[extname(file)] || 'application/octet-stream');
        response.end(content);
    } catch {
        response.writeHead(404).end();
    }
});

async function inspectImage(page, selector, index = 0) {
    const image = page.locator(selector).nth(index);
    await image.evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await page.waitForFunction(({ selector, index }) => {
        const element = document.querySelectorAll(selector)[index];
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        const revealed = matchMedia('(prefers-reduced-motion: reduce)').matches || window.revealedElements.has(element);
        return revealed && element.complete && element.naturalWidth > 0 && rect.width > 0 &&
            rect.top < innerHeight && rect.bottom > 0 && style.visibility === 'visible' && Number(style.opacity) === 1 &&
            element.getAnimations().every(animation => animation.playState !== 'running');
    }, { selector, index });
    const box = await image.boundingBox();
    assert.ok(box.width > 100 && box.height > 100, 'Screenshot must have usable dimensions');
}

async function checkStackedScreens(page, motionExpected) {
    assert.equal(await page.locator('.deep-dive-mobile').isVisible(), true);
    assert.equal(await page.locator('.deep-dive-desktop').isVisible(), false);
    for (let index = 0; index < 4; index++) await inspectImage(page, '.mobile-mockup-screen', index);
    const reveals = await page.evaluate(() => window.reveals.filter(name => name.includes('mobile-mockup-screen')));
    assert.equal(reveals.length, motionExpected ? 4 : 0, 'Every screenshot gets one entrance unless reduced motion is requested');
    await inspectImage(page, '.mobile-mockup-screen');
    assert.equal(await page.evaluate(() => window.reveals.filter(name => name.includes('mobile-mockup-screen')).length), reveals.length);
    const size = page.viewportSize();
    await page.setViewportSize({ width: size.width, height: size.height - 100 });
    await inspectImage(page, '.mobile-mockup-screen');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'No horizontal page overflow');
}

async function checkDesktopSteps(page) {
    assert.equal(await page.locator('.deep-dive-desktop').isVisible(), true);
    for (const step of [1, 4, 2, 3, 1]) {
        await page.locator(`.scroll-step[data-step="${step}"]`).evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
        await page.waitForFunction(step => {
            const image = document.querySelector(`.mockup-screen[data-step="${step}"]`);
            const rect = image.getBoundingClientRect();
            return image.classList.contains('is-active') && image.complete && image.naturalWidth > 0 &&
                Number(getComputedStyle(image).opacity) === 1 && rect.top >= 0 && rect.bottom <= innerHeight;
        }, step);
    }
}

async function runCase(browser, url, name, options = {}, failure = '') {
    if (process.env.TEST_CASE && !name.includes(process.env.TEST_CASE)) return;
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, ...options });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
        if (failure === 'dependencies') await page.route('https://**/*', route => route.abort());
        if (failure === 'images') await page.route('**/assets/optimized/screen-*.webp', route => route.fulfill({ status: 404, body: '' }));
        if (failure === 'slow-image') await page.route('**/assets/optimized/screen-stages-*.webp', async route => {
            await new Promise(resolve => setTimeout(resolve, 700));
            await route.continue();
        });
        await page.addInitScript(() => {
            window.reveals = [];
            window.revealedElements = new WeakSet();
            const animate = Element.prototype.animate;
            Element.prototype.animate = function (...args) {
                window.reveals.push(String(this.className));
                window.revealedElements.add(this);
                return animate.apply(this, args);
            };
        });
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('body.loaded');
        if (options.hasTouch === false && options.reducedMotion !== 'reduce') {
            await checkDesktopSteps(page);
            await page.setViewportSize({ width: 390, height: 844 });
            await checkStackedScreens(page, true);
            await page.setViewportSize({ width: 1440, height: 1000 });
            await checkDesktopSteps(page);
            await page.emulateMedia({ reducedMotion: 'reduce' });
            assert.equal(await page.locator('.deep-dive-mobile').isVisible(), true);
        } else {
            await checkStackedScreens(page, options.reducedMotion !== 'reduce');
        }
        if (failure === 'images') {
            assert.ok((await page.locator('.mobile-mockup-screen').evaluateAll(images => images.map(image => image.currentSrc))).every(src => src.endsWith('.png')));
        }
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        if (await page.locator('.header-menu-button').isVisible()) {
            await page.locator('.header-menu-button').click();
            assert.equal(await page.locator('body').evaluate(body => body.classList.contains('menu-open')), true);
            await page.locator('.header-menu-button').click();
        }
        await page.locator('.use-case-tab').nth(1).click();
        await page.waitForFunction(() => document.querySelector('#use-case-panel')?.getAttribute('aria-labelledby') === document.querySelectorAll('.use-case-tab')[1].id ||
            document.querySelector('.use-case-panel').getAttribute('aria-labelledby') === document.querySelectorAll('.use-case-tab')[1].id);
        await page.locator('.faq-question').first().click();
        assert.equal(await page.locator('.faq-item').first().evaluate(item => item.classList.contains('active')), true);
        assert.deepEqual(errors, []);
        const runningLoops = await page.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running' && animation.effect.getTiming().iterations === Infinity).length);
        assert.equal(runningLoops, 0, 'Offscreen decorative CSS loops must be paused');
        const headerMeasurements = await page.evaluate(async () => {
            const header = document.querySelector('.main-nav');
            const measure = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight').get;
            let reads = 0;
            Object.defineProperty(header, 'offsetHeight', { configurable: true, get() { reads++; return measure.call(this); } });
            for (let frame = 0; frame < 20; frame++) {
                scrollBy({ top: -40, behavior: 'instant' });
                await new Promise(requestAnimationFrame);
            }
            delete header.offsetHeight;
            return reads;
        });
        assert.equal(headerMeasurements, 0, 'Scrolling must not remeasure header layout');
        if (artifacts) {
            await inspectImage(page, '.mobile-mockup-screen');
            await page.screenshot({ path: join(artifacts, `${name}.png`) });
        }
        console.log(`PASS ${name}`);
    } catch (error) {
        if (artifacts) await page.screenshot({ path: join(artifacts, `${name}-failure.png`) });
        throw new Error(`${name}: ${error.message}`, { cause: error });
    } finally {
        await context.close();
    }
}

async function main() {
    if (artifacts) await mkdir(artifacts, { recursive: true });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const url = `http://127.0.0.1:${server.address().port}/`;
    const chrome = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE });
    try {
        await runCase(chrome, url, 'phone-390');
        await runCase(chrome, url, 'phone-320', { viewport: { width: 320, height: 740 } });
        await runCase(chrome, url, 'touch-tablet', { viewport: { width: 1024, height: 1366 } });
        await runCase(chrome, url, 'reduced-motion', { reducedMotion: 'reduce' });
        await runCase(chrome, url, 'desktop-resize', { viewport: { width: 1440, height: 1000 }, isMobile: false, hasTouch: false });
        await runCase(chrome, url, 'cdn-failure', {}, 'dependencies');
        await runCase(chrome, url, 'image-fallback', {}, 'images');
        await runCase(chrome, url, 'slow-image', {}, 'slow-image');
        const noScript = await chrome.newPage({ javaScriptEnabled: false, viewport: { width: 1440, height: 1000 } });
        await noScript.goto(url);
        assert.equal(await noScript.locator('.deep-dive-mobile').isVisible(), true);
        assert.equal(await noScript.locator('.section-title').first().isVisible(), true);
        assert.equal(await noScript.locator('#preloader').isVisible(), false);
        assert.equal(await noScript.locator('.mobile-mockup-screen').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), true);
        await noScript.close();
        console.log('PASS no-javascript');
    } finally {
        await chrome.close();
    }
    const safari = await webkit.launch({ executablePath: process.env.WEBKIT_EXECUTABLE });
    try {
        await runCase(safari, url, 'webkit-phone');
    } finally {
        await safari.close();
    }
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.close());
