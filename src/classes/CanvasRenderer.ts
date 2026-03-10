import { type GameMap } from '../types/GameMap';
import { TileType } from '../types/TileType';
import { type Settings } from '../configs/settings';
import type { Point } from '../types/Point';

export class CanvasRenderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  tileSize: Settings['renderer']['tileSize'];
  colors: Settings['renderer']['colors'];
  viewDistance: Settings['renderer']['viewDistance'];

  constructor({
    id,
    tileSize,
    width,
    height,
    colors,
    viewDistance,
  }: Settings['renderer']) {
    this.canvas = document.getElementById(id) as HTMLCanvasElement;
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.tileSize = tileSize;
    this.colors = colors;
    this.viewDistance = viewDistance;
  }

  render(map: GameMap, player: Point): void {
    this.clear();
    this.drawMap(map, player);
    this.drawPlayer(player);
  }

  private clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawMap(map: GameMap, player: Point): void {
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        const dist = this.getDistance(player, { x, y });
        const tile = dist <= this.viewDistance ? map[y][x] : TileType.FOG;

        this.drawTile({ tile, x, y });
      }
    }
  }

  private getDistance(player: Point, point: Point): number {
    const dx = Math.abs(player.x - point.x);
    const dy = Math.abs(player.y - point.y);

    return Math.sqrt(dx * dx + dy * dy);
  }

  private drawTile({ tile, x, y }: Point & { tile: TileType }): void {
    this.ctx.fillStyle = this.getTileFillStyle(tile);

    this.ctx.fillRect(
      x * this.tileSize,
      y * this.tileSize,
      this.tileSize,
      this.tileSize,
    );
  }

  private getTileFillStyle(tile: TileType): string {
    switch (tile) {
      case TileType.FLOOR:
        return this.colors.tiles.floor;
      case TileType.WALL:
        return this.colors.tiles.wall;
      case TileType.FOG:
        return this.colors.tiles.fog;
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
