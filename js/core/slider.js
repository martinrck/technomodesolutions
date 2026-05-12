export const moveSlide = (direction, DOM, state, WebGLEngine) => {
    let nextSlide = (state.currentSlide + direction + state.totalSlides) % state.totalSlides;
    
    WebGLEngine.playHeroTransition(state.currentSlide, nextSlide);

    DOM.slides[state.currentSlide].classList.remove('active');
    DOM.slides[nextSlide].classList.add('active');
    
    state.currentSlide = nextSlide;
};

export const initSlider = (DOM, state, WebGLEngine) => {
    if (state.totalSlides > 0) {
        setInterval(() => moveSlide(1, DOM, state, WebGLEngine), 6000);
    }
};