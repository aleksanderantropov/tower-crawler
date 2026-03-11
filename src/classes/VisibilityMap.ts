import type { Point } from '../types/Point';
import { TileType } from '../types/TileType';
import { Visibility } from '../types/Visibility';
import type { GameMap } from './GameMap';

export class VisibilityMap {
  width: number;
  height: number;
  viewDistance: number;
  visibility: Visibility[][];
  visibleTiles: Point[];

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
    this.visibleTiles = [];

    this.visibility = Array.from({ length: this.height }, () =>
      Array(width).fill(Visibility.HIDDEN),
    );
  }

  update(player: Point, tiles: GameMap['tiles']): void {
    // Mark all VISIBLE as REVEALED
    this.visibleTiles.forEach(
      ({ x, y }) => (this.visibility[y][x] = Visibility.REVEALED),
    );
    this.visibleTiles = [];

    // Mark all in viewDistance and along the line as VISIBLE
    const initialY = player.y - this.viewDistance;
    const maxY = player.y + this.viewDistance;
    const initialX = player.x - this.viewDistance;
    const maxX = player.x + this.viewDistance;

    for (let y = initialY; y <= maxY; y++) {
      for (let x = initialX; x <= maxX; x++) {
        // Check only on viewDistance perimeter and within map
        const isOnViewDistancePerimeter =
          x === initialX || x === maxX || y === initialY || y === maxY;

        if (isOnViewDistancePerimeter && this.isPointWithinMap({ x, y })) {
          const points = this.getPointsAlongLine(player, { x, y });

          for (const point of points) {
            // Still need to check total distance so the area is circular, not square
            if (
              !this.isWithinViewDistance(player, point) ||
              tiles[point.y][point.x] === TileType.WALL
            ) {
              break;
            }

            this.visibility[point.y][point.x] = Visibility.VISIBLE;
            this.visibleTiles.push(point);
          }
        }
      }
    }
  }

  // Bresenham’s algorithm of "raycasting"
  private getPointsAlongLine(
    { x: x1, y: y1 }: Point,
    { x: x2, y: y2 }: Point,
  ): Point[] {
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

  // Checks the point lies within viewDistance of the player
  private isWithinViewDistance(player: Point, point: Point): boolean {
    const dx = Math.abs(player.x - point.x);
    const dy = Math.abs(player.y - point.y);

    return dx * dx + dy * dy <= this.viewDistance * this.viewDistance;
  }

  private isPointWithinMap({ x, y }: Point): boolean {
    return x >= 0 && x <= this.width && y >= 0 && y <= this.height;
  }
}
