// --- Initialize Particles.js ---
particlesJS("particles-js", {
  particles: {
    number: { value: 60, density: { enable: true, value_area: 800 } },
    color: { value: "#E2C65E" },
    shape: { type: "circle" },
    opacity: { value: 0.4, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } },
    size: { value: 3, random: true, anim: { enable: false } },
    line_linked: { enable: false },
    move: { enable: true, speed: 1, direction: "none", random: true, straight: false, out_mode: "out", bounce: false }
  },
  interactivity: {
    detect_on: "canvas",
    events: { onhover: { enable: true, mode: "grab" }, onclick: { enable: false } },
    modes: {
      grab: { distance: 140, line_opacity: 0.5 },
      bubble: {}, repulse: {}, remove: {}
    }
  },
  retina_detect: true
});

// --- 3D Card Tilt Effect ---
const card = document.querySelector('.card');
const container = document.querySelector('.container');

container.addEventListener('mousemove', (e) => {
    let xAxis = (window.innerWidth / 2 - e.pageX) / 25;
    let yAxis = (window.innerHeight / 2 - e.pageY) / 25;
    card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
});

// --- Reset Animation on Mouse Leave ---
container.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateY(0deg) rotateX(0deg)';
    card.style.transition = 'transform 0.5s ease';
});

// --- Pop In Animation on Mouse Enter ---
container.addEventListener('mouseenter', () => {
    card.style.transition = 'none';
});