import { translations } from './data/translations.js';
import { WebGLEngine } from './webgl/engine.js';
import { switchView } from './core/router.js';
import { moveSlide, initSlider } from './core/slider.js';
import { initUI, changeLanguage } from './core/ui.js';

export const initApp = () => {
    // 1. Iniciar Motor 3D
    WebGLEngine.init(); 

    // 2. Registrar Árbol DOM Local
    const DOM = {
        views: document.querySelectorAll('.view-section'),
        slides: document.querySelectorAll('.slide'),
        i18nElements: document.querySelectorAll('[data-i18n]'),
        langBtns: document.querySelectorAll('.lang-btn'),
        themeSwitch: document.querySelector('.theme-switch input[type="checkbox"]'),
        navLinks: document.getElementById('nav-links'),
        hamburger: document.getElementById('hamburger'),
        socialSidebar: document.querySelector('.social-sidebar'),
        logo: document.querySelector('.logo')
    };

    const state = { currentSlide: 0, totalSlides: DOM.slides.length };

    // 3. Inicializar Módulos de Componentes
    initSlider(DOM, state, WebGLEngine);
    initUI(DOM, translations);

    // 4. Delegación de Eventos Globales (Routing y Acciones)
    document.body.addEventListener('click', (e) => {
        const viewBtn = e.target.closest('[data-action="switch-view"]');
        if (viewBtn) {
            e.preventDefault();
            switchView(viewBtn.dataset.target, DOM);
        }

        const langBtn = e.target.closest('[data-action="change-lang"]');
        if (langBtn) changeLanguage(langBtn.dataset.lang, DOM, translations);

        const slideBtn = e.target.closest('[data-action="move-slide"]');
        if (slideBtn) moveSlide(parseInt(slideBtn.dataset.dir), DOM, state, WebGLEngine);
    });

    if (DOM.hamburger) {
        DOM.hamburger.addEventListener('click', () => DOM.navLinks.classList.toggle('active'));
    }

    // 5. Destrucción del Loader y Revelación de SPA (Se ejecuta inmediatamente porque el componente Loader ya hizo fetch de la inyección)
    const loader = document.getElementById('loader-wrapper');
    if (loader) {
        gsap.to(loader, { opacity: 0, duration: 0.5, delay: 0.8, onComplete: () => loader.style.display = 'none' });
    }
};
