import type { Settings } from '../configs/settings';
import type { Combatant } from '../types/Combatant';
import type { EnemyType } from '../types/EnemyType';
import { ItemType } from '../types/ItemType';
import { Coords } from './Coords';
import { Item } from './Item';
import { Map } from './Map';
import type { Player } from './Player';

type EnemyStats = Settings['enemies']['stats'][EnemyType];
type EnemyLootTable = Settings['enemies']['lootTable'][EnemyType];

export class Enemy implements Combatant {
  coords: Coords;
  type: EnemyStats['type'];
  view: EnemyStats['view'];
  power: EnemyStats['power'];
  currentHp: EnemyStats['hp'];
  maxHp: EnemyStats['hp'];
  lootTable: EnemyLootTable;

  constructor({
    coords,
    type,
    view,
    power,
    hp,
    lootTable,
  }: { coords: Coords } & EnemyStats & { lootTable: EnemyLootTable }) {
    this.coords = coords;
    this.type = type;
    this.view = view;
    this.power = power;
    this.currentHp = hp;
    this.maxHp = hp;
    this.lootTable = lootTable;
  }

  attack(player: Player): void {
    player.currentHp -= this.power;
    console.log(
      `Игрок получил ${this.power} урон(а). HP: ${player.currentHp}/${player.maxHp}`,
    );
  }

  move(coords: Coords): void {
    this.coords = coords;
  }

  isWithinAggroRadius(tile: Coords): boolean {
    const dist = Map.calcDistance(this.coords, tile);

    return dist <= this.view;
  }
}
