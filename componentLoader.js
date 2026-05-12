const components = [
    'components/particles.html',
    'components/loader.html',
    'components/navbar.html',
    'components/hero.html',
    'components/about.html',
    'components/services.html',
    'components/service-web.html',
    'components/service-software.html',
    'components/service-dashboard.html',
    'components/service-uiux.html',
    'components/contact.html',
    'components/social-sidebar.html',
    'components/footer.html'
];

async function initArchitecture() {
    const root = document.getElementById('spa-root');
    // Generamos un timestamp para romper el caché local
    const version = new Date().getTime(); 

    // 1. Cargar e inyectar HTML de forma secuencial sin caché
    for (const file of components) {
        try {
            const response = await fetch(`${file}?v=${version}`);
            const html = await response.text();
            root.insertAdjacentHTML('beforeend', html);
        } catch (error) {
            console.error(`Error cargando el componente HTML: ${file}`, error);
        }
    }

    // 2. Importar el motor JS nativo esquivando el caché de módulos ES6
    try {
        const { initApp } = await import(`./js/main.js?v=${version}`);
        initApp(); 
    } catch (error) {
        console.error("Error inicializando los módulos JS:", error);
    }
}

initArchitecture();