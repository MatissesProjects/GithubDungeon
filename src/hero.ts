export interface HeroStats {
  maxHp: number;
  currentHp: number;
  attack: number;
  defense: number;
}

export class Hero {
  public stats: HeroStats;
  public x: number = 0;
  public y: number = 0;

  constructor(magnitude: number) {
    // Stats derived from signature magnitude
    const baseHp = 100 + Math.floor(magnitude / 2);
    const baseAttack = 10 + Math.floor(magnitude / 10);
    const baseDefense = 5 + Math.floor(magnitude / 20);

    this.stats = {
      maxHp: baseHp,
      currentHp: baseHp,
      attack: baseAttack,
      defense: baseDefense,
    };
  }

  public takeDamage(amount: number): void {
    const actualDamage = Math.max(1, amount - this.stats.defense);
    this.stats.currentHp = Math.max(0, this.stats.currentHp - actualDamage);
  }

  public heal(amount: number): void {
    this.stats.currentHp = Math.min(this.stats.maxHp, this.stats.currentHp + amount);
  }

  public isAlive(): boolean {
    return this.stats.currentHp > 0;
  }

  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }
}
