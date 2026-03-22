import type { Settings } from '../../configs/settings';
import type { Animation } from '../../types/Animation';
import { AnimationRenderingPhase } from '../../types/AnimationRenderingPhase';
import { AnimationType } from '../../types/AnimationType';
import type { Coords } from '../Coords';

export class DamageNumberAnimation implements Animation {
  duration: number;
  isFinished: boolean;
  phase: AnimationRenderingPhase;
  damage: number;
  opacity: number;
  isTargetPlayer: boolean;
  currentCoords: Coords;
  private initialCoords: Coords;
  private startTime: number;

  constructor({
    coords,
    damage,
    duration,
    isTargetPlayer = false,
  }: {
    coords: Coords;
    damage: number;
    duration: number;
    isTargetPlayer?: boolean;
  }) {
    this.initialCoords = coords.clone();
    this.duration = duration;
    this.damage = damage;

    this.opacity = 0;
    this.currentCoords = this.initialCoords.clone();
    this.isFinished = false;
    this.phase = AnimationRenderingPhase.POST;
    this.startTime = Date.now();
    this.isTargetPlayer = isTargetPlayer;
  }

  render(ctx: CanvasRenderingContext2D, settings: Settings['renderer']): void {
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.isTargetPlayer
      ? settings.colors.animations[AnimationType.DAMAGE_NUMBER].player
      : settings.colors.animations[AnimationType.DAMAGE_NUMBER].enemies;
    ctx.font = settings.text.animations[AnimationType.DAMAGE_NUMBER];
    ctx.textAlign = 'center';
    ctx.fillText(
      this.damage.toString(),
      this.currentCoords.x * settings.tileSize + settings.tileSize / 2,
      this.currentCoords.y * settings.tileSize,
    );
  }

  update(): void {
    const progress = (Date.now() - this.startTime) / this.duration;

    if (progress >= 1) {
      this.isFinished = true;
      return;
    }

    this.currentCoords.y = this.initialCoords.y - progress * 1;
    this.currentCoords.x = this.initialCoords.x + (Math.random() - 0.5) * 0.075;
    this.opacity = 1 - progress;
  }
}
