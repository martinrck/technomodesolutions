// main.js - con imports dinámicos versionados anti-caché

export const initApp = async () => {
    // Obtener timestamp único (se genera en cada carga)
    const version = window.APP_VERSION || Date.now();

    // Importar todos los módulos de forma dinámica con el sufijo ?v=version
    const [
        { translations },
        { WebGLEngine, LoaderEngine },
        { switchView },
        { moveSlide, initSlider },
        { initUI, changeLanguage }
    ] = await Promise.all([
        import(`./data/translations.js?v=${version}`),
        import(`./webgl/engine.js?v=${version}`),
        import(`./core/router.js?v=${version}`),
        import(`./core/slider.js?v=${version}`),
        import(`./core/ui.js?v=${version}`)
    ]);

    // 0. Iniciar Motor 3D del Loader
    LoaderEngine.init();

    // 1. Iniciar Motor 3D Principal (Hero)
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

    // 5. Animación de Carga, Destrucción del Loader y Revelación de SPA
    const loader = document.getElementById('loader-wrapper');
    const progressBar = document.getElementById('loader-progress-fill');

    if (loader && progressBar) {
        gsap.to(progressBar, {
            width: "100%",
            duration: 2.5,
            ease: "power2.inOut",
            onComplete: () => {
                gsap.to(loader, { 
                    opacity: 0, 
                    duration: 0.8, 
                    onComplete: () => {
                        loader.style.display = 'none';
                        LoaderEngine.destroy();
                    } 
                });
            }
        });
    } else if (loader) {
        gsap.to(loader, { opacity: 0, duration: 0.5, delay: 0.8, onComplete: () => loader.style.display = 'none' });
    }
};
