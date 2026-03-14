/*
Source Of Truth: API-resolved dice result event
Owned by: Stage (DM only if explicitly enabled)
Mirrored to: Audience result overlay + Commons compact highlight + operator history
*/

/* Dice Result Event

Fields:

- roll_type
- dice_results
- selected_die
- total
- target
- outcome
- critical

Represents ONE resolved test. */


export type RollType = 'ability_check' | 'saving_throw' 
| 'attack_roll' | 'death_save' | 'skill_check' | 'initiative_roll';

export type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

export type RollOutcome = 'success' | 'failure' 
| 'critical_success' | 'critical_failure';


export interface DiceResultPayload {
    rollType: RollType;
    diceType: DiceType;
    rolledDice: number[] | number; // Can be an array for multiple dice or a single number for flat rolls
    selectedDie: number; // The die that counts towards the final result (after advantage/disadvantage)
    modifier?: number;
    total: number;
    // targetType:
    targetValue?: number; // Optional, only for rolls that have a target number
    outcome: RollOutcome;
    criticalState: boolean;
}