import type { Settings } from '../configs/settings';
import type { Combatant } from '../types/Combatant';
import { ItemType } from '../types/ItemType';
import { Coords } from './Coords';
import type { Enemy } from './Enemy';
import type { Item } from './Item';

export class Player implements Combatant {
  private _currentHp: number;
  maxHp: number;
  basePower: number;
  view: number;
  coords: Coords;
  inventory: Item[];
  weapon: Item | null;
  onHpLoss: VoidFunction;

  constructor({
    coords,
    power,
    hp,
    view,
    onHpLoss,
  }: { coords: Coords; onHpLoss: VoidFunction } & Settings['player']) {
    this.coords = coords;
    this.basePower = power;
    this.currentHp = hp;
    this.maxHp = hp;
    this.view = view;

    this.inventory = [];
    this.weapon = null;
    this.onHpLoss = onHpLoss;
  }

  get power(): number {
    return this.basePower + (this.weapon?.effectValue ?? 0);
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

  equipWeapon(item: Item): void {
    const oldWeapon = this.weapon;

    this.weapon = item;

    if (oldWeapon) {
      this.inventory.push(oldWeapon);
      console.log(`Вы убрали в инвентарь ${oldWeapon}`);
    }

    console.log(`Вы экипипровали ${this.weapon}`);
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
        this.equipWeapon(item);
        break;
    }

    this.inventory = this.inventory.filter((_item) => _item !== item);
  }

  get dead(): boolean {
    return this.currentHp <= 0;
  }

  set currentHp(hp: number) {
    if (hp < this._currentHp) {
      this.onHpLoss();
    }

    this._currentHp = hp;
  }

  get currentHp(): number {
    return this._currentHp;
  }
}
