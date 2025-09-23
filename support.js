document.addEventListener('DOMContentLoaded', function () {

    // --- Reusable Particle.js Background ---
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
        interactivity: { detect_on: "canvas", events: { onhover: { enable: true, mode: "push" }, onclick: { enable: true, mode: "push" }, resize: true }, modes: { push: { particles_nb: 4 } } },
        retina_detect: true
    });

    // --- Hamburger Menu Logic (reused) ---
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

    // --- FAQ Accordion Logic (reused) ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            if (!isActive) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    });

    // --- Support Form Logic ---
    const form = document.getElementById('support-form');
    const formContainer = document.querySelector('.form-container');
    const formWrapper = document.querySelector('.form-wrapper');
    const successMessage = document.querySelector('.form-success');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        formWrapper.classList.add('sending');
    
        const serviceID = 'service_tf010rz'; 
        const templateID = 'template_vap8q3h'; 
        const publicKey = 'Xc_6XWChYs1z1uehh'; 
    
        emailjs.sendForm(serviceID, templateID, this, publicKey)
            .then(() => {
                formWrapper.classList.remove('sending');
                form.style.display = 'none';
                successMessage.style.display = 'flex';
                formContainer.classList.add('form-success-glow'); // Re-use the cool success glow
            }, (err) => {
                formWrapper.classList.remove('sending');
                alert('Message failed to send. Please try again. Error: ' + JSON.stringify(err));
            });
    });
});