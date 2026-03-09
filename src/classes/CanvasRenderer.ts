import { type GameMap } from '../types/GameMap';
import { TileType } from '../types/TileType';

export class CanvasRenderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  tileSize: number;

  constructor({
    id,
    tileSize,
    width,
    height,
  }: {
    id: string;
    tileSize: number;
    width: number;
    height: number;
  }) {
    this.canvas = document.getElementById(id) as HTMLCanvasElement;
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.tileSize = tileSize;
  }

  render(map: GameMap): void {
    this.clear();
    this.drawMap(map);
  }

  private clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawMap(map: GameMap): void {
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        const tile = map[y][x];

        this.ctx.fillStyle = this.getFillStyle(tile);

        this.ctx.fillRect(
          x * this.tileSize,
          y * this.tileSize,
          this.tileSize,
          this.tileSize,
        );
      }
    }
  }

  private getFillStyle(tile: TileType): string {
    switch (tile) {
      case TileType.FLOOR:
        return '#2c3e50';
      case TileType.WALL:
        return '#ecf0f1';
      default:
        return '#fff';
    }
  }
}
