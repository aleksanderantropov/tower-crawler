import type { EnemyType } from '../types/EnemyType';
import type { Point } from '../types/Point';
import { GameMap } from './GameMap';

export class Enemy {
  x: number;
  y: number;
  type: EnemyType;
  aggroRadius: number;

  constructor({
    x,
    y,
    type,
    aggroRadius,
  }: Point & { type: EnemyType; aggroRadius: number }) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.aggroRadius = aggroRadius;
  }

  moveTowards(point: Point, gameMap: GameMap): void {
    const dx = Math.sign(point.x - this.x);
    const dy = Math.sign(point.y - this.y);

    if (dx && gameMap.isTileWalkable({ x: this.x + dx, y: this.y })) {
      this.x += dx;
    } else if (dy && gameMap.isTileWalkable({ x: this.x, y: this.y + dy })) {
      this.y += dy;
    }
  }

  isWithinAggroRadius(point: Point): boolean {
    const dist = GameMap.calcDistance(this, point);

    return dist <= this.aggroRadius;
  }
}
