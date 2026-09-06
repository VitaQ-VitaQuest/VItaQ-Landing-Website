// --- EMBEDDED TEXT SCRAMBLE LIBRARY (Guaranteed Alternative) ---
class TextScramble {
    constructor(el) { this.el = el; this.chars = '!<>-_\\/[]{}—=+*^?#________'; this.update = this.update.bind(this); }
    setText(newText) {
        const oldText = this.el.innerText; const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve); this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || ''; const to = newText[i] || ''; const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40); this.queue.push({ from, to, start, end });
        }
        cancelAnimationFrame(this.frameRequest); this.frame = 0; this.update(); return promise;
    }
    update() {
        let output = ''; let complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) { complete++; output += to; } 
            else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) { char = this.randomChar(); this.queue[i].char = char; }
                output += `<span class="dud">${char}</span>`;
            } else { output += from; }
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) { this.resolve(); } 
        else { this.frameRequest = requestAnimationFrame(this.update); this.frame++; }
    }
    randomChar() { return this.chars[Math.floor(Math.random() * this.chars.length)]; }
}
// --- END OF EMBEDDED LIBRARY ---


// --- MAIN APPLICATION SCRIPT ---
document.addEventListener('DOMContentLoaded', function () {

    const glows = document.querySelectorAll('.aurora-glow');

    const glowData = [
        { el: glows[0], factor: 60 }, // aurora-1 moves the least
        { el: glows[1], factor: 40 }, // aurora-2 moves a bit more
        { el: glows[2], factor: 25 }, // aurora-3 moves the most
    ];

    let mouseX = 0, mouseY = 0;

    // --- PHASE 1 ENHANCEMENT: Surgical Mobile Optimization ---
    // Only create and animate the spotlight on non-mobile devices.
    if (window.matchMedia("(min-width: 768px)").matches) {
        const spotlight = document.createElement('div');
        spotlight.classList.add('spotlight');
        document.body.appendChild(spotlight);

        function moveSpotlight() {
            gsap.to(spotlight, {
                duration: 0.4,
                ease: 'power3.out',
                x: mouseX - spotlight.offsetWidth / 2,
                y: mouseY - spotlight.offsetHeight / 2,
            });
            requestAnimationFrame(moveSpotlight);
        }
        // Start the animation loop only on desktop.
        moveSpotlight();
    }
    
    // This listener runs on all devices for the aurora glow effect.
    // On mobile, it sets mouseX/mouseY which is harmless as moveSpotlight() is never called.
    window.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    
        // Calculate the mouse position from the center of the screen (-0.5 to 0.5)
        const xPos = (e.clientX / window.innerWidth) - 0.5;
        const yPos = (e.clientY / window.innerHeight) - 0.5;
    
        // Loop through our glows and command their movement
        glowData.forEach(glow => {
            const targetX = -xPos * glow.factor;
            const targetY = -yPos * glow.factor;
    
            // Use GSAP to smoothly animate to the target
            gsap.to(glow.el, {
                x: targetX,
                y: targetY,
                duration: 1.5, 
                ease: 'power2.out'
            });
        });
    });

    // --- Initialize Enhanced Particles.js  ---
    // Particles are decorative, so a CDN failure must never abort the rest of
    // the landing-page initialization.
    if (typeof window.particlesJS === 'function') {
        try {
            window.particlesJS("particles-js", {
                particles: {
                    number: { value: 80, density: { enable: true, value_area: 800 } },
                    color: { value: "#FFFFFF" },
                    shape: { type: "circle" },
                    opacity: { value: 0.4, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } },
                    size: { value: 2, random: true, anim: { enable: false } },
                    line_linked: { enable: false },
                    move: { enable: true, speed: 1, direction: "none", random: true, straight: false, out_mode: "out", bounce: false }
                },
                interactivity: {
                    detect_on: "canvas",
                    events: { onhover: { enable: true, mode: "push" }, onclick: { enable: true, mode: "push" }, resize: true },
                    modes: { grab: { distance: 140, line_opacity: 0.5 }, push: { particles_nb: 4 } }
                },
                retina_detect: true
            });
        } catch (err) {
            console.warn('particles.js failed to initialize; continuing without particles.', err);
        }
    }

    // --- Hamburger Menu Logic ---
    const menuButton = document.querySelector('.header-menu-button');
    const navLinks = document.querySelectorAll('.nav-link');

    function toggleMenu() {
        document.body.classList.toggle('menu-open');
    }

    menuButton.addEventListener('click', toggleMenu);
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (document.body.classList.contains('menu-open')) {
                toggleMenu();
            }
        });
    });

    // --- Animate on Scroll with GSAP ---
    gsap.registerPlugin(ScrollTrigger);

    // iOS Safari resizes the visual viewport whenever the address bar / tab
    // bar shows or hides while scrolling. Without this, every one of those
    // UI-driven resizes makes ScrollTrigger think the window was resized and
    // re-measures every trigger, which can flip already-revealed sections
    // back to their hidden starting state mid-scroll ("appearing/disappearing"
    // sections, or a blank page). This tells ScrollTrigger to ignore resizes
    // that are only caused by mobile browser UI, not real layout changes.
    ScrollTrigger.config({ ignoreMobileResize: true });
    
    // --- Hero Section Image Animation ---
    const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out", duration: 1.2 } });
    heroTimeline.fromTo('.hero-image-wrapper', { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, delay: 0.8 });
    // .hero-cta lives in the initial viewport, so it should reveal on load, not on scroll
    heroTimeline.fromTo('.hero-cta', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.4);


    // --- UNIFIED Scroll-Triggered Text Animations ---
    const animatedTextElements = document.querySelectorAll(
        '.hero-preheadline, .hero-subheading, .section-subtitle, .section-title-small, .step-content, .step-title-mobile'
    );

    animatedTextElements.forEach(el => {
        gsap.fromTo(el, { autoAlpha: 0, y: 40 }, {
            scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: "play reverse play reverse" },
            duration: 0.8, autoAlpha: 1, y: 0, ease: 'power3.out'
        });
    });

    const staggeredHeadlines = gsap.utils.toArray('.hero-headline, .section-title');

    staggeredHeadlines.forEach(headline => {
        const fragment = document.createDocumentFragment();
        const childNodes = Array.from(headline.childNodes);

        childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) { // If it's a text node
                const words = node.textContent.split(/\s+/).filter(Boolean); // Split by any whitespace
                words.forEach(word => {
                    const span = document.createElement('span');
                    span.textContent = word;
                    fragment.appendChild(span);
                    // Add a space back after each word
                    fragment.appendChild(document.createTextNode(' ')); 
                });
            } else { // If it's an element like <br>
                fragment.appendChild(node.cloneNode(true));
            }
        });

        // Replace the headline's content with our new, structured version
        headline.innerHTML = '';
        headline.appendChild(fragment);

        // THE FIX: Make the parent headline container visible before animating the children
        gsap.set(headline, { autoAlpha: 1 });

        // Animate the words in with a stagger
        gsap.from(headline.querySelectorAll('span'), {
            scrollTrigger: {
                trigger: headline,
                start: 'top 90%',
                toggleActions: "play reverse play reverse"
            },
            y: 40,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.05 // The magic property: delay between each word's animation
        });
    });


    // --- Staggered Grid Animations ---
    function createStaggeredAnimation(containerSelector, elementSelector) {
        if (!document.querySelector(containerSelector)) return;
        gsap.fromTo(elementSelector,
            { autoAlpha: 0, y: 50, scale: 0.95, rotationX: -60, transformOrigin: 'top center' },
            {
                autoAlpha: 1, y: 0, scale: 1, rotationX: 0, duration: 0.8, ease: 'power3.out', stagger: 0.15,
                scrollTrigger: {
                    trigger: containerSelector, start: 'top 85%', toggleActions: "play reverse play reverse",
                }
            });
    }
    
    createStaggeredAnimation('.problem-grid', '.problem-card');
    createStaggeredAnimation('#feature-grid .feature-grid', '#feature-grid .feature-card');
    createStaggeredAnimation('.testimonials-wrapper', '.testimonial-card');
    createStaggeredAnimation('.bento-grid', '.animate-bento');

    // The dependency-free preloader controller uses this flag to distinguish a
    // healthy GSAP initialization from a failed/unsupported bundle.
    window.__vitaqAnimationsReady = true;
    document.body.classList.remove('loading-fallback');



    // --- Who It's For: Interactive Organization Tabs ---
    const useCaseSection = document.getElementById('use-cases');

    if (useCaseSection) {
        const useCaseStates = [
            {
                title: 'Event & Competition Organizers',
                heading: 'Run Every Stage of Your Event in One Place.',
                description: 'Connect registrations, participants, schedules, competitions, ticketing, payments, and event operations from setup to event day.',
                howTitle: 'How Organizers Use VitaQ',
                cta: 'Explore Event & Competition Solutions',
                image: 'who-events-race.JPG',
                imageAlt: 'Event participants and event operations managed with VitaQ',
                composition: {
                    type: 'layered',
                    variant: 'events',
                    // Main landscape event image.
                    dashboard: 'who-events-race.JPG',
                    // Smaller overlapping judges / event-operations image.
                    scene: 'who-events-judges.jpg'
                },
                points: [
                    ['Manage Registrations', 'Manage registrations, accreditations, and attendee access IDs in one place.'],
                    ['Build Event Schedules', 'Coordinate competitions, sessions, activities, venues, and timing.'],
                    ['Manage Competitions', 'Organize participants, categories, brackets, and competition workflows.'],
                    ['Handle Tickets & Payments', 'Keep registrations, purchases, tickets, and transactions connected.'],
                    ['Keep Your Team in Control', 'Give organizers one source of truth throughout the entire event.']
                ]
            },
            {
                title: 'Sports Academies & Clubs',
                heading: 'Run Your Academy in One Connected System.',
                description: 'Manage staff, trainees, schedules, attendance, payments, and athlete development without jumping between different tools.',
                howTitle: 'How Academies Use VitaQ',
                cta: 'Explore Academy & Club Solutions',
                image: 'who-academies.png',
                imageAlt: 'VitaQ platform for sports academies and clubs',
                composition: {
                    type: 'layered',
                    variant: 'academies',
                    dashboard: 'who-academies-dashboard.png',
                    scene: 'who-academies-skaters-scene.png',
                    phone: 'who-academies-phone.png'
                },
                points: [
                    ['Manage Coaches & Trainees', 'Keep your teams, groups, athletes, and member information organized.'],
                    ['Simplify Scheduling & Attendance', 'Coordinate sessions, coaches, facilities, groups, and attendance in one place.'],
                    ['Manage Memberships & Payments', 'Handle registrations, subscriptions, invoices, and payments with less admin.'],
                    ['Track Athlete Development', 'Set goals, run evaluations, and follow progress over time.'],
                    ['Keep Everyone Connected', 'Give coaches, athletes, and parents access to the information that matters to them.']
                ]
            },
            {
                title: 'Sports Complexes',
                heading: 'Your Complex & Your Brand in One App.',
                description: 'Bring every sport, facility, program, member, payment, and event into one branded digital experience.',
                howTitle: 'How Sports Complexes Use VitaQ',
                cta: 'Explore Sports Complex Solutions',
                // IMPORTANT: Sports Complexes is intentionally single-image only.
                // No layered composition is attached to this state, so Academy assets
                // can never replace this image when the tab is selected or re-clicked.
                image: 'who-complexes-phone.png',
                imageAlt: 'VitaQ white-label experience for sports complexes',
                points: [
                    ['Launch Your Own Branded Experience', 'Deliver VitaQ with your organization’s identity for a premium member experience.'],
                    ['Bring Every Sport Together', 'Manage multiple sports, academies, programs, and activities from one platform.'],
                    ['Coordinate Facilities & Schedules', 'Connect courts, rinks, halls, fields, sessions, coaches, and availability.'],
                    ['Manage Members & Revenue', 'Handle registrations, memberships, subscriptions, invoices, and payments.'],
                    ['Run Events & Competitions', 'Use the same ecosystem for registrations, schedules, participants, ticketing, and events.']
                ]
            },
            {
                title: 'High-Performance Centers',
                heading: 'Turn Your Methodology Into Measurable Progress.',
                description: 'Structure programs, evaluations, goals, and performance data around the way your organization develops athletes.',
                howTitle: 'How High-Performance Centers Use VitaQ',
                cta: 'Explore High-Performance Solutions',
                image: 'High-Performance.jwebp',
                imageAlt: 'VitaQ performance analytics for high-performance centers',
                composition: {
                    type: 'layered',
                    variant: 'high-performance',
                    // Main landscape performance-center image.
                    dashboard: 'High-Performance.webp',
                    // Overlapping analytics phone screen.
                    phone: 'screen-analytics.png'
                },
                points: [
                    ['Digitize Your Methodology', 'Turn programs, stages, exercises, and protocols into a structured system.'],
                    ['Set Clear Benchmarks', 'Define measurable goals for development and performance.'],
                    ['Capture Evaluations', 'Record results directly during assessments and training.'],
                    ['Track Progress Over Time', 'Understand individual and group development through connected data.'],
                    ['Turn Data Into Decisions', 'Give coaches and performance teams a clearer picture of what happens next.']
                ]
            }
        ];
        [useCaseStates[2], useCaseStates[3]] = [useCaseStates[3], useCaseStates[2]];

        // Preload every Who-It's-For visual up front. Without this, switching
        // tabs sets a new <img> src that still has to be downloaded/decoded,
        // so the text content (set in the same tick) visibly updates before
        // the image does. Warming the browser cache here removes that lag.
        const useCaseImagePaths = new Set();
        useCaseStates.forEach(state => {
            if (state.image) useCaseImagePaths.add(state.image);
            if (state.composition) {
                ['dashboard', 'scene', 'phone'].forEach(layerKey => {
                    if (state.composition[layerKey]) useCaseImagePaths.add(state.composition[layerKey]);
                });
            }
        });
        useCaseImagePaths.forEach(src => {
            const preloadImg = new Image();
            preloadImg.src = src;
        });

        const useCaseTabs = Array.from(useCaseSection.querySelectorAll('.use-case-tab'));
        const useCaseTabsNav = useCaseSection.querySelector('.use-case-tabs-nav');
        const useCaseTabsScroll = useCaseSection.querySelector('.use-case-tabs-scroll');
        const useCaseIndicator = useCaseSection.querySelector('.use-case-tab-indicator');
        const useCasePrev = useCaseSection.querySelector('.use-case-tab-arrow-left');
        const useCaseNext = useCaseSection.querySelector('.use-case-tab-arrow-right');
        const useCasePanel = useCaseSection.querySelector('.use-case-panel');
        const useCaseImage = document.getElementById('use-case-image');
        const useCaseComposition = document.getElementById('use-case-composition');
        const useCaseDashboard = document.getElementById('use-case-dashboard');
        const useCaseScene = document.getElementById('use-case-scene');
        const useCasePhone = document.getElementById('use-case-phone');
        const useCaseTitle = document.getElementById('use-case-title');
        const useCaseHeading = document.getElementById('use-case-heading');
        const useCaseDescription = document.getElementById('use-case-description');
        const useCaseHowTitle = document.getElementById('use-case-how-title');
        const useCasePoints = document.getElementById('use-case-points');
        const useCaseCta = document.getElementById('use-case-cta');

        const primaryUseCaseCount = Math.min(3, useCaseStates.length);
        let activeUseCaseIndex = 0;
        let useCaseOptionsExpanded = false;
        let useCaseSwitchTimer = null;

        function expandUseCaseOptions() {
            if (useCaseOptionsExpanded || useCaseStates.length <= primaryUseCaseCount) {
                return false;
            }

            useCaseOptionsExpanded = true;
            if (useCaseTabsNav) useCaseTabsNav.classList.add('is-expanded');
            if (useCaseNext) useCaseNext.setAttribute('aria-expanded', 'true');
            if (useCaseNext) useCaseNext.setAttribute('aria-label', 'Next organization type');

            requestAnimationFrame(() => {
                positionUseCaseIndicator();
                centerUseCaseTab(useCaseTabs[activeUseCaseIndex]);
            });

            return true;
        }

        function getVisibleUseCaseCount() {
            return useCaseOptionsExpanded
                ? useCaseTabs.length
                : primaryUseCaseCount;
        }

        function positionUseCaseIndicator() {
            const activeTab = useCaseTabs[activeUseCaseIndex];
            if (!activeTab || !useCaseIndicator) return;

            useCaseIndicator.style.width = `${activeTab.offsetWidth}px`;
            useCaseIndicator.style.left = `${activeTab.offsetLeft}px`;
        }

        function centerUseCaseTab(tab) {
            if (!tab || !useCaseTabsScroll) return;

            const targetLeft = tab.offsetLeft - (useCaseTabsScroll.clientWidth - tab.offsetWidth) / 2;
            useCaseTabsScroll.scrollTo({
                left: Math.max(0, targetLeft),
                behavior: 'smooth'
            });
        }

        function applyUseCaseVisual(state) {
            if (!state || !useCaseComposition || !useCaseImage) return;

            const composition = state.composition;
            const isLayered = !!(composition && composition.type === 'layered');
            const variant = isLayered ? (composition.variant || 'default') : 'single';

            // Visual mode is resolved synchronously on every state change. There are
            // no delayed image callbacks that can overwrite a newly selected client.
            useCaseComposition.classList.toggle('is-layered', isLayered);
            useCaseComposition.dataset.compositionVariant = variant;
            useCaseComposition.setAttribute('aria-label', state.imageAlt || state.title);

            // The single-image element always receives the selected state's exact
            // fallback/source. For Sports Complexes this is ONLY who-complexes-phone.png.
            useCaseImage.src = state.image;
            useCaseImage.alt = '';

            if (!isLayered) {
                return;
            }

            if (useCaseDashboard && composition.dashboard) {
                useCaseDashboard.src = composition.dashboard;
            }

            if (useCaseScene && composition.scene) {
                useCaseScene.src = composition.scene;
            }

            // Academies uses a phone layer. Events intentionally does not.
            if (useCasePhone) {
                if (composition.phone) {
                    useCasePhone.src = composition.phone;
                } else {
                    useCasePhone.removeAttribute('src');
                }
            }
        }

        function renderUseCase(index) {
            const state = useCaseStates[index];
            if (!state) return;

            applyUseCaseVisual(state);

            useCaseTitle.textContent = state.title;
            useCaseHeading.textContent = state.heading;
            useCaseDescription.textContent = state.description;
            useCaseHowTitle.textContent = state.howTitle;
            useCaseCta.innerHTML = `${state.cta} <span aria-hidden="true">→</span>`;
            useCaseCta.href = '#feature-grid';

            useCasePoints.innerHTML = state.points.map(([title, description]) => `
                <div class="use-case-point">
                    <span class="use-case-point-icon" aria-hidden="true">✓</span>
                    <div>
                        <strong>${title}</strong>
                        <span>${description}</span>
                    </div>
                </div>
            `).join('');

            useCasePanel.setAttribute('aria-labelledby', useCaseTabs[index].id);
        }

        function setActiveUseCase(index, shouldFocus = false) {
            const visibleCount = getVisibleUseCaseCount();
            const normalizedIndex = (index + visibleCount) % visibleCount;
            const activeTab = useCaseTabs[normalizedIndex];

            if (!activeTab) return;

            // Re-clicking an already active tab deliberately does nothing. This keeps
            // the currently selected visual stable and prevents needless image resets.
            if (
                normalizedIndex === activeUseCaseIndex &&
                activeTab.classList.contains('active')
            ) {
                if (shouldFocus) {
                    activeTab.focus();
                }
                return;
            }

            activeUseCaseIndex = normalizedIndex;

            useCaseTabs.forEach((tab, tabIndex) => {
                const isActive = tabIndex === normalizedIndex;
                tab.classList.toggle('active', isActive);
                tab.setAttribute('aria-selected', String(isActive));
                tab.tabIndex = isActive ? 0 : -1;
            });

            positionUseCaseIndicator();
            centerUseCaseTab(activeTab);

            if (useCaseSwitchTimer) {
                clearTimeout(useCaseSwitchTimer);
            }

            useCasePanel.classList.add('is-switching');

            // Matches the .use-case-panel.is-switching CSS transition duration
            // (0.22s) so the fade-out finishes completely before the content
            // swaps and the fade-in starts. Previously this fired at 180ms,
            // cutting the fade-out short and restarting the transition mid-way,
            // which read as a stutter/lag on every tab switch.
            useCaseSwitchTimer = setTimeout(() => {
                renderUseCase(normalizedIndex);
                useCasePanel.classList.remove('is-switching');
            }, 220);

            if (shouldFocus) {
                activeTab.focus();
            }
        }

        useCaseTabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                const tabIndex = Number(tab.dataset.useCaseIndex);
                setActiveUseCase(Number.isInteger(tabIndex) ? tabIndex : index);
            });

            tab.addEventListener('keydown', event => {
                let nextIndex = null;
                const visibleCount = getVisibleUseCaseCount();

                if (event.key === 'ArrowRight') {
                    nextIndex = (index + 1) % visibleCount;
                }
                if (event.key === 'ArrowLeft') {
                    nextIndex = (index - 1 + visibleCount) % visibleCount;
                }
                if (event.key === 'Home') {
                    nextIndex = 0;
                }
                if (event.key === 'End') {
                    nextIndex = visibleCount - 1;
                }

                if (nextIndex !== null) {
                    event.preventDefault();
                    setActiveUseCase(nextIndex, true);
                }
            });
        });

        if (useCasePrev) {
            useCasePrev.addEventListener('click', () => {
                setActiveUseCase(activeUseCaseIndex - 1);
            });
        }

        if (useCaseNext) {
            useCaseNext.addEventListener('click', () => {
                // First click reveals the secondary client type.
                if (expandUseCaseOptions()) return;

                // After expansion it behaves as the normal next arrow.
                setActiveUseCase(activeUseCaseIndex + 1);
            });
        }

        window.addEventListener('resize', () => {
            positionUseCaseIndicator();
            centerUseCaseTab(useCaseTabs[activeUseCaseIndex]);
        });

        requestAnimationFrame(() => {
            renderUseCase(0);
            positionUseCaseIndicator();
        });
    }

    if (window.matchMedia("(min-width: 767px)").matches) {
        const scrollSteps = document.querySelectorAll('.scroll-step');
        const mockupContainer = document.querySelector('.mockup-container');
        const mockupScreens = document.querySelectorAll('.mockup-screen');
        const stepTitles = document.querySelectorAll('.step-title');
        let isTransitioning = false;
        let currentStep = 1;
    
        // Setup for the new TextScramble library
        const textScrambles = Array.from(stepTitles).map(title => new TextScramble(title));
        const originalTexts = Array.from(stepTitles).map(title => title.textContent);
    
        // Initial visibility setup
        gsap.set(stepTitles, { autoAlpha: 0 });
        gsap.set(mockupScreens, { autoAlpha: 0 });
        gsap.set(stepTitles[0], { autoAlpha: 1 });
        gsap.set(mockupScreens[0], { autoAlpha: 1 });
        
        if(window.innerWidth > 991) {
            document.querySelector('.step-content').classList.add('glowing');
        } else {
            stepTitles[0].classList.add('active-mobile');
        }
    
        function setActiveStep(stepId) {
            if (isTransitioning || stepId == currentStep) return;
            isTransitioning = true;
    
            const outgoingStep = currentStep;
            const incomingStep = stepId;
    
            const outgoingTitle = document.querySelector(`.step-title[data-step="${outgoingStep}"]`);
            const incomingTitle = document.querySelector(`.step-title[data-step="${incomingStep}"]`);
            const incomingScramble = textScrambles[incomingStep - 1];
    
            const outgoingScreen = document.querySelector(`.mockup-screen[data-step="${outgoingStep}"]`);
            const incomingScreen = document.querySelector(`.mockup-screen[data-step="${incomingStep}"]`);
    
            const tl = gsap.timeline({
                onComplete: () => {
                    currentStep = incomingStep;
                    isTransitioning = false;
                }
            });
    
            tl.to(outgoingTitle, {
                autoAlpha: 0,
                duration: 0.3,
                ease: 'power2.in'
            });
    
            tl.to(mockupContainer, {
                rotationY: "+=180",
                scale: 0.8,
                filter: 'blur(5px)',
                duration: 0.5,
                ease: 'power4.in'
            }, 0);
    
            tl.call(() => {
                gsap.set(incomingTitle, { autoAlpha: 1 });
                incomingScramble.setText(originalTexts[incomingStep - 1]);
            });
    
            tl.set(outgoingScreen, { autoAlpha: 0 })
              .set(incomingScreen, { autoAlpha: 1 })
              .to(mockupContainer, {
                  rotationY: "+=180",
                  scale: 1,
                  filter: 'blur(0px)',
                  duration: 0.5,
                  ease: 'power4.out'
              });
            
            document.querySelectorAll('.step-content').forEach(card => card.classList.remove('glowing'));
            document.querySelectorAll('.step-title').forEach(title => title.classList.remove('active-mobile'));
            const activeCard = document.querySelector(`.scroll-step[data-step="${stepId}"] .step-content`);
            const activeTitle = document.querySelector(`.step-title[data-step="${stepId}"]`);
            if (activeCard) activeCard.classList.add('glowing');
            if (activeTitle) activeTitle.classList.add('active-mobile');
        }
    
        // ScrollTrigger with the buffer zone
        scrollSteps.forEach(step => {
            ScrollTrigger.create({
                trigger: step,
                start: 'top 50%',
                end: 'bottom 50%',
                onToggle: self => {
                    if (self.isActive) {
                        setActiveStep(step.dataset.step);
                    }
                },
                // For debugging, you can add markers: true
                // markers: true 
            });
        });
    } else {
        // --- Animate mobile mockups on scroll ---
        gsap.utils.toArray('.mobile-mockup-screen').forEach(screen => {
            gsap.fromTo(screen, 
                { autoAlpha: 0, y: 50, scale: 0.9 },
                { 
                    autoAlpha: 1, y: 0, scale: 1,
                    duration: 0.8, ease: 'power3.out',
                    scrollTrigger: {
                        trigger: screen,
                        start: 'top 85%',
                        toggleActions: "play reverse play reverse"
                    }
                }
            );
        });
    }


    // --- Advanced Scroll-Tied Animations (Scrubbing) (Unchanged) ---
    const scrubbingElements = document.querySelectorAll('.animate-with-scrub');
    scrubbingElements.forEach(el => {
        gsap.fromTo(el, { opacity: 0.3, scale: 0.9, rotation: -5 }, {
            opacity: 1, scale: 1, rotation: 0, ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'center center', scrub: 1.5 }
        });
    });

    // --- Full-Screen 3D Hero Image (Unchanged) ---
    const heroImage = document.querySelector('.hero-image');
    let targetRotateX = 0;
    let targetRotateY = 0;

    window.addEventListener('mousemove', (e) => {
        targetRotateX = gsap.utils.mapRange(0, window.innerHeight, -8, 8, e.clientY);
        targetRotateY = gsap.utils.mapRange(0, window.innerWidth, 8, -8, e.clientX);
    });

    gsap.ticker.add(() => {
        gsap.to(heroImage, {
            duration: 1.5,
            rotationX: targetRotateX,
            rotationY: targetRotateY,
            transformPerspective: 1000,
            ease: 'power3.out'
        });
    });

    // --- Contact Form Logic (with Success Glow Trigger) ---
    const form = document.getElementById('contact-form');
    const formContainer = document.querySelector('.form-container');
    const formWrapper = document.querySelector('.form-wrapper');
    const successMessage = document.querySelector('.form-success');
    
    // Select the anti-spam honeypot field
    const honeyPotField = document.getElementById('website_url');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // --- HONEYPOT CHECK ---
        // If the hidden field has any value, it's a bot.
        if (honeyPotField.value !== "") {
            console.log("Bot detected. Submitting silently.");
            // We return immediately, making the bot think it succeeded (or failed silently),
            // but we do NOT send the email.
            return;
        }

        formWrapper.classList.add('sending');
    
        // Your specific EmailJS credentials
        const serviceID = 'service_i2cehxk';
        const templateID = 'template_t4src1r';
        const publicKey = 'GnZyGn1ismb0LZW1f';
    
        // Send the form data using EmailJS
        emailjs.sendForm(serviceID, templateID, this, publicKey)
            .then(() => {
                // SUCCESS LOGIC (this is what used to be in setTimeout)
                formWrapper.classList.remove('sending');
                form.style.display = 'none';
                successMessage.style.display = 'flex';
                gsap.fromTo(successMessage, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
                formContainer.classList.add('form-success-glow');
            }, (err) => {
                // ERROR LOGIC
                formWrapper.classList.remove('sending');
                alert('Message failed to send. Please try again. Error: ' + JSON.stringify(err));
            });
    });

    // --- Dynamic "Peek-a-Boo" Header ---
    const header = document.querySelector('.main-nav');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > lastScrollY && currentScrollY > header.offsetHeight) {
            // Scrolling Down
            header.classList.add('header--hidden');
        } else {
            // Scrolling Up
            header.classList.remove('header--hidden');
        }

        lastScrollY = currentScrollY;
    });

        // --- FAQ Tabs & Accordion Logic ---
        const faqTabs = Array.from(document.querySelectorAll('.faq-tab'));
        const faqPanels = Array.from(document.querySelectorAll('.faq-panel'));
        const faqItems = Array.from(document.querySelectorAll('.faq-item'));

        const faqTabsContainer = document.querySelector('.faq-tabs');
        const faqPrevButton = document.querySelector('.faq-tab-arrow-left');
        const faqNextButton = document.querySelector('.faq-tab-arrow-right');


        function closeFaqItem(item) {
            item.classList.remove('active')

            const question = item.querySelector('.faq-question');

            if (question) {
                question.setAttribute('aria-expanded', 'false');
            }
        }


        /*
        * On mobile, automatically scroll the selected tab
        * into the visible center of the tab container.
        */
        function scrollFaqTabIntoView(tab) {
            if (
                !faqTabsContainer ||
                !window.matchMedia('(max-width: 767px)').matches
            ) {
                return;
            }

            const targetLeft =
                tab.offsetLeft -
                (faqTabsContainer.clientWidth - tab.offsetWidth) / 2;

            faqTabsContainer.scrollTo({
                left: Math.max(0, targetLeft),
                behavior: 'smooth'
            });
        }


        /*
        * Disable the left arrow on the first category
        * and the right arrow on the last category.
        */
        function updateFaqArrowState(tab) {
            const activeIndex = faqTabs.indexOf(tab);

            if (faqPrevButton) {
                faqPrevButton.disabled = activeIndex <= 0;
            }

            if (faqNextButton) {
                faqNextButton.disabled =
                    activeIndex >= faqTabs.length - 1;
            }
        }


        /*
        * Activate a FAQ category.
        */
        function activateFaqTab(tab, shouldFocus = false) {
            const category = tab.dataset.faqTab;

            // Update tab buttons
            faqTabs.forEach(otherTab => {
                const isActive = otherTab === tab;

                otherTab.classList.toggle('active', isActive);
                otherTab.setAttribute(
                    'aria-selected',
                    String(isActive)
                );

                otherTab.tabIndex = isActive ? 0 : -1;
            });


            // Update FAQ panels
            faqPanels.forEach(panel => {
                const isActive =
                    panel.dataset.faqPanel === category;

                panel.classList.toggle('active', isActive);
                panel.hidden = !isActive;

                // Close questions when leaving a category
                if (!isActive) {
                    panel
                        .querySelectorAll('.faq-item')
                        .forEach(closeFaqItem);
                }
            });


            // Update mobile arrow states
            updateFaqArrowState(tab);

            // Make sure selected tab is visible on mobile
            scrollFaqTabIntoView(tab);


            // Keyboard accessibility
            if (shouldFocus) {
                tab.focus();
            }
        }


        /*
        * FAQ category tab click + keyboard navigation
        */
        faqTabs.forEach((tab, index) => {

            // Mouse / touch
            tab.addEventListener('click', () => {
                activateFaqTab(tab);
            });


            // Keyboard navigation
            tab.addEventListener('keydown', event => {
                let nextIndex = null;

                if (event.key === 'ArrowRight') {
                    nextIndex =
                        (index + 1) % faqTabs.length;
                }

                else if (event.key === 'ArrowLeft') {
                    nextIndex =
                        (index - 1 + faqTabs.length) %
                        faqTabs.length;
                }

                else if (event.key === 'Home') {
                    nextIndex = 0;
                }

                else if (event.key === 'End') {
                    nextIndex = faqTabs.length - 1;
                }


                if (nextIndex !== null) {
                    event.preventDefault();

                    activateFaqTab(
                        faqTabs[nextIndex],
                        true
                    );
                }
            });
        });


        /*
        * Mobile Previous Category Arrow
        */
        if (faqPrevButton) {
            faqPrevButton.addEventListener('click', () => {

                const activeIndex =
                    faqTabs.findIndex(tab =>
                        tab.classList.contains('active')
                    );

                if (activeIndex > 0) {
                    activateFaqTab(
                        faqTabs[activeIndex - 1]
                    );
                }
            });
        }


        /*
        * Mobile Next Category Arrow
        */
        if (faqNextButton) {
            faqNextButton.addEventListener('click', () => {

                const activeIndex =
                    faqTabs.findIndex(tab =>
                        tab.classList.contains('active')
                    );

                if (
                    activeIndex >= 0 &&
                    activeIndex < faqTabs.length - 1
                ) {
                    activateFaqTab(
                        faqTabs[activeIndex + 1]
                    );
                }
            });
        }


        /*
        * FAQ Accordion
        */
        faqItems.forEach(item => {
            const question =
                item.querySelector('.faq-question');

            if (!question) {
                return;
            }

            question.addEventListener('click', () => {

                const panel =
                    item.closest('.faq-panel');

                const isActive =
                    item.classList.contains('active');


                /*
                * Close every question inside
                * the current category first.
                */
                panel
                    .querySelectorAll('.faq-item')
                    .forEach(closeFaqItem);


                /*
                * If the clicked question was closed,
                * open it.
                *
                * If it was already open,
                * it simply remains closed.
                */
                if (!isActive) {
                    item.classList.add('active');

                    question.setAttribute(
                        'aria-expanded',
                        'true'
                    );
                }
            });
        });


        /*
        * Initial FAQ state
        */
        if (faqTabs.length) {

            const initialActiveTab =
                faqTabs.find(tab =>
                    tab.classList.contains('active')
                ) || faqTabs[0];

            updateFaqArrowState(initialActiveTab);
        }

    // --- Testimonial Modal Logic ---
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const modalOverlay = document.getElementById('testimonial-modal');
    const modalQuote = document.getElementById('modal-quote');
    const modalCite = document.getElementById('modal-cite');
    const modalCloseBtn = document.querySelector('.modal-close-btn');

    function openModal(card) {
        const fullQuote = card.dataset.fullQuote;
        const citeHtml = card.querySelector('cite').innerHTML;

        modalQuote.textContent = fullQuote;
        modalCite.innerHTML = citeHtml;
        
        document.body.classList.add('modal-open');
        modalOverlay.classList.add('modal-visible');
    }

    function closeModal() {
        document.body.classList.remove('modal-open');
        modalOverlay.classList.remove('modal-visible');
    }

    testimonialCards.forEach(card => {
        card.addEventListener('click', () => {
            openModal(card);
        });
    });

    modalCloseBtn.addEventListener('click', closeModal);

    modalOverlay.addEventListener('click', (e) => {
        // Close modal only if the overlay itself (the background) is clicked
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // Add keyboard accessibility
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('modal-visible')) {
            closeModal();
        }
    });

    // --- Living Interface Enhancement: Step 1 (Image Reveals & Hovers) ---

    // 1. Shimmer Reveal on Scroll
    const revealWrappers = gsap.utils.toArray('.white-label-image-wrapper, .use-case-image-wrapper');
    revealWrappers.forEach(wrapper => {
        ScrollTrigger.create({
            trigger: wrapper,
            start: 'top 85%',
            once: true, // Animation runs only once
            onEnter: () => {
                // Add the class to start the animation
                wrapper.classList.add('is-revealed');
                
                // Set a timer to remove the class after the animation is complete
                // This is the "clean-up" that prevents the ghosting artifact.
                setTimeout(() => {
                    wrapper.classList.remove('is-revealed');
                }, 1000); // The animation duration is 1s (1000ms)
            }
        });
    });


    // 2. 3D Tilt on Hover (Optimized)
    const tiltWrappers = gsap.utils.toArray('.white-label-image-wrapper, .use-case-visual, .mockup-container');
    tiltWrappers.forEach(wrapper => {
        // Keep multi-part visuals moving as one 3D composition.
        const isMockupContainer = wrapper.classList.contains('mockup-container');
        const isUseCaseVisual = wrapper.classList.contains('use-case-visual');

        const imagesToTilt = isMockupContainer
            ? wrapper.querySelectorAll('img')
            : isUseCaseVisual
                ? wrapper.querySelector('.use-case-composition')
                : wrapper.querySelector('img');

        wrapper.addEventListener('mousemove', (e) => {
            const rect = wrapper.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Map mouse position to rotation values (-8 to 8 degrees)
            const rotateY = gsap.utils.mapRange(0, rect.width, -8, 8, x);
            const rotateX = gsap.utils.mapRange(0, rect.height, 8, -8, y);

            gsap.to(imagesToTilt, {
                rotationX: rotateX,
                rotationY: rotateY,
                transformPerspective: 1000,
                duration: 0.8,
                ease: 'power3.out'
            });
        });

        wrapper.addEventListener('mouseleave', () => {
            gsap.to(imagesToTilt, {
                rotationX: 0,
                rotationY: 0,
                transformPerspective: 1000,
                duration: 1.5,
                ease: 'elastic.out(1, 0.5)'
            });
        });
    });

    // --- Living Interface Enhancement: Step 2 (Interactive Cursor) ---
    
    // Only run this on devices with a fine pointer (Mouse/Trackpad)
    if (window.matchMedia("(pointer: fine)").matches) {
        
        const interactiveElements = document.querySelectorAll(
            'a, button, .testimonial-card, .problem-card, .feature-card, .use-case-card, .bento-card'
        );

        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-active');
            });
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-active');
            });
        });
    }
});

// --- Growth Hack: Tab Title Changer ---
let docTitle = document.title;
window.addEventListener("blur", () => {
    document.title = "👋 Come back to VitaQ!";
});
window.addEventListener("focus", () => {
    document.title = docTitle;
});

// --- Client Logo Reel: Seamless Auto-Scroll + Click-and-Drag ---
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.client-reel-container');
    const track = document.querySelector('.client-reel');
    if (!container || !track) return;

    const AUTO_SCROLL_SPEED = 0.6; // pixels per frame while idle
    const CLICK_MOVE_THRESHOLD = 5; // px of movement below which a drag counts as a "click" instead

    let currentX = 0;        // unwrapped running position (can grow without limit)
    let halfWidth = 0;       // width of ONE copy of the logo set
    let isDragging = false;
    let isPaused = false;    // true after a plain click/tap; stays stopped until clicked again
    let dragStartClientX = 0;
    let dragStartX = 0;
    let hasMoved = false;    // did this press move past the click threshold?

    // The track contains two identical copies of the logo list back-to-back.
    // halfWidth is the width of a single copy, measured from the real DOM
    // so it always stays accurate even if logos are added/removed later.
    function measure() {
        halfWidth = track.scrollWidth / 2;
    }
    measure();
    window.addEventListener('resize', measure);

    // Wraps currentX into a single copy's width so the transform always
    // lands within the visually-identical repeating region. Using a real
    // modulo (not CSS's -50% trick) means there is no seam or snap at the
    // loop boundary in either scroll direction, including while dragging.
    function render() {
        const wrapped = ((currentX % halfWidth) + halfWidth) % halfWidth;
        track.style.transform = `translateX(${wrapped - halfWidth}px)`;
    }

    function tick() {
        if (!isDragging && !isPaused) {
            currentX -= AUTO_SCROLL_SPEED;
        }
        render();
        requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    function startDrag(clientX) {
        isDragging = true;
        hasMoved = false;
        dragStartClientX = clientX;
        dragStartX = currentX;
        container.classList.add('is-dragging');
    }

    function moveDrag(clientX) {
        if (!isDragging) return;
        if (Math.abs(clientX - dragStartClientX) > CLICK_MOVE_THRESHOLD) {
            hasMoved = true;
        }
        currentX = dragStartX + (clientX - dragStartClientX);
        render();
    }

    function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        container.classList.remove('is-dragging');

        // A press that never moved past the threshold counts as a plain
        // click/tap on a logo: toggle stopped-in-place instead of treating
        // it as a drag release.
        if (!hasMoved) {
            isPaused = !isPaused;
        }
    }

    // Mouse
    container.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startDrag(e.clientX);
    });
    window.addEventListener('mousemove', (e) => moveDrag(e.clientX));
    window.addEventListener('mouseup', endDrag);

    // Touch
    container.addEventListener('touchstart', (e) => startDrag(e.touches[0].clientX), { passive: true });
    container.addEventListener('touchmove', (e) => moveDrag(e.touches[0].clientX), { passive: true });
    container.addEventListener('touchend', endDrag);
    container.addEventListener('touchcancel', endDrag);

    // View toggle: switch between the scrolling reel and the full color grid
    const viewToggle = document.getElementById('client-view-toggle');
    const reelContainer = document.getElementById('client-reel-container');
    const logoGrid = document.getElementById('client-logo-grid');
    const viewToggleLabel = viewToggle ? viewToggle.querySelector('.client-view-toggle-label') : null;
    if (viewToggle && reelContainer && logoGrid && viewToggleLabel) {
        viewToggle.addEventListener('click', () => {
            const showGrid = viewToggle.getAttribute('aria-pressed') !== 'true';
            viewToggle.setAttribute('aria-pressed', String(showGrid));
            reelContainer.hidden = showGrid;
            logoGrid.hidden = !showGrid;
            isPaused = showGrid;
            viewToggleLabel.textContent = showGrid ? 'Reel view' : 'List all';
        });
    }
});