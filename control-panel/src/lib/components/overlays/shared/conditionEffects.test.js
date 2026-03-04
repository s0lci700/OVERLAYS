import { describe, it, expect } from 'vitest';
import { getConditionClasses, CONDITION_EFFECTS } from
        './conditionEffects.js';

describe('conditionEffects', () => {
    it('returns empty string for no conditions', () => {
        expect(getConditionClasses([])).toBe('');
    });

    it('returns the css class for a known condition', () => {
        expect(getConditionClasses([{ condition_name: 'Poisoned'
        }])).toContain('is-poisoned');
    });

    it('is case-insensitive', () => {
        expect(getConditionClasses([{ condition_name: 'POISONED'
        }])).toContain('is-poisoned');
    });

    it('stacks multiple condition classes', () => {
        const result = getConditionClasses([
            { condition_name: 'Poisoned' },
            { condition_name: 'Frightened' },
        ]);
        expect(result).toContain('is-poisoned');
        expect(result).toContain('is-frightened');
    });

    it('unknown condition produces no class (no crash)', () => {
        expect(getConditionClasses([{ condition_name: 'Flibbertigibbet'
        }])).toBe('');
    });


    it('CONDITION_EFFECTS exports an object with priority fields', () => {
        expect(CONDITION_EFFECTS.poisoned).toHaveProperty('cssClass',
            'is-poisoned');
        expect(CONDITION_EFFECTS.poisoned).toHaveProperty('priority');
        expect(CONDITION_EFFECTS.unconscious.priority).toBeGreaterThan(CONDITION_EFFECTS.poisoned.priority);
    });
});