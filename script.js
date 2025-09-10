document.addEventListener('DOMContentLoaded', function () {

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
    });

    moveSpotlight();


    // --- Initialize Enhanced Particles.js (Unchanged) ---
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

    // --- Hamburger Menu Logic (Unchanged) ---
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

    // Hero Section Animation (Unchanged)
    const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.8 } });
    heroTimeline.fromTo('.hero-preheadline', { opacity: 0, y: 40 }, { opacity: 1, y: 0, delay: 0.2 })
                .fromTo('.hero-headline', { opacity: 0, y: 40 }, { opacity: 1, y: 0 }, "-=0.6")
                .fromTo('.hero-subheading', { opacity: 0, y: 40 }, { opacity: 1, y: 0 }, "-=0.6")
                .fromTo('.hero-cta', { opacity: 0, y: 40 }, { opacity: 1, y: 0 }, "-=0.6")
                .fromTo('.hero-image-wrapper', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 1.2 }, "-=0.8");

    // NEW: Scroll-Triggered Text Animations for all sections
    const animatedTextElements = document.querySelectorAll('.section-title, .section-subtitle, .section-title-small');
    animatedTextElements.forEach(el => {
        gsap.fromTo(el,
            { autoAlpha: 0, y: 40 },
            {
                autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 85%' }
            }
        );
    });

    // Staggered Grid Animations
    function createStaggeredAnimation(containerSelector, elementSelector) {
        gsap.fromTo(elementSelector, { opacity: 0, y: 40 }, {
            opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.15,
            scrollTrigger: {
                trigger: containerSelector,
                start: 'top 80%',
                onEnter: () => { // NEW: Sequential icon animations
                    if (containerSelector === '.problem-grid') {
                        const icons = document.querySelectorAll('.problem-card lord-icon');
                        icons.forEach((icon, index) => {
                            setTimeout(() => {
                                icon.trigger = 'loop';
                            }, index * 200); // Stagger the trigger
                        });
                    }
                }
            }
        });
    }
    createStaggeredAnimation('.problem-grid', '.problem-card');
    createStaggeredAnimation('.feature-grid', '.feature-card');
    createStaggeredAnimation('.testimonials', '.testimonial-card');

    // Advanced Scroll-Tied Animations (Scrubbing) (Unchanged)
    const scrubbingElements = document.querySelectorAll('.animate-with-scrub');
    scrubbingElements.forEach(el => {
        gsap.fromTo(el, { opacity: 0.3, scale: 0.9, rotation: -5 }, {
            opacity: 1, scale: 1, rotation: 0, ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'center center', scrub: 1.5 }
        });
    });

    // --- ENHANCED: Full-Screen 3D Hero Image ---
    const heroImage = document.querySelector('.hero-image');
    let targetRotateX = 0;
    let targetRotateY = 0;

    window.addEventListener('mousemove', (e) => {
        // Map mouse position to a rotation range
        targetRotateX = gsap.utils.mapRange(0, window.innerHeight, -8, 8, e.clientY);
        targetRotateY = gsap.utils.mapRange(0, window.innerWidth, 8, -8, e.clientX);
    });

    // Use GSAP's ticker for a smooth, continuous animation loop
    gsap.ticker.add(() => {
        gsap.to(heroImage, {
            duration: 1.5, // Increase duration for a calmer feel
            rotationX: targetRotateX,
            rotationY: targetRotateY,
            transformPerspective: 1000,
            ease: 'power3.out' // A smooth easing function
        });
    });

    // --- Contact Form Logic (Unchanged) ---
    const form = document.getElementById('contact-form');
    const formWrapper = document.querySelector('.form-wrapper');
    const successMessage = document.querySelector('.form-success');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        formWrapper.classList.add('sending');
        setTimeout(() => {
            formWrapper.classList.remove('sending');
            form.style.display = 'none';
            successMessage.style.display = 'flex';
            gsap.fromTo(successMessage, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
        }, 2000);
    });
});