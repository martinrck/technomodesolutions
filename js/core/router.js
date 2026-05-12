let isTransitioning = false;

export const switchView = (viewId, DOM) => {
    if (isTransitioning) return;
    const targetView = document.getElementById(viewId);
    if (!targetView || targetView.classList.contains('active-view')) return;

    isTransitioning = true;
    const currentView = document.querySelector('.active-view');

    // Control barra lateral
    if (DOM.socialSidebar) {
        if (viewId === 'contacto') {
            gsap.to(DOM.socialSidebar, { x: 50, opacity: 0, duration: 0.3, ease: "power2.in", onComplete: () => DOM.socialSidebar.style.visibility = 'hidden' });
        } else {
            DOM.socialSidebar.style.visibility = 'visible';
            gsap.to(DOM.socialSidebar, { x: 0, opacity: 1, duration: 0.4, ease: "power2.out", delay: 0.2 });
        }
    }

    // Transición OUT
    gsap.to(currentView, {
        opacity: 0, y: -15, duration: 0.25, ease: "power2.inOut",
        onComplete: () => {
            DOM.views.forEach(view => {
                view.classList.remove('active-view');
                view.style.display = 'none';
                gsap.set(view, { clearProps: "all" }); 
            });
            
            targetView.style.display = 'flex'; 
            targetView.classList.add('active-view');
            
            const scrollArea = targetView.querySelector('.detail-scroll-area') || targetView.querySelector('.contact-board') || targetView.querySelector('.service-premium-board') || targetView.querySelector('.about-premium-board');
            if(scrollArea) scrollArea.scrollTop = 0;
            window.scrollTo(0, 0);

            const staggers = targetView.querySelectorAll('.gs-stagger, .hub-poster, .tech-card, .feature-box');
            
            // Transición IN
            gsap.fromTo(targetView, 
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", onComplete: () => isTransitioning = false }
            );

            if(staggers.length > 0) {
                gsap.fromTo(staggers,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
                );
            }
        }
    });
    
    if (window.innerWidth <= 900 && DOM.navLinks) {
        DOM.navLinks.classList.remove('active');
    }
};