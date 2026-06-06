import type { Coords } from '../classes/Coords';

export interface Motion {
  duration: number;
  isFinished: boolean;
  currentCoords: Coords;
  update(): void;
}
