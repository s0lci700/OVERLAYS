import { animate, utils } from 'animejs';

export const fadeInFromBottom  = (el, ms=400)       => el && animate(el, { opacity:[0,1], translateY:[40,0], duration:ms, ease:'outQuad' });
export const fadeOutToTop      = (el, ms=350, done)  => el && animate(el, { opacity:[1,0], translateY:[0,-20], duration:ms, ease:'inQuad', onComplete:done });
export const elasticPop        = (el, scale=1.15)    => el && animate(el, { opacity:[0,1], scale:[0.3,scale,1], duration:600, ease:'outElastic(1,.5)' });
export const critPop           = (el)                => el && animate(el, { opacity:[0,1], scale:[0.2,1.45,1], duration:800, ease:'outElastic(1,.5)' });
export const shakeElement      = (el)                => el && animate(el, { translateX:[0,-14,14,-9,9,-5,5,0], duration:520, ease:'inOutSine' });
export const slideInFromLeft   = (el, ms=500)        => el && animate(el, { opacity:[0,1], translateX:[-60,0], duration:ms, ease:'outExpo' });
export const slideOutToLeft    = (el, ms=400, done)  => el && animate(el, { opacity:[1,0], translateX:[0,-60], duration:ms, ease:'inExpo', onComplete:done });
export const stripSlideIn      = (el)                => el && animate(el, { translateY:[80,0], opacity:[0,1], duration:600, ease:'outExpo' });
export const stripSlideOut     = (el, done)          => el && animate(el, { translateY:[0,80], opacity:[1,0], duration:400, ease:'inExpo', onComplete:done });

export function screenFlash(el, color, ms=450) {
    if (!el) return;
    el.style.background = color;
    animate(el, { opacity:[0, 0.75, 0], duration:ms, ease:'inOutQuad' });
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