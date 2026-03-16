import type { Settings } from '../configs/settings';
import type { Combatant } from '../types/Combatant';
import { ItemType } from '../types/ItemType';
import { Coords } from './Coords';
import type { Enemy } from './Enemy';
import type { Item } from './Item';

export class Player implements Combatant {
  currentHp: number;
  maxHp: number;
  power: number;
  view: number;
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

  heal(hp: number): void {
    this.currentHp = Math.min(this.maxHp, hp + this.currentHp);
  }

  use(item: Item): void {
    console.log(`Вы подобрали ${item.name} (+${item.effectValue}).`);

    switch (item.type) {
      case ItemType.POTION:
        this.heal(item.effectValue);
        break;
      case ItemType.WEAPON:
        this.power += item.effectValue;
        break;
    }
  }
}
