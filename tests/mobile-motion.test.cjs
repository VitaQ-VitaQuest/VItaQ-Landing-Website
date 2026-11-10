const assert = require('node:assert/strict');
const { existsSync, readFileSync } = require('node:fs');
const { join } = require('node:path');
const { test } = require('node:test');
const { runInNewContext } = require('node:vm');

const landingScript = readFileSync(join(__dirname, '../script.js'), 'utf8');
const landingInitialization = landingScript.slice(
    landingScript.indexOf("document.addEventListener('DOMContentLoaded', function () {"),
    landingScript.indexOf("// --- Who It's For:"),
) + '\n});';
const pricingScript = readFileSync(join(__dirname, '../pricing/pricing.js'), 'utf8');

function setup({ width = 390, touch = true, reducedMotion = false } = {}) {
    const listeners = new Map();
    const calls = { particles: 0, frames: 0, tweens: [], sets: [], staticIcons: 0 };
    const icons = [0, 1].map(() => ({ removeAttribute(name) {
        assert.equal(name, 'trigger');
        calls.staticIcons++;
    } }));
    const glows = [{}, {}, {}];
    const target = { addEventListener() {}, classList: { add() {}, remove() {} } };
    const gsap = {
        registerPlugin() {},
        set: (selector, values) => calls.sets.push({ selector, values }),
        to: (element, values) => calls.tweens.push({ element, values }),
        from() {},
        fromTo() {},
        timeline: () => ({ fromTo() {} }),
        utils: { toArray: () => [], mapRange: () => 1 },
        // Deliberately no ticker: pointer effects must never register an idle loop.
    };
    const window = {
        innerWidth: width,
        innerHeight: 800,
        matchMedia(query) {
            const staticMotion = width < 768 || touch || reducedMotion;
            return { matches: query.includes('no-preference') ? !staticMotion : staticMotion };
        },
        addEventListener(name, callback) {
            if (!listeners.has(name)) listeners.set(name, []);
            listeners.get(name).push(callback);
        },
        particlesJS() { calls.particles++; },
        gsap,
        ScrollTrigger: { config() {} },
    };
    const context = {
        window,
        document: {
            title: 'VitaQ',
            body: { appendChild() {}, classList: target.classList },
            createElement: () => ({ ...target, offsetWidth: 400, offsetHeight: 400 }),
            querySelector: selector => ['.header-menu-button', '.pricing-logic'].includes(selector) ? target : null,
            querySelectorAll: selector => selector === '.aurora-glow' ? glows : selector === 'lord-icon' ? icons : [],
            addEventListener(name, callback) {
                if (name === 'DOMContentLoaded') context.initialize = callback;
            },
        },
        gsap,
        ScrollTrigger: window.ScrollTrigger,
        requestAnimationFrame() { calls.frames++; },
    };
    return { context, calls, window, emitMouseMove() {
        for (const callback of listeners.get('mousemove') || []) callback({ clientX: 120, clientY: 160 });
    } };
}

for (const [name, options] of [
    ['phone', {}],
    ['tablet with a touch pointer', { width: 1024 }],
    ['desktop with reduced motion', { width: 1440, touch: false, reducedMotion: true }],
]) {
    test(`${name} reveals landing content without particles or idle pointer effects`, () => {
        const page = setup(options);
        runInNewContext(landingInitialization, page.context);
        page.context.initialize();
        page.emitMouseMove();
        assert.equal(page.calls.particles, 0);
        assert.equal(page.calls.frames, 0);
        assert.equal(page.calls.tweens.length, 0);
        assert.equal(page.calls.staticIcons, 2);
        assert.equal(page.window.__vitaqAnimationsReady, true);
        assert.ok(page.calls.sets.some(call => call.selector.includes('.mobile-mockup-screen') && call.values.autoAlpha === 1));
    });

    test(`${name} keeps pricing content static without scheduling hidden-card tweens`, () => {
        const page = setup(options);
        runInNewContext(pricingScript, page.context);
        runInNewContext('initializeParticles(); initializeAmbientMotion(); initializePricingCardTilt(); initializePageAnimations();', page.context);
        page.emitMouseMove();
        assert.equal(page.calls.particles, 0);
        assert.equal(page.calls.frames, 0);
        assert.equal(page.calls.tweens.length, 0);
    });
}

test('desktop landing pointer effects animate only on input and replace competing tweens', () => {
    const page = setup({ width: 1440, touch: false });
    runInNewContext(landingInitialization, page.context);
    page.context.initialize();
    assert.equal(page.calls.frames, 0);
    assert.equal(page.calls.tweens.length, 0);
    assert.equal(page.calls.particles, 1);
    page.emitMouseMove();
    assert.equal(page.calls.tweens.length, 4);
    assert.ok(page.calls.tweens.every(call => call.values.overwrite === 'auto'));
});

test('desktop pricing tilt animates only on input and replaces competing tweens', () => {
    const page = setup({ width: 1440, touch: false });
    runInNewContext(pricingScript, page.context);
    runInNewContext('initializePricingCardTilt();', page.context);
    assert.equal(page.calls.frames, 0);
    assert.equal(page.calls.tweens.length, 0);
    page.emitMouseMove();
    assert.equal(page.calls.tweens.length, 1);
    assert.equal(page.calls.tweens[0].values.overwrite, 'auto');
});

test('feature icons cannot start continuous loops before the page controller initializes', () => {
    const html = readFileSync(join(__dirname, '../index.html'), 'utf8');
    const icons = html.match(/<lord-icon\b[^>]*>/g);
    assert.ok(icons.length > 0);
    assert.ok(icons.every(icon => !/trigger="loop"/.test(icon)));
});

test('organization tabs only preload image assets that exist', () => {
    const images = [...landingScript.matchAll(/\b(?:image|dashboard|scene|phone):\s*'([^']+)'/g)];
    assert.ok(images.length > 0);
    for (const [, path] of images) {
        assert.ok(existsSync(join(__dirname, '..', path)), `Missing organization image: ${path}`);
    }
});
