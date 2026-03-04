import { describe, it, expect } from 'vitest';

describe('Simple Frontend Test', () => {
  it('should pass', () => {
    expect(1 + 1).toBe(2);
  });

  it('checks an object structure', () => {
    const data = { name: 'Kael', hp: 12 };
    expect(data).toHaveProperty('name', 'Kael');
    expect(data.hp).toBeGreaterThan(0);
  });
});
