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
    gsap.registerPlugin(ScrollTrigger);
    
    // --- Hero Section Image Animation ---
    const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out", duration: 1.2 } });
    heroTimeline.fromTo('.hero-image-wrapper', { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, delay: 0.8 });


    // --- UNIFIED Scroll-Triggered Text Animations ---
    const animatedTextElements = document.querySelectorAll(
        '.hero-preheadline, .hero-subheading, .hero-cta, .section-subtitle, .section-title-small, .step-content, .step-title-mobile'
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
    createStaggeredAnimation('#use-cases', '#use-cases .feature-card');


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

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        formWrapper.classList.add('sending');
    
        // Your specific EmailJS credentials
        const serviceID = 'service_tf010rz'; 
        const templateID = 'template_vn7t583';
        const publicKey = 'Xc_6XWChYs1z1uehh'; 
    
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

    // --- Preloader Logic ---
    window.onload = () => {
        // After everything (inc. images) is loaded, wait a moment to ensure
        // the user sees the beautiful logo animation, then fade out.
        setTimeout(() => {
            document.body.classList.add('loaded');
        }, 3000); // A fixed delay to appreciate the full animation.
    };

    // --- Dynamic "Peek-a-Boo" Header ---
    const header = document.querySelector('.header');
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

    // --- FAQ Accordion Logic ---
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // First, close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });

            // Then, toggle the clicked item
            if (!isActive) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
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
    const revealWrappers = gsap.utils.toArray('.solution-image-wrapper, .white-label-image-wrapper, .use-case-image-wrapper');
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
    const tiltWrappers = gsap.utils.toArray('.solution-image-wrapper, .white-label-image-wrapper, .use-case-image-wrapper, .mockup-container');
    
    tiltWrappers.forEach(wrapper => {
        // Check if this is the multi-image scrollytelling container
        const isMockupContainer = wrapper.classList.contains('mockup-container');
        const imagesToTilt = isMockupContainer ? wrapper.querySelectorAll('img') : wrapper.querySelector('img');

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
    
    // Select all elements that should trigger the cursor change
    const interactiveElements = document.querySelectorAll(
        'a, button, .testimonial-card, .problem-card, .feature-card, .use-case-card'
    );

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            document.body.classList.add('cursor-active');
        });
        el.addEventListener('mouseleave', () => {
            document.body.classList.remove('cursor-active');
        });
    });
});