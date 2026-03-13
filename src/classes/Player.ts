import type { Settings } from '../configs/settings';
import type { Combatant } from '../types/Combatant';
import type { Tile } from '../types/Tile';
import type { Enemy } from './Enemy';

export class Player implements Tile, Combatant {
  currentHp: Settings['player']['hp'];
  maxHp: Settings['player']['hp'];
  power: Settings['player']['power'];
  view: Settings['player']['view'];
  x: number;
  y: number;

  constructor({ x, y, power, hp, view }: Tile & Settings['player']) {
    this.x = x;
    this.y = y;
    this.power = power;
    this.currentHp = hp;
    this.maxHp = hp;
    this.view = view;
  }

  getPos(): Tile {
    return {
      x: this.x,
      y: this.y,
    };
  }

  move({ x, y }: Tile) {
    [this.x, this.y] = [x, y];
  }

  attack(enemy: Enemy): void {
    enemy.currentHp -= this.power;
    console.log(
      `Игрок нанес ${this.power} урон(а) по врагу ${enemy.type}! HP: ${enemy.currentHp}/${enemy.maxHp}`,
    );
  }
}
