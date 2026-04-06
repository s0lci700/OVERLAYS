export type WheelHandler = (e: WheelEvent) => void;


export function boundValue(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}
/**
 * Creates a wheel event handler for incrementing/decrementing values within bounds.
 * @param get Function to retrieve the current value.
 * @param set Function to set the new value.
 * @param min Minimum allowed value.
 * @param max Maximum allowed value.
 * @param afterSet Optional function to execute after the value is set.
 * @returns A wheel event handler that adjusts the value based on scroll direction, respecting the specified bounds.
 * @type {WheelHandler} A function to handle wheel events for adjusting values.
 * @example
 * const diceCountHandler = makeWheelHandler(
 *  () => dice.count,
 * (newValue) => dice.count = newValue,
 * 1, 20,
 * (newValue) => { if (newValue === 0) dice.count = null; }
 * );
 */
export function makeWheelHandler(
	get: () => number,
	set: (value: number) => void,
	min: number,
	max: number,
	afterSet?: (newValue: number) => void
): WheelHandler {
	return (e) => {
		e.preventDefault();
		const next = boundValue(get() - Math.sign(e.deltaY), min, max);
        set(next);
        afterSet?.(next);
	};
}

// function handleWheel(e: WheelEvent, key: 'count' | 'modifier' | 'result') {
// 		e.preventDefault();
// 		if (key === 'result') {
// 			dice[key] = boundValue(dice[key] - Math.sign(e.deltaY), 0, 20);
// 			if (dice[key] === 0) dice[key] = null; // allow scrolling down to clear the result
// 		} else {
// 			dice[key] = boundValue(dice[key] - Math.sign(e.deltaY), 1, 20);
// 		}
// 	}