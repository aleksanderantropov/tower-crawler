import type { Settings } from '../../configs/settings';
import type { Animation } from '../../types/Animation';
import { AnimationRenderingPhase } from '../../types/AnimationRenderingPhase';
import { AnimationType } from '../../types/AnimationType';
import type { Coords } from '../Coords';

export class HitFlashAnimation implements Animation {
  coords: Coords;
  duration: number;
  opacity = 1;
  isFinished = false;
  phase = AnimationRenderingPhase.POST;
  private startTime = Date.now();

  constructor({ coords, duration }: { coords: Coords; duration: number }) {
    this.coords = coords;
    this.duration = duration;
  }

  update(): void {
    const progress = (Date.now() - this.startTime) / this.duration;

    if (progress >= 1) {
      this.isFinished = true;
      return;
    }

    this.opacity = 1 - progress;
  }

  render(ctx: CanvasRenderingContext2D, settings: Settings['renderer']): void {
    const defaultOpacity = ctx.globalAlpha;
    const tileSize = settings.world.tileSize;

    ctx.globalAlpha = this.opacity;
    ctx.fillStyle =
      settings.animations[AnimationType.HIT_FLASH_ANIMATION].color;
    ctx.fillRect(
      this.coords.x * tileSize + 4,
      this.coords.y * tileSize + 4,
      tileSize - 8,
      tileSize - 8,
    );

    ctx.globalAlpha = defaultOpacity;
  }
}
