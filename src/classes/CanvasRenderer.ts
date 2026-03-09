import { type GameMap } from '../types/GameMap';
import { TileType } from '../types/TileType';
import { type Settings } from '../configs/settings';

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

  private getFillStyle(
    tile: TileType,
  ): (typeof this.colors)[keyof typeof this.colors] {
    switch (tile) {
      case TileType.FLOOR:
        return this.colors.floor;
      case TileType.WALL:
        return this.colors.wall;
      default:
        return this.colors.default;
    }
  }
}
