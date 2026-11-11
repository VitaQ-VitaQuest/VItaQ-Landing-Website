const assert = require('node:assert/strict');
const { existsSync, readFileSync, statSync } = require('node:fs');
const { join } = require('node:path');
const { test } = require('node:test');

const root = join(__dirname, '..');
const manifest = JSON.parse(readFileSync(join(root, 'assets/optimized/manifest.json'), 'utf8'));

test('optimized assets and original fallbacks exist within the landing image budget', () => {
    let totalBytes = 0;
    for (const [original, { variants }] of Object.entries(manifest)) {
        assert.ok(existsSync(join(root, original)), `Missing fallback: ${original}`);
        for (const { src } of variants) {
            const bytes = statSync(join(root, src)).size;
            assert.ok(bytes < 300_000, `Image is too large for a landing card: ${src}`);
            totalBytes += bytes;
        }
    }
    assert.ok(totalBytes < 3_000_000, `Optimized images exceed the 3 MB total budget: ${totalBytes}`);
});

test('HTML and interactive tabs reference generated assets that are shipped', () => {
    for (const filename of ['index.html', 'script.js']) {
        const source = readFileSync(join(root, filename), 'utf8');
        for (const [asset] of source.matchAll(/assets\/optimized\/[a-z0-9-]+\.webp/g)) {
            assert.ok(existsSync(join(root, asset)), `${filename} references missing ${asset}`);
        }
    }
});

test('all development screenshots reserve layout space and have responsive sources and fallbacks', () => {
    const html = readFileSync(join(root, 'index.html'), 'utf8');
    const screenshots = [...html.matchAll(/<img\b[^>]*class="(?:mobile-)?mockup-screen\b[^>]*>/g)];
    assert.equal(screenshots.length, 8);
    screenshots.forEach(([tag]) => {
        for (const attribute of ['width', 'height', 'srcset', 'sizes', 'data-fallback-src']) {
            assert.match(tag, new RegExp(`\\b${attribute}="[^\"]+"`));
        }
        assert.match(tag, /loading="lazy"/);
        assert.match(tag, /decoding="async"/);
    });
});
