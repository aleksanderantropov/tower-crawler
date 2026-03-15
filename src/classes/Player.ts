import type { Settings } from '../configs/settings';
import type { Combatant } from '../types/Combatant';
import { Coords } from './Coords';
import type { Enemy } from './Enemy';

export class Player implements Combatant {
  currentHp: Settings['player']['hp'];
  maxHp: Settings['player']['hp'];
  power: Settings['player']['power'];
  view: Settings['player']['view'];
  coords: Coords;

  constructor({
    coords,
    power,
    hp,
    view,
  }: { coords: Coords } & Settings['player']) {
    this.coords = coords;
    this.power = power;
    this.currentHp = hp;
    this.maxHp = hp;
    this.view = view;
  }

  move(coords: Coords) {
    this.coords = coords;
  }

  attack(enemy: Enemy): void {
    enemy.currentHp -= this.power;
    console.log(
      `Игрок нанес ${this.power} урон(а) по врагу ${enemy.type}! HP: ${enemy.currentHp}/${enemy.maxHp}`,
    );
  }
}
