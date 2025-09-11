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

    // --- Interactive Spotlight Cursor (Unchanged) ---
    const spotlight = document.createElement('div');
    spotlight.classList.add('spotlight');
    document.body.appendChild(spotlight);

    let mouseX = 0, mouseY = 0;
    

    function moveSpotlight() {
        gsap.to(spotlight, {
            duration: 0.4,
            ease: 'power3.out',
            x: mouseX - spotlight.offsetWidth / 2,
            y: mouseY - spotlight.offsetHeight / 2,
        });
        requestAnimationFrame(moveSpotlight);
    }

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

    moveSpotlight();


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
        '.hero-preheadline, .hero-headline, .hero-subheading, .hero-cta, .section-title, .section-subtitle, .section-title-small, .step-content, .step-title-mobile'
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
});