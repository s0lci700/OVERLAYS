import anime from 'animejs';

export const fadeInFromBottom  = (el, ms=400)       => el && anime({ targets:el, opacity:[0,1], translateY:[40,0], duration:ms, easing:'easeOutQuad' });
export const fadeOutToTop      = (el, ms=350, done)  => el && anime({ targets:el, opacity:[1,0], translateY:[0,-20], duration:ms, easing:'easeInQuad', complete:done });
export const elasticPop        = (el, scale=1.15)    => el && anime({ targets:el, opacity:[0,1], scale:[0.3,scale,1], duration:600, easing:'easeOutElastic(1,.5)' });
export const critPop           = (el)                => el && anime({ targets:el, opacity:[0,1], scale:[0.2,1.45,1], duration:800, easing:'easeOutElastic(1,.5)' });
export const shakeElement      = (el)                => el && anime({ targets:el, translateX:[0,-14,14,-9,9,-5,5,0], duration:520, easing:'easeInOutSine' });
export const slideInFromLeft   = (el, ms=500)        => el && anime({ targets:el, opacity:[0,1], translateX:[-60,0], duration:ms, easing:'easeOutExpo' });
export const slideOutToLeft    = (el, ms=400, done)  => el && anime({ targets:el, opacity:[1,0], translateX:[0,-60], duration:ms, easing:'easeInExpo', complete:done });
export const stripSlideIn      = (el)                => el && anime({ targets:el, translateY:[80,0], opacity:[0,1], duration:600, easing:'easeOutExpo' });
export const stripSlideOut     = (el, done)          => el && anime({ targets:el, translateY:[0,80], opacity:[1,0], duration:400, easing:'easeInExpo', complete:done });

export function screenFlash(el, color, ms=450) {
    if (!el) return;
    el.style.background = color;
    anime({ targets:el, opacity:[0, 0.75, 0], duration:ms, easing:'easeInOutQuad' });
}

export function typewriterReveal(el, text, cps=30) {
    if (!el) return Promise.resolve();
    return new Promise(resolve => {
        let i = 0;
        el.textContent = '';
        const t = setInterval(() => {
            el.textContent += text[i++];
            if (i >= text.length) { clearInterval(t); resolve(); }
        }, 1000/cps);
    });
}