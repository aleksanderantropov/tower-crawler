import type { Coords } from '../classes/Coords';

export type Combatant = {
  currentHp: number;
  maxHp: number;
  power: number;
  viewRadius: number;
  coords: Coords;
  attack(enemy: Combatant): void;
  move(coords: Coords): void;
  takeDamage(damage: number): void;
};
