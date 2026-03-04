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
export function getConditionClasses(conditions) {
    if (!conditions?.length) return '';
    return conditions
        .map(c => CONDITION_EFFECTS[c.condition_name.toLowerCase()])
        .filter(Boolean)
        .map(e => e.cssClass)
        .join(' ');
}