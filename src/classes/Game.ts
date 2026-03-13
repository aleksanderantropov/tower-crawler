import type { Settings } from '../configs/settings';
import { EnemyType } from '../types/EnemyType';
import type { Move } from '../types/Move';
import { Renderer } from './Renderer';
import { Enemy } from './Enemy';
import { Map } from './Map';
import { Input } from './Input';
import { Player } from './Player';
import { Visibility } from './Visibility';
import type { Point } from '../types/Point';

export class Game {
  private map: Map;
  private visibility: Visibility;
  private renderer: Renderer;
  private player: Player;
  private enemies: Enemy[];
  private input: Input;

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
    } else if (this.map.isTileWalkable(targetTile)) {
      this.player.move(targetTile);
    }
  }

  private findEnemyOnTile(tile: Point): Enemy | undefined {
    return this.enemies.find(
      (enemy) => tile.x === enemy.x && tile.y === enemy.y,
    );
  }

  private updateEnemies(): void {
    this.enemies = this.enemies.filter((enemy) => enemy.hp);

    this.enemies.forEach((enemy) => {
      if (enemy.isWithinAggroRadius(this.player)) {
        enemy.moveTowards(this.player, this.map);
      }
    });
  }

  private render(): void {
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
}
