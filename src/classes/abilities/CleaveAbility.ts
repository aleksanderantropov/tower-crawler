import type { Ability } from '../../types/Ability';
import { AbilityType } from '../../types/AbilityType';
import type { Combatant } from '../../types/Combatant';
import type { Coords } from '../Coords';

type CleaveAbilityProps = {
  maxCd: number;
  radius: number;
  damageMultiplier: number;
  getTargets(): Combatant[];
  cd?: number;
  name?: string;
};

export class CleaveAbility implements Ability {
  type = AbilityType.CLEAVE;
  cd: number;
  maxCd: number;
  name: string;
  radius: number;
  damageMultiplier: number;
  getTargets: () => Combatant[];

  constructor({
    maxCd,
    radius,
    damageMultiplier,
    getTargets,
    cd = 0,
    name = 'Круговой удар',
  }: CleaveAbilityProps) {
    this.cd = cd;
    this.maxCd = maxCd;
    this.name = name;
    this.radius = radius;
    this.damageMultiplier = damageMultiplier;
    this.getTargets = getTargets;
  }

  use(user: Combatant): void {
    if (!this.ready) {
      return;
    }

    const damage = Math.floor(user.power * this.damageMultiplier);

    this.getTargets()
      .filter((target) => this.isTargetInRange(user.coords, target.coords))
      .forEach((target) => target.takeDamage(damage));

    this.cd = this.maxCd;
  }

  decreaseCooldown(): void {
    this.cd = Math.max(0, this.cd - 1);
  }

  get ready(): boolean {
    return this.cd === 0;
  }

  private isTargetInRange(userCoords: Coords, targetCoords: Coords): boolean {
    return (
      Math.abs(userCoords.x - targetCoords.x) <= this.radius &&
      Math.abs(userCoords.y - targetCoords.y) <= this.radius
    );
  }
}
