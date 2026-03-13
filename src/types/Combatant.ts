import type { Enemy } from '../classes/Enemy';

export type Combatant = {
  currentHp: number;
  maxHp: number;
  power: number;
  view: number;
  attack(enemy: Combatant): void;
};
