export const changeLanguage = (lang, DOM, translations) => {
    DOM.i18nElements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            if (element.tagName !== 'INPUT' && element.tagName !== 'TEXTAREA') {
                element.innerHTML = translations[lang][key];
            }
        }
    });
    DOM.langBtns.forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`.lang-btn[data-lang="${lang}"]`);
    if (activeBtn) activeBtn.classList.add('active');
};

export const initUI = (DOM, translations) => {
    // Theme setup
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'light' && DOM.themeSwitch) DOM.themeSwitch.checked = true;
    }

    if (DOM.themeSwitch) {
        DOM.themeSwitch.addEventListener('change', (e) => {
            const newTheme = e.target.checked ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // GSAP Micro-Interacción Logo (3D Tilt Minimalista)
    if(DOM.logo) {
        DOM.logo.addEventListener('mousemove', (e) => {
            const rect = DOM.logo.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
            const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
            gsap.to(DOM.logo, { rotationY: x * 8, rotationX: -y * 8, transformPerspective: 500, duration: 0.4, ease: "power2.out" });
        });
        DOM.logo.addEventListener('mouseleave', () => {
            gsap.to(DOM.logo, { rotationY: 0, rotationX: 0, duration: 0.7, ease: "power2.out" });
        });
    }

    // GSAP Hovers en Botones Principales y Cards
    document.querySelectorAll('.cta-button, .nav-btn, .dropbtn, .int-social-btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => gsap.to(btn, { scale: 1.03, duration: 0.3, ease: "power2.out" }));
        btn.addEventListener('mouseleave', () => gsap.to(btn, { scale: 1, duration: 0.3, ease: "power2.out" }));
    });

    // GSAP Animación Premium para Barra Social Flotante
    document.querySelectorAll('.social-sidebar .social-link').forEach(link => {
        const icon = link.querySelector('svg');
        
        link.addEventListener('mouseenter', () => {
            if (window.innerWidth > 900) {
                gsap.to(link, { 
                    width: 55, right: 0, backgroundColor: "rgba(229, 141, 46, 0.05)", 
                    borderColor: "rgba(229, 141, 46, 0.3)", duration: 0.3, ease: "power2.out" 
                });
            }
            if (icon) {
                gsap.to(icon, { scale: 1.35, color: "#E58D2E", duration: 0.4, ease: "back.out(1.5)" });
            }
        });

        link.addEventListener('mouseleave', () => {
            if (window.innerWidth > 900) {
                gsap.to(link, { 
                    width: 45, right: -4, duration: 0.3, ease: "power2.out",
                    clearProps: "width,right,backgroundColor,borderColor"
                });
            }
            if (icon) {
                gsap.to(icon, { scale: 1, duration: 0.3, ease: "power2.out", clearProps: "color" });
            }
        });
    });
};