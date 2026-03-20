import type { Settings } from '../configs/settings';
import type { Ability } from '../types/Ability';
import type { Combatant } from '../types/Combatant';
import type { Direction } from '../types/Direction';
import { ItemType } from '../types/ItemType';
import { DashAbility } from './abilities/DashAbility';
import { Coords } from './Coords';
import type { Enemy } from './Enemy';
import type { Item } from './Item';

type OnHpLoss = (hpLoss: number) => void;

export class Player implements Combatant {
  private _currentHp!: number;
  maxHp: number;
  basePower: number;
  viewDirection: Direction;
  viewRadius: number;
  coords: Coords;
  inventory: Item[];
  weapon: Item | null;
  abilities: Ability[];
  onHpLoss: OnHpLoss;

  constructor({
    coords,
    power,
    hp,
    view,
    abilities,
    onHpLoss,
  }: {
    abilities: Ability[];
    coords: Coords;
    onHpLoss: OnHpLoss;
  } & Settings['player']['stats']) {
    this.coords = coords;
    this.basePower = power;
    this.currentHp = hp;
    this.maxHp = hp;
    this.viewRadius = view;
    this.abilities = abilities;
    this.viewDirection = { dx: 0, dy: -1 };

    this.inventory = [];
    this.weapon = null;
    this.onHpLoss = onHpLoss;
  }

  get power(): number {
    return this.basePower + (this.weapon?.effectValue ?? 0);
  }

  move(coords: Coords) {
    this.viewDirection = {
      dx: coords.x - this.coords.x,
      dy: coords.y - this.coords.y,
    };
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

  pickItem(item: Item) {
    this.inventory.push(item);
    console.log(`Вы подобрали ${item}.`);
  }

  useItem(inventoryIndex: number): boolean {
    const item = this.inventory[inventoryIndex];

    if (!item) {
      return false;
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

    return true;
  }

  useAbility(abilityIndex: number): boolean {
    const ability = this.abilities[abilityIndex];

    if (!ability || !ability.ready) {
      return false;
    }

    ability.use(this, this.viewDirection);
    console.log(`Вы использовали способность ${ability.name}`);

    return true;
  }

  decreaseAbilitiesCooldown(): void {
    this.abilities.forEach((ability) => ability.decreaseCooldown());
  }

  get dead(): boolean {
    return this.currentHp <= 0;
  }

  set currentHp(hp: number) {
    if (hp < this._currentHp) {
      this.onHpLoss(this._currentHp - hp);
    }

    this._currentHp = hp;
  }

  get currentHp(): number {
    return this._currentHp;
  }
}
