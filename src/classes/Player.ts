import type { Settings } from '../configs/settings';
import type { Ability } from '../types/Ability';
import { AbilityType } from '../types/AbilityType';
import type { Combatant } from '../types/Combatant';
import { ItemType } from '../types/ItemType';
import { Coords } from './Coords';
import { Emitter } from './Emitter';
import type { Enemy } from './Enemy';
import type { Item } from './Item';

export class Player implements Combatant {
  currentHp!: number;
  maxHp: number;
  basePower: number;
  viewRadius: number;
  coords: Coords;
  abilities: Ability[];
  viewDirection: Coords = new Coords(0, -1);
  inventory: Item[] = [];
  weapon: Item | null = null;
  onDamage = new Emitter<number>();
  onMove = new Emitter<{ initialCoords: Coords; targetCoords: Coords }>();

  constructor({
    coords,
    power,
    hp,
    view,
    abilities,
  }: {
    abilities: Ability[];
    coords: Coords;
  } & Settings['player']['stats']) {
    this.coords = coords;
    this.basePower = power;
    this.currentHp = hp;
    this.maxHp = hp;
    this.viewRadius = view;
    this.abilities = abilities;
  }

  get power(): number {
    return this.basePower + (this.weapon?.effectValue ?? 0);
  }

  move(coords: Coords) {
    this.onMove.emit({
      targetCoords: coords,
      initialCoords: this.coords,
    });

    this.viewDirection = coords.clone().subtract(this.coords);
    this.coords = coords;
  }

  attack(enemy: Enemy): void {
    enemy.takeDamage(this.power);
    console.log(
      `Player dealt ${this.power} damage to enemy ${enemy.type}! HP: ${enemy.currentHp}/${enemy.maxHp}`,
    );
  }

  heal(hp: number): void {
    const oldHp = this.currentHp;
    this.currentHp = Math.min(this.maxHp, hp + this.currentHp);
    console.log(
      `You restored ${this.currentHp - oldHp} health: ${this.currentHp} / ${this.maxHp}`,
    );
  }

  equipWeapon(item: Item): void {
    const oldWeapon = this.weapon;

    this.weapon = item;

    if (oldWeapon) {
      this.inventory.push(oldWeapon);
      console.log(`You put ${oldWeapon} back into your inventory`);
    }

    console.log(`You equipped ${this.weapon}`);
  }

  pickItem(item: Item) {
    this.inventory.push(item);
    console.log(`You picked up ${item}.`);
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

  useAbility(abilityType: AbilityType): boolean {
    const ability = this.abilities.find(
      (ability) => ability.type === abilityType,
    );

    if (!ability || !ability.ready) {
      return false;
    }

    ability.use(this);
    console.log(`You used ability ${ability.name}`);

    return true;
  }

  decreaseAbilitiesCooldown(): void {
    this.abilities.forEach((ability) => ability.decreaseCooldown());
  }

  takeDamage(damage: number): void {
    const hpBeforeDamage = this.currentHp;
    this.currentHp = Math.max(0, this.currentHp - damage);
    this.onDamage.emit(hpBeforeDamage - this.currentHp);
  }

  get dead(): boolean {
    return this.currentHp <= 0;
  }
}
