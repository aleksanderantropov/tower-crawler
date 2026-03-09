import { type GameMap } from '../types/GameMap';
import { TileType } from '../types/TileType';
import { type Settings } from '../configs/settings';
import type { Point } from '../types/Point';

export class CanvasRenderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  tileSize: Settings['renderer']['tileSize'];
  colors: Settings['renderer']['colors'];

  constructor({ id, tileSize, width, height, colors }: Settings['renderer']) {
    this.canvas = document.getElementById(id) as HTMLCanvasElement;
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.tileSize = tileSize;
    this.colors = colors;
  }

  render(map: GameMap, player: Point): void {
    this.clear();
    this.drawMap(map);
    this.drawPlayer(player);
  }

  private clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawMap(map: GameMap): void {
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        const tile = map[y][x];

        this.ctx.fillStyle = this.getMapFillStyle(tile);

        this.ctx.fillRect(
          x * this.tileSize,
          y * this.tileSize,
          this.tileSize,
          this.tileSize,
        );
      }
    }
  }

  private getMapFillStyle(tile: TileType): string {
    switch (tile) {
      case TileType.FLOOR:
        return this.colors.tiles.floor;
      case TileType.WALL:
        return this.colors.tiles.wall;
      default:
        return this.colors.tiles.default;
    }
  }

  private drawPlayer(player: Point): void {
    this.ctx.fillStyle = this.colors.player;
    this.ctx.beginPath();

    // Convert coords to tileSize and shift by 1/2 of tileSize to center
    const centerX = player.x * this.tileSize + this.tileSize / 2;
    const centerY = player.y * this.tileSize + this.tileSize / 2;
    this.ctx.arc(centerX, centerY, this.tileSize / 3, 0, Math.PI * 2);

    this.ctx.fill();
  }
}
