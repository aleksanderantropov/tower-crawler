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
  inventory: Item[];

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
    this.inventory = [];
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
    const oldHp = this.currentHp;
    this.currentHp = Math.min(this.maxHp, hp + this.currentHp);
    console.log(
      `Вы восполнили ${this.currentHp - oldHp} здоровья: ${this.currentHp} / ${this.maxHp}`,
    );
  }

  pick(item: Item) {
    this.inventory.push(item);
    console.log(`Вы подобрали ${item}.`);
  }

  use(inventoryIndex: number): void {
    const item = this.inventory[inventoryIndex];

    if (!item) {
      return;
    }

    switch (item.type) {
      case ItemType.POTION:
        this.heal(item.effectValue);
        break;
      case ItemType.WEAPON:
        this.power += item.effectValue;
        break;
    }

    this.inventory = this.inventory.filter((_item) => _item !== item);
  }
}
