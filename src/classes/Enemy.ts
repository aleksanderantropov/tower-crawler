import type { Settings } from '../configs/settings';
import type { Combatant } from '../types/Combatant';
import type { EnemyType } from '../types/EnemyType';
import type { Tile } from '../types/Tile';
import { Map } from './Map';
import type { Player } from './Player';

export class Enemy implements Tile, Combatant {
  x: number;
  y: number;
  type: Settings['enemies'][EnemyType]['type'];
  view: Settings['enemies'][EnemyType]['view'];
  power: Settings['enemies'][EnemyType]['power'];
  currentHp: Settings['enemies'][EnemyType]['hp'];
  maxHp: Settings['enemies'][EnemyType]['hp'];

  constructor({
    x,
    y,
    type,
    view,
    power,
    hp,
  }: Tile & Settings['enemies'][EnemyType]) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.view = view;
    this.power = power;
    this.currentHp = hp;
    this.maxHp = hp;
  }

  attack(player: Player): void {
    player.currentHp -= this.power;
    console.log(
      `Игрок получил ${this.power} урон(а). HP: ${player.currentHp}/${player.maxHp}`,
    );
  }

  move({ x, y }: Tile): void {
    [this.x, this.y] = [x, y];
  }

  isWithinAggroRadius(tile: Tile): boolean {
    const dist = Map.calcDistance(this, tile);

    return dist <= this.view;
  }
}
