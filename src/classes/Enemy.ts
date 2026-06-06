import type { Settings } from '../configs/settings';
import type { Combatant } from '../types/Combatant';
import type { EnemyType } from '../types/EnemyType';
import { Coords } from './Coords';
import { Emitter } from './Emitter';
import { GameMap } from './GameMap';

type EnemyStats = Settings['enemies']['stats'][EnemyType];
type EnemyLootTable = Settings['enemies']['lootTable'][EnemyType];

export class Enemy implements Combatant {
  id = crypto.randomUUID();
  currentHp!: number;
  coords: Coords;
  type: EnemyStats['type'];
  viewRadius: EnemyStats['view'];
  power: EnemyStats['power'];
  maxHp: EnemyStats['hp'];
  lootTable: EnemyLootTable;
  onDamage = new Emitter<number>();
  onMove = new Emitter<{ initialCoords: Coords; targetCoords: Coords }>();

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
      `Player took ${this.power} damage. HP: ${target.currentHp}/${target.maxHp}`,
    );
  }

  move(coords: Coords): void {
    this.onMove.emit({
      targetCoords: coords,
      initialCoords: this.coords,
    });

    this.coords = coords;
  }

  isWithinAggroRadius(tile: Coords): boolean {
    const dist = GameMap.calcDistance(this.coords, tile);

    return dist <= this.viewRadius;
  }

  act(target: Combatant, isTileWalkable: (tile: Coords) => boolean): void {
    if (!this.isWithinAggroRadius(target.coords)) {
      return;
    }

    const dist = GameMap.calcDistance(this.coords, target.coords);

    if (dist === 1) {
      this.attack(target);
      return;
    }

    const dx = Math.sign(target.coords.x - this.coords.x);
    const dy = Math.sign(target.coords.y - this.coords.y);

    const moveX = this.coords.clone().add(new Coords(dx, 0));
    const moveY = this.coords.clone().add(new Coords(0, dy));

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
