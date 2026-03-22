import type { Settings } from '../configs/settings';
import type { Combatant } from '../types/Combatant';
import type { EnemyType } from '../types/EnemyType';
import { Coords } from './Coords';
import { Emitter } from './Emitter';
import { Enemy } from './Enemy';

export class EnemyManager {
  enemies: Enemy[] = [];
  readonly onSpawn = new Emitter<Enemy>();

  constructor(private settings: Settings['enemies']) {}

  spawn(maxEnemies: number): void {
    Object.entries(this.settings.spawn).forEach(
      ([enemyType, enemyQuantity]) => {
        if (this.enemies.length + enemyQuantity > maxEnemies) {
          return;
        }

        for (let i = 0; i < enemyQuantity; i++) {
          const newEnemy = new Enemy({
            coords: new Coords(0, 0),
            lootTable: this.settings.lootTable[enemyType as EnemyType],
            ...this.settings.stats[enemyType as EnemyType],
          });

          this.enemies.push(newEnemy);
          this.onSpawn.emit(newEnemy);
        }
      },
    );
  }

  update({
    target,
    onEnemyDeath,
    isTileWalkable,
  }: {
    target: Combatant;
    onEnemyDeath: (enemy: Enemy) => void;
    isTileWalkable: (tile: Coords) => boolean;
  }): void {
    this.enemies.filter((enemy) => enemy.currentHp <= 0).forEach(onEnemyDeath);
    this.enemies = this.enemies.filter((enemy) => enemy.currentHp > 0);
    this.enemies.forEach((enemy) => enemy.act(target, isTileWalkable));
  }

  findByTile(tile: Coords): Enemy | undefined {
    return this.enemies.find((enemy) => tile.equalTo(enemy.coords));
  }

  tileHasEnemy(tile: Coords): boolean {
    return this.enemies.some((enemy) => tile.equalTo(enemy.coords));
  }
}
