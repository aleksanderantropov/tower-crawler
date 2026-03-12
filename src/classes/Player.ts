import type { Settings } from '../configs/settings';
import type { Combatant } from '../types/Combatant';
import type { Point } from '../types/Point';

export class Player implements Point, Combatant {
  hp: Settings['player']['hp'];
  attack: Settings['player']['attack'];
  view: Settings['player']['view'];
  x: number;
  y: number;

  constructor({ x, y, attack, hp, view }: Point & Settings['player']) {
    this.x = x;
    this.y = y;
    this.attack = attack;
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
}
