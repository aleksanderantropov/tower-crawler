import type { AbilityType } from './AbilityType';
import type { Combatant } from './Combatant';

export type Ability = {
  type: AbilityType;
  cd: number;
  maxCd: number;
  name: string;
  ready: boolean;
  use(user: Combatant): void;
  decreaseCooldown(): void;
};
