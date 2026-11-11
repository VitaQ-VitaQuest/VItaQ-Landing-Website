Run these checks from the repository root (the static site), not the nested Next.js app.

```sh
node --test tests/*.test.cjs
node --check script.js
node --check motion.js
git diff --check
```

The browser regression suite uses Playwright and starts/closes its own local HTTP server:

```sh
npm install --prefix /tmp/vitaq-browser-tests playwright@1.61.1
/tmp/vitaq-browser-tests/node_modules/.bin/playwright install chromium webkit
NODE_PATH=/tmp/vitaq-browser-tests/node_modules node tests/landing.browser.cjs
```

Optional environment variables: `CHROMIUM_EXECUTABLE` and `WEBKIT_EXECUTABLE` select existing browser installations; `ARTIFACT_DIR` saves screenshots outside the repository. The suite covers 320px and 390px phones, touch tablets, desktop step changes and responsive resizing, reduced motion, failed animation CDNs, slow or missing optimized screenshots, no JavaScript, WebKit, and navigation/tab/FAQ interactions. It checks that screenshots enter once and remain visible, including after viewport-height changes, and that offscreen decorative CSS animations stop.

Use `TEST_CASE=client-list` for the focused phone, desktop, and WebKit list-view checks. They verify loaded logos, filter-free static decoration, absence of the section mask in list mode, no hidden-reel updates during page scrolling, and working logo feedback and view toggles.

Regenerate optimized assets from the unchanged source images with Python and Pillow:

```sh
python3 -m venv /tmp/vitaq-image-tools
/tmp/vitaq-image-tools/bin/pip install Pillow
/tmp/vitaq-image-tools/bin/python tools/optimize-images.py
```

The generated manifest records original dimensions and responsive variants. Asset tests enforce existence, original fallbacks, and a 3 MB aggregate budget. Browser emulation does not establish physical-device or deployment acceptance.
