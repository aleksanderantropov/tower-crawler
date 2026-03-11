import type { Point } from '../types/Point';
import { TileType } from '../types/TileType';
import { Visibility } from '../types/Visibility';
import type { GameMap } from './GameMap';

export class VisibilityMap {
  width: number;
  height: number;
  viewDistance: number;
  visibility: Visibility[][];

  constructor({
    width,
    height,
    viewDistance,
  }: {
    width: number;
    height: number;
    viewDistance: number;
  }) {
    this.width = width;
    this.height = height;
    this.viewDistance = viewDistance;

    this.visibility = Array.from({ length: this.height }, () =>
      Array(width).fill(Visibility.HIDDEN),
    );
  }

  update(player: Point, tiles: GameMap['tiles']): void {
    // Mark all VISIBLE as REVEALED
    for (let y = 0; y < this.visibility.length; y++) {
      for (let x = 0; x < this.visibility[y].length; x++) {
        if (this.visibility[y][x] === Visibility.VISIBLE) {
          this.visibility[y][x] = Visibility.REVEALED;
        }
      }
    }

    // Mark all in viewDistance as VISIBLE
    for (
      let y = player.y - this.viewDistance;
      y <= player.y + this.viewDistance;
      y++
    ) {
      for (
        let x = player.x - this.viewDistance;
        x <= player.x + this.viewDistance;
        x++
      ) {
        if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
          // Still need to check distance so the area is circular, not square
          const dist = this.getDistance(player, { x, y });

          if (dist <= this.viewDistance) {
            const points = this.getLine(player, { x, y });

            for (let i = 0; i < points.length; i++) {
              const point = points[i];

              this.visibility[point.y][point.x] = Visibility.VISIBLE;

              if (tiles[point.y][point.x] === TileType.WALL) {
                break;
              }
            }
          }
        }
      }
    }
  }

  // Bresenham’s algorithm
  private getLine({ x: x1, y: y1 }: Point, { x: x2, y: y2 }: Point): Point[] {
    const points = [];

    // Abs difference between two points
    let dx = Math.abs(x1 - x2);
    let dy = Math.abs(y1 - y2);
    // Step direction +1 / -1
    let sx = x1 < x2 ? 1 : -1;
    let sy = y1 < y2 ? 1 : -1;
    // How far off ideal line we are
    let err = dx - dy;

    while (true) {
      points.push({ x: x1, y: y1 });

      if (x1 === x2 && y1 === y2) {
        break;
      }

      // Error adjustment
      let e2 = 2 * err;

      // Error suggests we move horizontally
      if (e2 > -dy) {
        err -= dy;
        x1 += sx;
      }

      // Error suggests we move vertically
      if (e2 < dx) {
        err += dx;
        y1 += sy;
      }
    }

    return points;
  }

  private getDistance(player: Point, point: Point): number {
    const dx = Math.abs(player.x - point.x);
    const dy = Math.abs(player.y - point.y);

    return Math.sqrt(dx * dx + dy * dy);
  }
}
