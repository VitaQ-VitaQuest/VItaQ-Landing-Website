// Content stays visible by default. Motion enhances it without owning its visibility.
document.addEventListener('DOMContentLoaded', () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const activeAnimations = new Set();

    document.querySelectorAll('img').forEach(image => {
        function useOriginalImage() {
            const source = image.dataset.fallbackSrc;
            if (!source) return;
            delete image.dataset.fallbackSrc;
            image.removeAttribute('srcset');
            image.src = source;
        }
        image.addEventListener('error', useOriginalImage);
        if (image.complete && !image.naturalWidth) useOriginalImage();
    });

    if (typeof IntersectionObserver !== 'undefined') {
        const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(({ target, isIntersecting }) => {
                if (!isIntersecting) return;
                revealObserver.unobserve(target);

                // A slow image must enter after it loads, rather than spending its
                // entrance animation on an empty box. Never hide it while waiting.
                if (target.tagName === 'IMG' && !target.complete) {
                    target.addEventListener('load', () => revealObserver.observe(target), { once: true });
                    return;
                }
                if (reducedMotion.matches || !target.animate) return;
                const animation = target.animate([
                    { opacity: 0.55, transform: 'translateY(18px)' },
                    { opacity: 1, transform: 'none' },
                ], { duration: 480, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
                activeAnimations.add(animation);
                animation.finished.catch(() => {}).finally(() => activeAnimations.delete(animation));
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -24px 0px' });

        document.querySelectorAll([
            '.hero-preheadline', '.hero-headline', '.hero-subheading', '.hero-cta',
            '.section-header', '.section-title-small', '.problem-card', '.feature-card',
            '.bento-card', '.step-title-mobile', '.mobile-mockup-screen', '.step-content',
            '.white-label-image-wrapper',
        ].join(', ')).forEach(element => revealObserver.observe(element));
    }

    reducedMotion.addEventListener('change', () => {
        if (reducedMotion.matches) activeAnimations.forEach(animation => animation.cancel());
    });

    // Desktop screenshots crossfade at step boundaries. Touch devices use the
    // complete stacked layout, including after orientation or pointer changes.
    const desktopLayout = window.matchMedia('(min-width: 992px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    const desktopSection = document.querySelector('.deep-dive-desktop');
    let stepObserver;
    function updateStepLayout() {
        stepObserver?.disconnect();
        if (!desktopSection || !desktopLayout.matches || typeof IntersectionObserver === 'undefined') return;
        const visibleSteps = new Map();
        // Percentage margins use viewport width. Pixels keep this activation band
        // proportional to height, including on very wide or short screens.
        const topMargin = Math.round(window.innerHeight * 0.25);
        const bottomMargin = Math.round(window.innerHeight * 0.45);
        stepObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) visibleSteps.set(entry.target, entry.intersectionRatio);
                else visibleSteps.delete(entry.target);
            });
            const active = [...visibleSteps].sort((a, b) => b[1] - a[1])[0]?.[0];
            if (!active) return;
            desktopSection.querySelectorAll('[data-step]').forEach(element => {
                element.classList.toggle('is-active', element.dataset.step === active.dataset.step);
            });
        }, {
            rootMargin: `-${topMargin}px 0px -${bottomMargin}px 0px`,
            threshold: [0, 0.25, 0.5],
        });
        desktopSection.querySelectorAll('.scroll-step').forEach(step => stepObserver.observe(step));
    }
    updateStepLayout();
    desktopLayout.addEventListener('change', updateStepLayout);
    window.addEventListener('resize', () => {
        if (desktopLayout.matches) updateStepLayout();
    });

    // Decorative CSS loops only run while their section is visible.
    const loopingSections = document.querySelectorAll('#clients, .bento-grid, .testimonials-wrapper');
    const visibleSections = new Set();
    function updateLoops() {
        loopingSections.forEach(section => section.classList.toggle('motion-visible',
            visibleSections.has(section) && !document.hidden && !reducedMotion.matches));
    }
    if (typeof IntersectionObserver !== 'undefined') {
        const loopObserver = new IntersectionObserver(entries => {
            entries.forEach(({ target, isIntersecting }) => {
                if (isIntersecting) visibleSections.add(target);
                else visibleSections.delete(target);
            });
            updateLoops();
        });
        loopingSections.forEach(section => loopObserver.observe(section));
    }
    document.addEventListener('visibilitychange', updateLoops);
    reducedMotion.addEventListener('change', updateLoops);

    // Read header geometry on resize only; coalesce scroll events into one write.
    const header = document.querySelector('.main-nav');
    if (!header) return;
    let headerHeight = header.offsetHeight;
    let lastScrollY = window.scrollY;
    let scrollFrame = 0;
    let hidden = false;
    if (typeof ResizeObserver !== 'undefined') {
        new ResizeObserver(() => { headerHeight = header.offsetHeight; }).observe(header);
    } else {
        window.addEventListener('resize', () => { headerHeight = header.offsetHeight; });
    }
    window.addEventListener('scroll', () => {
        if (scrollFrame) return;
        scrollFrame = requestAnimationFrame(() => {
            scrollFrame = 0;
            const currentScrollY = Math.max(0, window.scrollY);
            if (Math.abs(currentScrollY - lastScrollY) < 4 && currentScrollY > headerHeight) return;
            const nextHidden = currentScrollY > lastScrollY && currentScrollY > headerHeight;
            if (nextHidden !== hidden) {
                hidden = nextHidden;
                header.classList.toggle('header--hidden', hidden);
            }
            lastScrollY = currentScrollY;
        });
    }, { passive: true });
});
