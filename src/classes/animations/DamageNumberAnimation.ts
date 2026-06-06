import type { Settings } from '../../configs/settings';
import type { Animation } from '../../types/Animation';
import { AnimationRenderingPhase } from '../../types/AnimationRenderingPhase';
import { AnimationType } from '../../types/AnimationType';
import { clamp } from '../../utils/clamp';
import type { Coords } from '../Coords';

export class DamageNumberAnimation implements Animation {
  duration: number;
  damage: number;
  isTargetPlayer: boolean;
  currentCoords: Coords;
  opacity = 0;
  isFinished = false;
  phase = AnimationRenderingPhase.POST;
  private startTime = Date.now();
  private initialCoords: Coords;

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
    this.duration = duration;
    this.damage = damage;
    this.initialCoords = coords.clone();
    this.currentCoords = this.initialCoords.clone();
    this.isTargetPlayer = isTargetPlayer;
  }

  render(ctx: CanvasRenderingContext2D, settings: Settings['renderer']): void {
    ctx.globalAlpha = this.opacity;
    const config = settings.animations[AnimationType.DAMAGE_NUMBER];
    const tileSize = settings.world.tileSize;
    ctx.fillStyle = this.isTargetPlayer
      ? config.colors.player
      : config.colors.enemies;
    ctx.font = config.text;
    ctx.textAlign = 'center';
    ctx.fillText(
      this.damage.toString(),
      this.currentCoords.x * tileSize + tileSize / 2,
      this.currentCoords.y * tileSize,
    );
  }

  update(): void {
    if (this.isFinished) {
      return;
    }

    const progress = clamp((Date.now() - this.startTime) / this.duration, 0, 1);

    if (progress === 1) {
      this.isFinished = true;
    }

    this.currentCoords.y = this.initialCoords.y - progress * 1;
    this.currentCoords.x = this.initialCoords.x + (Math.random() - 0.5) * 0.075;
    this.opacity = 1 - progress;
  }
}
