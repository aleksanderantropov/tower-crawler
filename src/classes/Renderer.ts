import { TileType } from '../types/TileType';
import type { Settings } from '../configs/settings';
import { Coords } from './Coords';
import type { Visibility } from './Visibility';
import { VisibilityType } from '../types/VisibilityType';
import type { Map } from './Map';
import type { Enemy } from './Enemy';
import type { Player } from './Player';

export class Renderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  tileSize: Settings['renderer']['tileSize'];
  colors: Settings['renderer']['colors'];
  alpha: Settings['renderer']['alpha'];

  constructor({
    id,
    tileSize,
    width,
    height,
    colors,
    alpha,
  }: Settings['renderer']) {
    this.canvas = document.getElementById(id) as HTMLCanvasElement;
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.tileSize = tileSize;
    this.colors = colors;
    this.alpha = alpha;
  }

  render({
    tiles,
    visibility,
    player,
    enemies,
  }: {
    tiles: Map['tiles'];
    visibility: Visibility['tiles'];
    player: Player;
    enemies: Enemy[];
  }): void {
    this.clear();
    this.drawMap(tiles, visibility);
    this.drawPlayer(player.coords);
    this.drawEnemies(enemies, visibility);
  }

  private clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawMap(tiles: Map['tiles'], visibility: Visibility['tiles']): void {
    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        const fillStyle = this.getTileFillStyle(tiles[y][x]);
        const alpha = this.getAlphaValue(visibility[y][x]);

        this.drawTile({ fillStyle, alpha, coords: new Coords(x, y) });
      }
    }
  }

  private drawTile({
    fillStyle,
    alpha,
    coords,
  }: {
    fillStyle: string;
    alpha: number;
    coords: Coords;
  }): void {
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = fillStyle;

    this.ctx.fillRect(
      coords.x * this.tileSize,
      coords.y * this.tileSize,
      this.tileSize,
      this.tileSize,
    );

    this.ctx.globalAlpha = this.alpha.visibility.default;
  }

  private getTileFillStyle(tile: TileType): string {
    switch (tile) {
      case TileType.FLOOR:
        return this.colors.tiles.floor;
      case TileType.WALL:
        return this.colors.tiles.wall;
      default:
        return this.colors.tiles.default;
    }
  }

  private getAlphaValue(visibility: VisibilityType): number {
    switch (visibility) {
      case VisibilityType.HIDDEN:
        return this.alpha.visibility.hidden;
      case VisibilityType.REVEALED:
        return this.alpha.visibility.revealed;
      case VisibilityType.VISIBLE:
        return this.alpha.visibility.visible;
      default:
        return this.alpha.visibility.default;
    }
  }

  private drawPlayer(player: Coords): void {
    this.ctx.fillStyle = this.colors.player;
    this.ctx.beginPath();

    // Convert coords to tileSize and shift by 1/2 of tileSize to center
    const centerX = player.x * this.tileSize + this.tileSize / 2;
    const centerY = player.y * this.tileSize + this.tileSize / 2;
    this.ctx.arc(centerX, centerY, this.tileSize / 3, 0, Math.PI * 2);

    this.ctx.fill();
  }

  private drawEnemies(enemies: Enemy[], visibility: Visibility['tiles']): void {
    enemies.forEach((enemy) => {
      if (
        visibility[enemy.coords.y][enemy.coords.x] !== VisibilityType.VISIBLE
      ) {
        return;
      }

      this.ctx.fillStyle = this.colors.enemies[enemy.type];
      this.ctx.beginPath();

      this.ctx.fillRect(
        enemy.coords.x * this.tileSize + 4,
        enemy.coords.y * this.tileSize + 4,
        this.tileSize - 8,
        this.tileSize - 8,
      );
    });
  }
}
