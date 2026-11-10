const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { test } = require('node:test');
const { runInNewContext } = require('node:vm');

// Exercise the actual landing-page controller without the unrelated page animations.
const script = readFileSync(process.env.REEL_SCRIPT || join(__dirname, '../script.js'), 'utf8');
const controller = script.slice(script.indexOf('// --- Client Logo Reel:'));

function element() {
    const listeners = new Map();
    const attributes = new Map();
    const classes = new Set();
    const captures = new Set();
    return {
        hidden: false,
        style: {},
        classList: {
            add: name => classes.add(name),
            remove: name => classes.delete(name),
            contains: name => classes.has(name),
        },
        addEventListener(name, listener) {
            if (!listeners.has(name)) listeners.set(name, []);
            listeners.get(name).push(listener);
        },
        emit(name, event = {}) {
            for (const listener of listeners.get(name) || []) listener(event);
        },
        getAttribute: name => attributes.get(name),
        setAttribute: (name, value) => attributes.set(name, value),
        setPointerCapture: id => captures.add(id),
        hasPointerCapture: id => captures.has(id),
        releasePointerCapture(id) {
            captures.delete(id);
            this.emit('lostpointercapture', { pointerId: id });
        },
    };
}

function setup({ reducedMotion = false } = {}) {
    const document = element();
    const window = element();
    const container = element();
    container.clientWidth = 390;
    const track = element();
    const toggle = element();
    const grid = element();
    const label = element();
    const frames = new Map();
    let nextFrame = 0;
    let time = 0;
    let widths = [101.25, 173.5, 97.75];
    let gap = 48;
    let resize;
    const originalCount = widths.length;
    const loopWidth = () => widths.reduce((sum, width) => sum + width + gap, 0);
    const offsetAt = index => {
        let offset = 0;
        for (let i = 0; i < index; i++) offset += widths[i % originalCount] + gap;
        return offset;
    };
    const image = index => Object.assign(element(), {
        index,
        get offsetLeft() { return Math.round(offsetAt(index)); },
        cloneNode: () => image(index + originalCount),
    });
    track.children = widths.map((_, index) => image(index));
    track.querySelectorAll = () => track.children;
    track.appendChild = child => track.children.push(child);
    track.getBoundingClientRect = () => ({ width: 2 * loopWidth() - gap });
    container.hidden = true;
    toggle.setAttribute('aria-pressed', 'true');
    toggle.querySelector = () => label;
    document.querySelector = selector => selector === '.client-reel' ? track : container;
    document.getElementById = id => ({
        'client-reel-container': container,
        'client-view-toggle': toggle,
        'client-logo-grid': grid,
    })[id];
    window.matchMedia = () => ({ matches: reducedMotion });

    runInNewContext(controller, {
        document,
        window,
        performance: { now: () => time },
        getComputedStyle: node => node === track
            ? { columnGap: `${gap}px` }
            : { width: `${widths[node.index % originalCount]}px` },
        ResizeObserver: class {
            constructor(callback) { resize = callback; }
            observe() {}
        },
        requestAnimationFrame(callback) {
            frames.set(++nextFrame, callback);
            return nextFrame;
        },
        cancelAnimationFrame: id => frames.delete(id),
    });
    document.emit('DOMContentLoaded');
    toggle.emit('click');
    const x = () => Number(track.style.transform.match(/translateX\(([-\d.e]+)px\)/)[1]);
    const pointer = (type, clientX, clientY = 100, extra = {}) => container.emit(type, {
        pointerId: 1, isPrimary: true, button: 0, clientX, clientY, ...extra,
    });
    const frame = (elapsed = 1000 / 60) => {
        time += elapsed;
        const pending = [...frames.values()];
        frames.clear();
        pending.forEach(callback => callback(time));
    };
    const advance = duration => {
        for (let elapsed = 0; elapsed < duration; elapsed += 1000 / 60) frame();
    };
    const wheel = (deltaX, deltaY = 0, extra = {}) => {
        let prevented = false;
        container.emit('wheel', {
            deltaX, deltaY, deltaMode: 0, preventDefault() { prevented = true; }, ...extra,
        });
        return prevented;
    };
    const movement = before => {
        const distance = x() - before;
        return distance - Math.round(distance / loopWidth()) * loopWidth();
    };
    const tap = () => {
        pointer('pointerdown', 100);
        pointer('pointerup', 100);
    };
    return {
        container, track, toggle, document, window, pointer, frame, advance, wheel, movement, tap, x, loopWidth,
        resize(nextWidths, nextGap = gap) {
            widths = nextWidths;
            gap = nextGap;
            resize();
        },
        frameCount: () => frames.size,
    };
}

test('vertical scrolling never changes reel position and auto resumes after idle', () => {
    const reel = setup();
    reel.frame();
    const start = reel.x();
    reel.pointer('pointerdown', 100, 200);
    reel.pointer('pointermove', 102, 175);
    reel.pointer('pointermove', 120, 120);
    assert.equal(reel.x(), start);
    reel.pointer('pointerup', 120, 120);
    reel.advance(1000);
    assert.ok(reel.x() < start, 'auto-scroll must resume after a vertical swipe');
});

test('touch cancellation, lost capture, blur and multi-touch never count as taps', () => {
    for (const cancellation of ['pointercancel', 'lostpointercapture', 'blur', 'multitouch', 'hidden']) {
        const reel = setup();
        reel.frame();
        reel.pointer('pointerdown', 100);
        if (cancellation === 'blur') reel.window.emit('blur');
        else if (cancellation === 'multitouch') {
            reel.pointer('pointerdown', 120, 110, { pointerId: 2, isPrimary: false });
        } else if (cancellation === 'hidden') {
            reel.document.hidden = true;
            reel.document.emit('visibilitychange');
        } else reel.pointer(cancellation, 100);
        reel.advance(1000);
        assert.ok(reel.x() < 0, `${cancellation} must preserve auto-scroll`);
        assert.equal(reel.container.classList.contains('is-dragging'), false);
        assert.equal(reel.container.hasPointerCapture(1), false);
    }
});

test('taps yield temporary control and auto resumes without another tap', () => {
    const reel = setup();
    reel.frame();
    reel.tap();
    reel.container.emit('mousedown', { clientX: 100, preventDefault() {} });
    reel.window.emit('mouseup');
    const paused = reel.x();
    reel.frame();
    assert.equal(reel.x(), paused);
    reel.advance(1000);
    assert.ok(reel.x() < paused);
});

test('user control immediately stops auto and stays in control while held', () => {
    const reel = setup();
    reel.advance(1000);
    reel.pointer('pointerdown', 100);
    const before = reel.x();
    reel.advance(1000);
    assert.equal(reel.x(), before);
    reel.pointer('pointermove', 140);
    assert.equal(reel.movement(before), 40);
    reel.advance(1000);
    assert.equal(reel.movement(before), 40);
    reel.pointer('pointerup', 140);
    const release = reel.x();
    reel.advance(500);
    assert.equal(reel.x(), release, 'holding still before release must not create a fling');
    reel.advance(500);
    assert.ok(reel.movement(release) < 0, 'auto mode should ease back in');
});

test('release momentum follows swipe speed in either direction', () => {
    for (const direction of [-1, 1]) {
        const distances = [];
        for (const speed of [10, 30]) {
            const reel = setup();
            reel.frame();
            reel.pointer('pointerdown', 100);
            for (let step = 1; step <= 3; step++) {
                reel.frame(20);
                reel.pointer('pointermove', 100 + direction * step * speed);
            }
            reel.pointer('pointerup', 100 + direction * 3 * speed);
            const release = reel.x();
            reel.advance(100);
            const distance = reel.movement(release);
            assert.ok(distance * direction > 0, 'momentum must keep the release direction');
            distances.push(Math.abs(distance));
        }
        assert.ok(distances[1] > distances[0] * 2.5, 'faster swipes must coast further');
    }
});

test('reversing direction replaces stale momentum and auto returns smoothly', () => {
    const reel = setup();
    reel.frame();
    reel.pointer('pointerdown', 250);
    reel.frame(20);
    reel.pointer('pointermove', 150);
    reel.frame(20);
    reel.pointer('pointermove', 170);
    reel.pointer('pointerup', 170);
    const release = reel.x();
    reel.frame(20);
    assert.ok(reel.movement(release) > 0, 'rightward release must not retain leftward momentum');
    let reversedToAuto = false;
    for (let i = 0; i < 180; i++) {
        const before = reel.x();
        reel.frame();
        const distance = reel.movement(before);
        if (distance < 0) {
            assert.ok(Math.abs(distance) < 0.7, 'auto must ease in without snapping backwards');
            reversedToAuto = true;
            break;
        }
    }
    assert.ok(reversedToAuto, 'auto mode must return once the fling settles');
});

test('a new gesture cancels an existing fling immediately', () => {
    const reel = setup();
    reel.frame();
    reel.pointer('pointerdown', 100);
    reel.frame(20);
    reel.pointer('pointermove', 160);
    reel.pointer('pointerup', 160);
    reel.frame(20);
    reel.pointer('pointerdown', 160);
    const stopped = reel.x();
    reel.advance(300);
    assert.equal(reel.x(), stopped);
    reel.pointer('pointermove', 140);
    assert.equal(reel.movement(stopped), -20);
});

test('horizontal wheels follow event distance directly and resume auto after idle', () => {
    const reel = setup();
    reel.frame();
    const before = reel.x();
    assert.equal(reel.wheel(-40), true);
    assert.equal(reel.movement(before), 40);
    reel.advance(100);
    assert.equal(reel.movement(before), 40, 'trackpad events must not receive extra synthetic momentum');
    assert.equal(reel.wheel(15), true);
    assert.equal(reel.movement(before), 25, 'wheel reversal must follow the new direction immediately');
    reel.advance(500);
    assert.equal(reel.movement(before), 25);
    reel.advance(600);
    assert.ok(reel.movement(before) < 25, 'auto must return after wheel events stop');
});

test('wheel units and shift-scroll work without consuming vertical page scrolling or zoom', () => {
    const reel = setup({ reducedMotion: true });
    reel.frame();
    assert.equal(reel.wheel(0, 100), false);
    assert.equal(reel.wheel(5, 100), false);
    assert.equal(reel.wheel(20, 0, { ctrlKey: true }), false);
    assert.equal(reel.x(), 0);
    reel.wheel(2, 0, { deltaMode: 1 });
    assert.equal(reel.x(), -32);
    reel.wheel(0, 20, { shiftKey: true });
    assert.equal(reel.x(), -52);
    reel.wheel(1, 0, { deltaMode: 2 });
    assert.equal(reel.x(), -442);
});

test('horizontal dragging follows incremental movement across both loop boundaries', () => {
    const reel = setup({ reducedMotion: true });
    reel.pointer('pointerdown', 100);
    let last = 100;
    let expected = 0;
    for (const next of [120, -650, 1100, 1090, -1500, -1490]) {
        expected = (expected + next - last) % reel.loopWidth();
        if (expected > 0) expected -= reel.loopWidth();
        reel.pointer('pointermove', next);
        assert.equal(reel.x(), expected);
        last = next;
    }
    reel.pointer('pointerup', last);
    assert.equal(reel.container.classList.contains('is-dragging'), false);
});

test('layout changes preserve the visible logo and do not reset an active drag', () => {
    const reel = setup({ reducedMotion: true });
    reel.pointer('pointerdown', 300);
    reel.pointer('pointermove', 100);
    // Position 200 is inside the second logo; preserve its progress after resizing.
    const progress = (200 - 149.25) / 221.5;
    reel.resize([90, 150, 85], 32);
    const expected = -(122 + progress * 182);
    assert.ok(Math.abs(reel.x() - expected) < 0.0001);
    reel.pointer('pointermove', 90);
    assert.ok(Math.abs(reel.x() - (expected - 10)) < 0.0001);
});

test('auto-scroll speed is stable at 60/120 Hz and background gaps are capped', () => {
    for (const rate of [60, 120]) {
        const reel = setup();
        reel.frame();
        for (let i = 0; i < rate; i++) reel.frame(1000 / rate);
        assert.ok(Math.abs(reel.x() + 36) < 0.0001);
        const before = reel.x();
        reel.frame(60000);
        assert.ok(Math.abs(reel.x() - before) <= 1.8001);
    }
});

test('view toggles keep one animation loop and reduced motion stays still', () => {
    const reel = setup({ reducedMotion: true });
    for (let i = 0; i < 5; i++) {
        reel.frame();
        assert.equal(reel.x(), 0);
        assert.equal(reel.frameCount(), 1);
        reel.toggle.emit('click');
        assert.equal(reel.frameCount(), 0);
        reel.toggle.emit('click');
        assert.equal(reel.frameCount(), 1);
    }
});
