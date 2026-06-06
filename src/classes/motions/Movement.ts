import type { Motion } from '../../types/Motion';
import { clamp } from '../../utils/clamp';
import { Coords } from '../Coords';

export class Movement implements Motion {
  unitId: string;
  duration: number;
  isFinished = false;
  currentCoords: Coords;
  private initialCoords: Coords;
  private targetCoords: Coords;
  private startTime = Date.now();

  constructor({
    unitId,
    initialCoords,
    targetCoords,
    duration,
  }: {
    unitId: string;
    initialCoords: Coords;
    targetCoords: Coords;
    duration: number;
  }) {
    this.unitId = unitId;
    this.currentCoords = initialCoords;
    this.initialCoords = initialCoords;
    this.targetCoords = targetCoords;
    this.duration = duration;
  }

  update(): void {
    if (this.isFinished) {
      return;
    }

    const progress = clamp((Date.now() - this.startTime) / this.duration, 0, 1);

    if (progress === 1) {
      this.isFinished = true;
    }

    const intermediateX =
      (this.targetCoords.x - this.initialCoords.x) * progress +
      this.initialCoords.x;
    const intermediateY =
      (this.targetCoords.y - this.initialCoords.y) * progress +
      this.initialCoords.y;

    this.currentCoords = new Coords(intermediateX, intermediateY);
  }
}
