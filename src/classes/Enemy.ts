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
type OnHpLoss = (hpLoss: number) => void;

export class Enemy implements Combatant {
  private _currentHp!: number;
  coords: Coords;
  type: EnemyStats['type'];
  view: EnemyStats['view'];
  power: EnemyStats['power'];
  maxHp: EnemyStats['hp'];
  lootTable: EnemyLootTable;
  onHpLoss: OnHpLoss;

  constructor({
    coords,
    type,
    view,
    power,
    hp,
    lootTable,
    onHpLoss,
  }: { coords: Coords } & EnemyStats & {
      lootTable: EnemyLootTable;
      onHpLoss: OnHpLoss;
    }) {
    this.coords = coords;
    this.type = type;
    this.view = view;
    this.power = power;
    this.currentHp = hp;
    this.maxHp = hp;
    this.lootTable = lootTable;
    this.onHpLoss = onHpLoss;
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
