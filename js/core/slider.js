export let isAnimating = false;
const AUTOPLAY_DELAY = 8000; 

export const initSlider = (DOM, state, WebGLEngine) => {
    DOM.slides.forEach((slide, index) => {
        const elements = slide.querySelectorAll('.gs-hero-stagger > *');
        if (index !== state.currentSlide) {
            gsap.set(elements, { y: 30, autoAlpha: 0 }); 
            slide.classList.remove('active');
        } else {
            gsap.set(elements, { y: 0, autoAlpha: 1 });
            slide.classList.add('active');
        }
    });

    updateCounters(state.currentSlide);
    startAutoplay(DOM, state, WebGLEngine);
    setupInteractions(DOM, state, WebGLEngine);
};

const updateCounters = (index) => {
    const currentEl = document.getElementById('slider-current-count');
    if (currentEl) currentEl.innerText = `0${index + 1}`;
};

const startAutoplay = (DOM, state, WebGLEngine) => {
    const fill = document.getElementById('slider-progress-fill');
    if (!fill) return;

    gsap.killTweensOf(fill);
    gsap.set(fill, { width: "0%" });
    
    gsap.to(fill, {
        width: "100%", 
        duration: AUTOPLAY_DELAY / 1000, 
        ease: "none",
        onComplete: () => moveSlide(1, DOM, state, WebGLEngine, true) 
    });
};

export const moveSlide = (direction, DOM, state, WebGLEngine, isAuto = false) => {
    if (isAnimating) return;
    isAnimating = true;

    const prevSlide = state.currentSlide;
    let nextSlide = prevSlide + direction;

    if (nextSlide >= state.totalSlides) nextSlide = 0;
    if (nextSlide < 0) nextSlide = state.totalSlides - 1;

    state.currentSlide = nextSlide;
    updateCounters(nextSlide);

    // Reinicia el ciclo de la barra incondicionalmente
    startAutoplay(DOM, state, WebGLEngine);

    const currentDOM = DOM.slides[prevSlide];
    const nextDOM = DOM.slides[nextSlide];
    const currentElements = currentDOM.querySelectorAll('.gs-hero-stagger > *');
    const nextElements = nextDOM.querySelectorAll('.gs-hero-stagger > *');

    if(WebGLEngine && WebGLEngine.changeScene) {
        WebGLEngine.changeScene(nextSlide);
    }

    const tl = gsap.timeline({
        onComplete: () => {
            currentDOM.classList.remove('active');
            isAnimating = false;
        }
    });

    tl.to(currentElements, { 
        y: -30, 
        autoAlpha: 0, 
        duration: 0.8, 
        stagger: 0.05, 
        ease: "power2.inOut" 
    }, 0);

    nextDOM.classList.add('active');
    gsap.set(nextElements, { y: 30, autoAlpha: 0 });

    tl.to(nextElements, { 
        y: 0, 
        autoAlpha: 1, 
        duration: 1.2, 
        stagger: 0.1, 
        ease: "expo.out" 
    }, 0.6); 
};

const setupInteractions = (DOM, state, WebGLEngine) => {
    // Interacciones de Touch (Swipe en celulares)
    let touchStartX = 0;
    document.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX, {passive: true});
    document.addEventListener('touchend', e => {
        let touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 50) moveSlide(1, DOM, state, WebGLEngine);
        if (touchEndX - touchStartX > 50) moveSlide(-1, DOM, state, WebGLEngine);
    }, {passive: true});
};
