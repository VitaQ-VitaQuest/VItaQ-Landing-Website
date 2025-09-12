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
    const spotlight = document.querySelector('.spotlight'); // Get reference for cursor enhancement

    // --- PHASE 1 ENHANCEMENT: Surgical Mobile Optimization ---
    if (window.matchMedia("(min-width: 768px)").matches) {
        // Create the spotlight div only on desktop
        const spotlightEl = document.createElement('div');
        spotlightEl.classList.add('spotlight');
        document.body.appendChild(spotlightEl);

        function moveSpotlight() {
            gsap.to(spotlightEl, {
                duration: 0.4,
                ease: 'power3.out',
                x: mouseX - spotlightEl.offsetWidth / 2,
                y: mouseY - spotlightEl.offsetHeight / 2,
            });
            requestAnimationFrame(moveSpotlight);
        }
        moveSpotlight();
    }
    
    window.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    
        const xPos = (e.clientX / window.innerWidth) - 0.5;
        const yPos = (e.clientY / window.innerHeight) - 0.5;
    
        glowData.forEach(glow => {
            const targetX = -xPos * glow.factor;
            const targetY = -yPos * glow.factor;
    
            gsap.to(glow.el, {
                x: targetX,
                y: targetY,
                duration: 1.5, 
                ease: 'power2.out'
            });
        });
    });

    // --- Initialize Enhanced Particles.js  ---
    particlesJS("particles-js", {
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
    gsap.registerPlugin(ScrollTrigger, SplitText);
    
    // --- Hero Section Image Animation ---
    const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out", duration: 1.2 } });
    heroTimeline.fromTo('.hero-image-wrapper', { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, delay: 0.8 });

    // ======================================================================
    // --- REPLACEMENT: Refined Text Stagger Animations ---
    // ======================================================================
    // Animate titles with character stagger
    const animatedTitles = document.querySelectorAll('.hero-headline, .section-title');
    animatedTitles.forEach(title => {
        const split = new SplitText(title, { type: "chars, words" });
        gsap.from(split.chars, {
            scrollTrigger: { trigger: title, start: "top 85%", toggleActions: "play reverse play reverse" },
            duration: 0.6,
            ease: "power2.out",
            y: 40,
            autoAlpha: 0,
            stagger: {
                from: "random",
                amount: 0.2
            }
        });
    });

    // Animate other text elements with standard fade-in
    const animatedTextElements = document.querySelectorAll(
        '.hero-preheadline, .hero-subheading, .hero-cta, .section-subtitle, .section-title-small, .step-content, .step-title-mobile'
    );
    animatedTextElements.forEach(el => {
        gsap.fromTo(el, { autoAlpha: 0, y: 40 }, {
            scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: "play reverse play reverse" },
            duration: 0.8, autoAlpha: 1, y: 0, ease: 'power3.out'
        });
    });

    // --- Staggered Grid Animations ---
    function createStaggeredAnimation(containerSelector, elementSelector) {
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
    createStaggeredAnimation('.testimonials', '.testimonial-card');
    createStaggeredAnimation('#use-cases', '#use-cases .feature-card');


    if (window.matchMedia("(min-width: 767px)").matches) {
        const scrollSteps = document.querySelectorAll('.scroll-step');
        const mockupContainer = document.querySelector('.mockup-container');
        const mockupScreens = document.querySelectorAll('.mockup-screen');
        const stepTitles = document.querySelectorAll('.step-title');
        let isTransitioning = false;
        let currentStep = 1;
    
        const textScrambles = Array.from(stepTitles).map(title => new TextScramble(title));
        const originalTexts = Array.from(stepTitles).map(title => title.textContent);
    
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
    
            tl.to(outgoingTitle, { autoAlpha: 0, duration: 0.3, ease: 'power2.in' });
    
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
            });
        });
    } else {
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

    // --- Advanced Scroll-Tied Animations (Scrubbing) ---
    const scrubbingElements = document.querySelectorAll('.animate-with-scrub');
    scrubbingElements.forEach(el => {
        gsap.fromTo(el, { opacity: 0.3, scale: 0.9, rotation: -5 }, {
            opacity: 1, scale: 1, rotation: 0, ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'center center', scrub: 1.5 }
        });
    });

    // --- Full-Screen 3D Hero Image ---
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

    // --- Contact Form Logic ---
    const form = document.getElementById('contact-form');
    const formContainer = document.querySelector('.form-container');
    const formWrapper = document.querySelector('.form-wrapper');
    const successMessage = document.querySelector('.form-success');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        formWrapper.classList.add('sending');
    
        const serviceID = 'service_tf010rz'; 
        const templateID = 'template_vn7t583';
        const publicKey = 'Xc_6XWChYs1z1uehh'; 
    
        emailjs.sendForm(serviceID, templateID, this, publicKey)
            .then(() => {
                formWrapper.classList.remove('sending');
                form.style.display = 'none';
                successMessage.style.display = 'flex';
                gsap.fromTo(successMessage, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
                formContainer.classList.add('form-success-glow');
            }, (err) => {
                formWrapper.classList.remove('sending');
                alert('Message failed to send. Please try again. Error: ' + JSON.stringify(err));
            });
    });

    // --- Preloader Logic ---
    window.onload = () => {
        setTimeout(() => {
            document.body.classList.add('loaded');
        }, 3000);
    };

    // --- Dynamic "Peek-a-Boo" Header ---
    const header = document.querySelector('.header');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY && currentScrollY > header.offsetHeight) {
            header.classList.add('header--hidden');
        } else {
            header.classList.remove('header--hidden');
        }
        lastScrollY = currentScrollY;
    });

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
        card.addEventListener('click', () => openModal(card));
    });

    modalCloseBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('modal-visible')) closeModal();
    });
    
    // ======================================================================
    // --- NEW: Interactive Cursor Logic ---
    // ======================================================================
    function setupInteractiveCursor() {
        const interactiveElements = document.querySelectorAll(
            'a, button, .testimonial-card, .header-menu-button, .header-logo-wrapper, .problem-card, .feature-card, .use-case-card'
        );
        const spotlightEl = document.querySelector('.spotlight');

        if (!spotlightEl) return; // Don't run on mobile

        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                spotlightEl.classList.add('is-interactive');
            });
            el.addEventListener('mouseleave', () => {
                spotlightEl.classList.remove('is-interactive');
            });
        });
    }
    setupInteractiveCursor();


    // ======================================================================
    // --- NEW: 'Living' Image Reveal Logic ---
    // ======================================================================
    function setupImageShimmers() {
        const imagesToShimmer = document.querySelectorAll('.solution-image-wrapper, .white-label-image-wrapper, .use-case-image-wrapper');
        
        imagesToShimmer.forEach(wrapper => {
            // Add the shimmer-wrap class for styling
            wrapper.classList.add('shimmer-wrap');
            const shimmerPseudo = window.getComputedStyle(wrapper, '::before');

            gsap.timeline({
                scrollTrigger: {
                    trigger: wrapper,
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                }
            })
            .from(wrapper.querySelector('img'), {
                autoAlpha: 0,
                scale: 1.1,
                duration: 1,
                ease: 'power3.out'
            })
            .to(wrapper, {
                '--shimmer-translate': '100%', // Animate the custom property
                duration: 1.2,
                ease: 'power2.out'
            }, '-=0.8');
        });
    }
    setupImageShimmers();
});