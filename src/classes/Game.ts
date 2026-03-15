import type { Settings } from '../configs/settings';
import { EnemyType } from '../types/EnemyType';
import type { Move } from '../types/Move';
import { Renderer } from './Renderer';
import { Enemy } from './Enemy';
import { Map } from './Map';
import { Input } from './Input';
import { Player } from './Player';
import { Visibility } from './Visibility';
import { Stats } from './Stats';
import { Coords } from './Coords';

export class Game {
  private map: Map;
  private visibility: Visibility;
  private renderer: Renderer;
  private player: Player;
  private enemies: Enemy[];
  private input: Input;
  private stats: Stats;

  constructor(settings: Settings) {
    this.map = new Map(settings.gameMap);
    this.visibility = new Visibility(settings.gameMap);
    this.renderer = new Renderer(settings.renderer);

    this.player = new Player({
      coords: this.map.getRandomFloorTile(),
      ...settings.player,
    });

    this.input = new Input(this.handleMove);
    this.stats = new Stats(this.player, settings.stats);

    this.enemies = [];
    this.spawnEnemies(settings.enemies);
  }

  handleMove = (input: Move) => {
    this.updatePlayer(input);
    this.updateEnemies();
    this.updateVisibility();
    this.render();
  };

  start(): void {
    this.updateVisibility();
    this.render();
  }

  private updatePlayer({ dx, dy }: Move): void {
    const targetTile = new Coords(
      this.player.coords.x + dx,
      this.player.coords.y + dy,
    );

    const targetEnemy = this.findEnemyOnTile(targetTile);

    if (targetEnemy) {
      this.player.attack(targetEnemy);
    } else if (this.isTileWalkable(targetTile)) {
      this.player.move(targetTile);
    }
  }

  private findEnemyOnTile(tile: Coords): Enemy | undefined {
    return this.enemies.find((enemy) => tile.equalTo(enemy.coords));
  }

  private updateEnemies(): void {
    this.enemies = this.enemies.filter((enemy) => enemy.currentHp > 0);

    this.enemies.forEach((enemy) => {
      if (!enemy.isWithinAggroRadius(this.player.coords)) {
        return;
      }

      const dist = Map.calcDistance(enemy.coords, this.player.coords);

      if (dist === 1) {
        enemy.attack(this.player);
        return;
      }

      const dx = Math.sign(this.player.coords.x - enemy.coords.x);
      const dy = Math.sign(this.player.coords.y - enemy.coords.y);

      const moveX = new Coords(enemy.coords.x + dx, enemy.coords.y);
      const moveY = new Coords(enemy.coords.x, enemy.coords.y + dy);

      if (dx && this.isTileWalkable(moveX)) {
        enemy.move(moveX);
      } else if (dy && this.isTileWalkable(moveY)) {
        enemy.move(moveY);
      }
    });
  }

  private render(): void {
    this.stats.update();
    this.renderer.render({
      tiles: this.map.tiles,
      visibility: this.visibility.tiles,
      player: this.player,
      enemies: this.enemies,
    });
  }

  private updateVisibility(): void {
    this.visibility.update(this.player, this.map.tiles);
  }

  private tileHasEnemies(tile: Coords): boolean {
    return this.enemies.some((enemy) => tile.equalTo(enemy.coords));
  }

  private tileHasPlayer(tile: Coords): boolean {
    return tile.equalTo(this.player.coords);
  }

  private isTileWalkable(tile: Coords): boolean {
    return (
      this.map.isWall(tile) &&
      !this.tileHasEnemies(tile) &&
      !this.tileHasPlayer(tile)
    );
  }

  private spawnEnemies(settings: Settings['enemies']): void {
    Object.entries(settings.spawn).forEach(([enemyType, enemyQuantity]) => {
      if (
        this.map.floorTiles.length <
        this.enemies.length + enemyQuantity + 1
      ) {
        return;
      }

      for (let i = 0; i < enemyQuantity; i++) {
        let randomFloorTile;

        do {
          randomFloorTile = this.map.getRandomFloorTile();
        } while (
          this.tileHasEnemies(randomFloorTile) ||
          this.tileHasPlayer(randomFloorTile)
        );

        const newEnemy = new Enemy({
          coords: randomFloorTile,
          ...settings.stats[enemyType as EnemyType],
        });

        this.enemies.push(newEnemy);
      }
    });
  }
}
