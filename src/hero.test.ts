import { Hero } from './hero';

describe('Hero', () => {
  test('should initialize stats based on magnitude', () => {
    const hero = new Hero(100);
    expect(hero.stats.maxHp).toBe(150);
    expect(hero.stats.attack).toBe(20);
    expect(hero.stats.defense).toBe(10);
  });

  test('should take damage correctly', () => {
    const hero = new Hero(0);
    const initialHp = hero.stats.currentHp;
    hero.takeDamage(20);
    // base defense for 0 commits is 5. damage is 20 - 5 = 15.
    expect(hero.stats.currentHp).toBe(initialHp - 15);
  });

  test('should not have negative HP', () => {
    const hero = new Hero(0);
    hero.takeDamage(200);
    expect(hero.stats.currentHp).toBe(0);
    expect(hero.isAlive()).toBe(false);
  });

  test('should heal correctly', () => {
    const hero = new Hero(0);
    hero.takeDamage(50);
    const hpAfterDamage = hero.stats.currentHp;
    hero.heal(20);
    expect(hero.stats.currentHp).toBe(hpAfterDamage + 20);
    hero.heal(100);
    expect(hero.stats.currentHp).toBe(hero.stats.maxHp);
  });
});
