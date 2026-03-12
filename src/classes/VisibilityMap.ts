import type { Settings } from '../configs/settings';
import type { Point } from '../types/Point';
import { TileType } from '../types/TileType';
import { Visibility } from '../types/Visibility';
import type { GameMap } from './GameMap';
import type { Player } from './Player';

export class VisibilityMap {
  width: Settings['gameMap']['width'];
  height: Settings['gameMap']['height'];
  visibility: Visibility[][];
  visibleTiles: Point[];

  constructor({
    width,
    height,
  }: Pick<Settings['gameMap'], 'height' | 'width'>) {
    this.width = width;
    this.height = height;
    this.visibleTiles = [];

    this.visibility = Array.from({ length: this.height }, () =>
      Array(width).fill(Visibility.HIDDEN),
    );
  }

  update(player: Player, tiles: GameMap['tiles']): void {
    // Mark all VISIBLE as REVEALED
    this.visibleTiles.forEach(
      ({ x, y }) => (this.visibility[y][x] = Visibility.REVEALED),
    );
    this.visibleTiles = [];

    // Mark all in view and along the line as VISIBLE
    const initialY = player.y - player.view;
    const maxY = player.y + player.view;
    const initialX = player.x - player.view;
    const maxX = player.x + player.view;

    for (let y = initialY; y <= maxY; y++) {
      for (let x = initialX; x <= maxX; x++) {
        // Check only on view perimeter and within map
        const isOnviewPerimeter =
          x === initialX || x === maxX || y === initialY || y === maxY;

        if (!isOnviewPerimeter || !this.isPointWithinMap({ x, y })) {
          continue;
        }

        const points = this.getPointsAlongLine(player, { x, y });

        for (const point of points) {
          // Still need to check total distance so the area is circular, not square
          if (
            !this.isWithinview(player, point) ||
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

  // Checks the point lies within view of the player
  private isWithinview(player: Player, point: Point): boolean {
    const dx = Math.abs(player.x - point.x);
    const dy = Math.abs(player.y - point.y);

    return dx * dx + dy * dy <= player.view * player.view;
  }

  private isPointWithinMap({ x, y }: Point): boolean {
    return x >= 0 && x <= this.width && y >= 0 && y <= this.height;
  }
}
