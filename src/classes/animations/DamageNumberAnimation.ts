import type { Animation } from '../../types/Animation';
import type { Coords } from '../Coords';

export class DamageNumberAnimation implements Animation {
  duration: number;
  isFinished: boolean;
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
    this.startTime = Date.now();
    this.isTargetPlayer = isTargetPlayer;
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
