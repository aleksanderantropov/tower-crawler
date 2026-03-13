import type { Settings } from '../configs/settings';
import type { Combatant } from '../types/Combatant';
import type { Point } from '../types/Point';
import type { Enemy } from './Enemy';

export class Player implements Point, Combatant {
  hp: Settings['player']['hp'];
  power: Settings['player']['power'];
  view: Settings['player']['view'];
  x: number;
  y: number;

  constructor({ x, y, power, hp, view }: Point & Settings['player']) {
    this.x = x;
    this.y = y;
    this.power = power;
    this.hp = hp;
    this.view = view;
  }

  getPos(): Point {
    return {
      x: this.x,
      y: this.y,
    };
  }

  move({ x, y }: Point) {
    [this.x, this.y] = [x, y];
  }

  attack(enemy: Enemy): void {
    enemy.hp -= this.power;
    console.log(`Удар! Осталось HP: ${enemy.hp}`);
  }
}
