import type { Settings } from '../configs/settings';
import type { Combatant } from '../types/Combatant';
import type { EnemyType } from '../types/EnemyType';
import { Coords } from './Coords';
import { Emitter } from './Emitter';
import { Map } from './Map';

type EnemyStats = Settings['enemies']['stats'][EnemyType];
type EnemyLootTable = Settings['enemies']['lootTable'][EnemyType];

export class Enemy implements Combatant {
  currentHp!: number;
  coords: Coords;
  type: EnemyStats['type'];
  viewRadius: EnemyStats['view'];
  power: EnemyStats['power'];
  maxHp: EnemyStats['hp'];
  lootTable: EnemyLootTable;
  onDamage = new Emitter<number>();

  constructor({
    coords,
    type,
    view,
    power,
    hp,
    lootTable,
  }: { coords: Coords } & EnemyStats & {
      lootTable: EnemyLootTable;
    }) {
    this.coords = coords;
    this.type = type;
    this.viewRadius = view;
    this.power = power;
    this.currentHp = hp;
    this.maxHp = hp;
    this.lootTable = lootTable;
  }

  attack(target: Combatant): void {
    target.takeDamage(this.power);
    console.log(
      `Игрок получил ${this.power} урон(а). HP: ${target.currentHp}/${target.maxHp}`,
    );
  }

  move(coords: Coords): void {
    this.coords = coords;
  }

  isWithinAggroRadius(tile: Coords): boolean {
    const dist = Map.calcDistance(this.coords, tile);

    return dist <= this.viewRadius;
  }

  act(target: Combatant, isTileWalkable: (tile: Coords) => boolean): void {
    if (!this.isWithinAggroRadius(target.coords)) {
      return;
    }

    const dist = Map.calcDistance(this.coords, target.coords);

    if (dist === 1) {
      this.attack(target);
      return;
    }

    const dx = Math.sign(target.coords.x - this.coords.x);
    const dy = Math.sign(target.coords.y - this.coords.y);

    const moveX = this.coords.clone({ dx, dy: 0 });
    const moveY = this.coords.clone({ dx: 0, dy });

    if (dx && isTileWalkable(moveX)) {
      this.move(moveX);
    } else if (dy && isTileWalkable(moveY)) {
      this.move(moveY);
    }
  }

  takeDamage(damage: number): void {
    const hpBeforeDamage = this.currentHp;
    this.currentHp = Math.max(0, this.currentHp - damage);
    this.onDamage.emit(hpBeforeDamage - this.currentHp);
  }
}
