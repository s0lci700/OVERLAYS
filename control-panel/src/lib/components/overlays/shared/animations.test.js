import { describe, it, expect, vi } from 'vitest';
import {
    fadeInFromBottom,
    fadeOutToTop,
    elasticPop,
    critPop,
    screenFlash,
    shakeElement,
    slideInFromLeft,
} from './animations.js';

vi.mock('animejs', () => ({
    default: vi.fn(),
    set: vi.fn(),
}));

describe('animations', () => {
    const fakeEl = document.createElement('div');

    it('fadeInFromBottom is a function', () => { expect(typeof
        fadeInFromBottom).toBe('function'); });
    it('fadeOutToTop is a function', () => { expect(typeof
        fadeOutToTop).toBe('function'); });
    it('elasticPop is a function', () => { expect(typeof
        elasticPop).toBe('function'); });
    it('critPop is a function', () => { expect(typeof
        critPop).toBe('function'); });
    it('screenFlash is a function', () => { expect(typeof
        screenFlash).toBe('function'); });
    it('shakeElement is a function', () => { expect(typeof
        shakeElement).toBe('function'); });
    it('slideInFromLeft is a function', () => { expect(typeof
        slideInFromLeft).toBe('function'); });

    it('all functions accept an element without throwing', () => {
        expect(() => fadeInFromBottom(fakeEl)).not.toThrow();
        expect(() => fadeOutToTop(fakeEl)).not.toThrow();
        expect(() => elasticPop(fakeEl)).not.toThrow();
        expect(() => critPop(fakeEl)).not.toThrow();
        expect(() => screenFlash(fakeEl, 'red')).not.toThrow();
        expect(() => shakeElement(fakeEl)).not.toThrow();
        expect(() => slideInFromLeft(fakeEl)).not.toThrow();
    });
});