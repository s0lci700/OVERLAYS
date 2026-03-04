/**
* conditionEffects
*
* Purpose:
* Provide a single source of truth for mapping condition names to visual effects
* (CSS classes), and a helper for turning a character's active conditions into a
* space-separated class string suitable for an element's `class=""` attribute.
*/

/**
 * Map of condition name (lowercase) -> visual effect metadata.
 *
 * @typedef {object} ConditionEffect
 * @property {string} cssClass - CSS class to apply for this condition (e.g. "is-poisoned").
 * @property {number} priority - Higher means "stronger" visual precedence when multiple apply.
 */

/**
 * Condition effect lookup table keyed by lowercase condition name.
 *
 * @type {Record<string, ConditionEffect>}
 */
export const CONDITION_EFFECTS = {
    unconscious: { cssClass: 'is-unconscious', priority: 10 },
    paralyzed:   { cssClass: 'is-paralyzed',   priority: 9  },
    petrified:   { cssClass: 'is-petrified',   priority: 9  },
    stunned:     { cssClass: 'is-stunned',     priority: 7  },
    poisoned:    { cssClass: 'is-poisoned',    priority: 5  },
    burning:     { cssClass: 'is-burning',     priority: 5  },
    frozen:      { cssClass: 'is-frozen',      priority: 5  },
    frightened:  { cssClass: 'is-frightened',  priority: 4  },
    cursed:      { cssClass: 'is-cursed',      priority: 4  },
    charmed:     { cssClass: 'is-charmed',     priority: 3  },
    blinded:     { cssClass: 'is-blinded',     priority: 3  },
    invisible:   { cssClass: 'is-invisible',   priority: 2  },
    prone:       { cssClass: 'is-prone',       priority: 1  },
};

// Takes the character.conditions array, returns CSS class string.
// e.g. [{ condition_name: "Poisoned" }] → "is-poisoned"
/**
 * Convert an array of condition objects into a space-separated list of CSS classes.
 *
 * Behavior:
 * - Case-insensitive lookup (condition names are normalized to lowercase).
 * - Unknown conditions are ignored (no output, no crash).
 * - Returns `""` when `conditions` are missing or empty.
 *
 * @param {Array<{ condition_name: string }>|null|undefined} conditions
 * @returns {string}
 */
export function getConditionClasses(conditions) {
    if (!conditions?.length) return '';
    return conditions
        .map(c => CONDITION_EFFECTS[c.condition_name.toLowerCase()])
        .filter(Boolean)
        .map(e => e.cssClass)
        .join(' ');
}