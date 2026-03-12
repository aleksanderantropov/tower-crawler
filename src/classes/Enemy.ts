import type { Settings } from '../configs/settings';
import type { Combatant } from '../types/Combatant';
import type { EnemyType } from '../types/EnemyType';
import type { Point } from '../types/Point';
import { GameMap } from './GameMap';

export class Enemy implements Point, Combatant {
  x: number;
  y: number;
  type: Settings['enemies'][EnemyType]['type'];
  view: Settings['enemies'][EnemyType]['view'];
  attack: Settings['enemies'][EnemyType]['attack'];
  hp: Settings['enemies'][EnemyType]['hp'];

  constructor({
    x,
    y,
    type,
    view,
    attack,
    hp,
  }: Point & Settings['enemies'][EnemyType]) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.view = view;
    this.attack = attack;
    this.hp = hp;
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

    return dist <= this.view;
  }
}
