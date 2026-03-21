import type { GameInputType } from './GameInputType';

export type GameAction = {
  type: GameInputType;
  payload?: any;
};
