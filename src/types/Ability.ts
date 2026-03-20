import type { Combatant } from './Combatant';
import type { Direction } from './Direction';

export type Ability = {
  cd: number;
  maxCd: number;
  name: string;
  ready: boolean;
  use(target: Combatant, direction: Direction): void;
  decreaseCooldown(): void;
};
