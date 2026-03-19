import type { Animation } from '../../types/Animation';
import { Coords } from '../Coords';

export class ShakeAnimation implements Animation {
  isFinished: boolean;
  duration: number;
  offset: Coords;
  private startTime: number;

  constructor({ duration }: { duration: number }) {
    this.isFinished = false;
    this.duration = duration;
    this.offset = new Coords(0, 0);
    this.startTime = Date.now();
  }

  update(): void {
    if (this.checkHasFinished()) {
      this.isFinished = true;
      this.reset();
      return;
    }

    this.offset.x = (Math.random() - 0.5) * 10;
    this.offset.y = (Math.random() - 0.5) * 10;
  }

  private checkHasFinished(): boolean {
    return this.startTime + this.duration <= Date.now();
  }

  private reset(): void {
    this.offset = new Coords(0, 0);
  }
}
