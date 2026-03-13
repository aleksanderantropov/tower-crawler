import type { Enemy } from '../classes/Enemy';

export type Combatant = {
  hp: number;
  power: number;
  view: number;
  attack(enemy: Enemy): void;
};
