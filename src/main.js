console.log("Lucid Lens project loaded");

const nav = document.querySelector('.navbar');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    // 1. Handle Hide on Scroll Down / Show on Scroll Up
    if (lastScrollY < window.scrollY && window.scrollY > 100) {
        // Scrolling Down - Hide Nav
        nav.classList.add('navbar--hidden');
    } else {
        // Scrolling Up - Show Nav
        nav.classList.remove('navbar--hidden');
    }

    // 2. Handle Background Change (Solid vs Transparent)
    if (window.scrollY > 50) {
        nav.classList.add('navbar--scrolled');
    } else {
        nav.classList.remove('navbar--scrolled');
    }

    lastScrollY = window.scrollY;
});

