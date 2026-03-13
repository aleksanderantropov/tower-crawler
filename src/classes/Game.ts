import type { Settings } from '../configs/settings';
import { EnemyType } from '../types/EnemyType';
import type { Move } from '../types/Move';
import { Renderer } from './Renderer';
import { Enemy } from './Enemy';
import { Map } from './Map';
import { Input } from './Input';
import { Player } from './Player';
import { Visibility } from './Visibility';
import type { Tile } from '../types/Tile';
import { Stats } from './Stats';

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

    const [playerRoom, ...enemiesRoom] = this.map.rooms;
    this.player = new Player({
      ...playerRoom.center,
      ...settings.player,
    });

    this.enemies = enemiesRoom.map(
      (room) =>
        new Enemy({
          ...room.center,
          ...settings.enemies[EnemyType.SLIME],
        }),
    );

    this.input = new Input(this.handleMove);
    this.stats = new Stats(this.player, settings.stats);
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
    const targetTile = { x: this.player.x + dx, y: this.player.y + dy };

    const targetEnemy = this.findEnemyOnTile(targetTile);

    if (targetEnemy) {
      this.player.attack(targetEnemy);
    } else if (this.isTileWalkable(targetTile)) {
      this.player.move(targetTile);
    }
  }

  private findEnemyOnTile(tile: Tile): Enemy | undefined {
    return this.enemies.find(
      (enemy) => tile.x === enemy.x && tile.y === enemy.y,
    );
  }

  private updateEnemies(): void {
    this.enemies = this.enemies.filter((enemy) => enemy.currentHp);

    this.enemies.forEach((enemy) => {
      if (!enemy.isWithinAggroRadius(this.player)) {
        return;
      }

      const dist = Map.calcDistance(enemy, this.player);

      if (dist === 1) {
        enemy.attack(this.player);
        return;
      }

      const dx = Math.sign(this.player.x - enemy.x);
      const dy = Math.sign(this.player.y - enemy.y);

      const moveX = { x: enemy.x + dx, y: enemy.y };
      const moveY = { x: enemy.x, y: enemy.y + dy };

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

  private isTileWalkable(tile: Tile): boolean {
    const occupiedByEnemy = this.enemies.some(
      (enemy) => enemy.x === tile.x && enemy.y === tile.y,
    );
    const occupiedByPlayer =
      this.player.x === tile.x && this.player.y === tile.y;

    return this.map.isWall(tile) && !occupiedByEnemy && !occupiedByPlayer;
  }
}
