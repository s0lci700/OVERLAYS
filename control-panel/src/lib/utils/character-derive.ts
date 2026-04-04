export const SKILL_ABILITY: Record<string, string> = {
    athletics: 'str',
    acrobatics: 'dex', sleight_of_hand: 'dex', stealth: 'dex',
    arcana: 'int', history: 'int', investigation: 'int', nature: 'int', religion: 'int',
    animal_handling: 'wis', insight: 'wis', medicine: 'wis', perception: 'wis', survival: 'wis',
    deception: 'cha', intimidation: 'cha', performance: 'cha', persuasion: 'cha'
};

export const SKILL_LABELS: Record<string, string> = {
    athletics: 'Atletismo',
    acrobatics: 'Acrobacias',
    sleight_of_hand: 'Juego de Manos',
    stealth: 'Sigilo',
    arcana: 'Arcanos',
    history: 'Historia',
    investigation: 'Investigación',
    nature: 'Naturaleza',
    religion: 'Religión',
    animal_handling: 'Trato con Animales',
    insight: 'Perspicacia',
    medicine: 'Medicina',
    perception: 'Percepción',
    survival: 'Supervivencia',
    deception: 'Engaño',
    intimidation: 'Intimidación',
    performance: 'Interpretación',
    persuasion: 'Persuasión'
};

export const SKILLS_BY_ABILITY: Record<string, string[]> = {
    str: ['athletics'],
    dex: ['acrobatics', 'sleight_of_hand', 'stealth'],
    con: [],
    int: ['arcana', 'history', 'investigation', 'nature', 'religion'],
    wis: ['animal_handling', 'insight', 'medicine', 'perception', 'survival'],
    cha: ['deception', 'intimidation', 'performance', 'persuasion']
};

export const ABILITIES = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
export type Ability = typeof ABILITIES[number];

export const ABILITY_LABELS: Record<string, string> = {
		str: 'FUE', dex: 'DES', con: 'CON', int: 'INT', wis: 'SAB', cha: 'CAR'
	};



export function computeAbilityModifier(
    score: number): number {
    return Math.floor((score - 10) / 2);
}

export function computeSavingThrow(
    ability_mod: number,
    proficiency: boolean,
    proficiencyBonus: number) : number {
    return ability_mod + (proficiency ? proficiencyBonus : 0);
}

/*
prof + exp doubles the proficiency bonus when both are true, 
which is right (expertise = 2× bonus). 
But if a caller ever passes 
expertise: true, proficiency: false (bad data), 
the result is wrong. 
Since CharacterRecord doesn't enforce that expertise 
implies proficiency, the function is relying on the caller 
to get that right. Not a blocker, just worth knowing.
*/
export function computeSkillTotal(
    ability_mod: number,
    proficiency: boolean,
    expertise: boolean,
    proficiencyBonus: number) : number {
    const prof = proficiency ? proficiencyBonus : 0;
    const exp = expertise ? proficiencyBonus : 0;
    return ability_mod + prof + exp;
}

export function computePassive(
    skill_total: number) : number {
    return 10 + skill_total;
}