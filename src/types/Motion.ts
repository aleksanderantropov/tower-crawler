import type { Coords } from '../classes/Coords';

export interface Motion {
  unitId: string;
  duration: number;
  isFinished: boolean;
  currentCoords: Coords;
  update(): void;
}
