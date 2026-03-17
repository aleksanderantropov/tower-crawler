import type { ItemType } from '../types/ItemType';
import type { Coords } from './Coords';

export class Item {
  coords: Coords;
  type: ItemType;
  effectValue: number;
  name: string;

  constructor({
    coords,
    type,
    effectValue,
    name,
  }: {
    coords: Coords;
    type: ItemType;
    effectValue: number;
    name: string;
  }) {
    this.coords = coords;
    this.type = type;
    this.effectValue = effectValue;
    this.name = name;
  }

  toString(): string {
    return `${this.name} (+${this.effectValue})`;
  }
}
