import type { Animation } from '../../types/Animation';
import { AnimationRenderingPhase } from '../../types/AnimationRenderingPhase';
import { Coords } from '../Coords';

export class ShakeAnimation implements Animation {
  duration: number;
  isFinished = false;
  phase = AnimationRenderingPhase.PRE;
  private offset = new Coords(0, 0);
  private startTime = Date.now();

  constructor({ duration }: { duration: number }) {
    this.duration = duration;
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.translate(this.offset.x, this.offset.y);
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
