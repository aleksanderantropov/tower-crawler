import type { Settings } from '../configs/settings';
import type { Combatant } from '../types/Combatant';
import type { EnemyType } from '../types/EnemyType';
import type { Point } from '../types/Point';
import { Map } from './Map';

export class Enemy implements Point, Combatant {
  x: number;
  y: number;
  type: Settings['enemies'][EnemyType]['type'];
  view: Settings['enemies'][EnemyType]['view'];
  power: Settings['enemies'][EnemyType]['power'];
  hp: Settings['enemies'][EnemyType]['hp'];

  constructor({
    x,
    y,
    type,
    view,
    power,
    hp,
  }: Point & Settings['enemies'][EnemyType]) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.view = view;
    this.power = power;
    this.hp = hp;
  }
  attack(enemy: Enemy): void {
    throw new Error('Method not implemented.');
  }

  moveTowards(point: Point, gameMap: Map): void {
    const dx = Math.sign(point.x - this.x);
    const dy = Math.sign(point.y - this.y);

    if (dx && gameMap.isTileWalkable({ x: this.x + dx, y: this.y })) {
      this.x += dx;
    } else if (dy && gameMap.isTileWalkable({ x: this.x, y: this.y + dy })) {
      this.y += dy;
    }
  }

  isWithinAggroRadius(point: Point): boolean {
    const dist = Map.calcDistance(this, point);

    return dist <= this.view;
  }
}
