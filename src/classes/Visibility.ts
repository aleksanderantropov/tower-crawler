import type { Settings } from '../configs/settings';
import { Coords } from './Coords';
import { TileType } from '../types/TileType';
import { VisibilityType } from '../types/VisibilityType';
import type { Map } from './Map';
import type { Player } from './Player';

export class Visibility {
  width: Settings['gameMap']['width'];
  height: Settings['gameMap']['height'];
  tiles: VisibilityType[][];
  visibleTiles: Coords[];

  constructor({
    width,
    height,
  }: Pick<Settings['gameMap'], 'height' | 'width'>) {
    this.width = width;
    this.height = height;
    this.visibleTiles = [];

    this.tiles = Array.from({ length: this.height }, () =>
      Array(width).fill(VisibilityType.HIDDEN),
    );
  }

  update(player: Player, mapTiles: Map['tiles']): void {
    // Mark all VISIBLE as REVEALED
    this.visibleTiles.forEach(
      ({ x, y }) => (this.tiles[y][x] = VisibilityType.REVEALED),
    );
    this.visibleTiles = [];

    // Mark all in view and along the line as VISIBLE
    const initialY = player.coords.y - player.view;
    const maxY = player.coords.y + player.view;
    const initialX = player.coords.x - player.view;
    const maxX = player.coords.x + player.view;

    for (let y = initialY; y <= maxY; y++) {
      for (let x = initialX; x <= maxX; x++) {
        // Check only on view perimeter and within map
        const isOnviewPerimeter =
          x === initialX || x === maxX || y === initialY || y === maxY;

        if (!isOnviewPerimeter) {
          continue;
        }

        const tilesAlongLine = this.getTilesAlongLine(
          player.coords,
          new Coords(x, y),
        );

        for (const tile of tilesAlongLine) {
          // Still need to check total distance so the area is circular, not square
          if (
            !this.isTileWithinView(player, tile) ||
            !this.isPointWithinMap(tile) ||
            mapTiles[tile.y][tile.x] === TileType.WALL
          ) {
            break;
          }

          this.tiles[tile.y][tile.x] = VisibilityType.VISIBLE;
          this.visibleTiles.push(tile);
        }
      }
    }
  }

  // Bresenham’s algorithm of "raycasting"
  private getTilesAlongLine(
    { x: x1, y: y1 }: Coords,
    { x: x2, y: y2 }: Coords,
  ): Coords[] {
    const points: Coords[] = [];

    // Abs difference between two points
    let dx = Math.abs(x1 - x2);
    let dy = Math.abs(y1 - y2);
    // Step direction +1 / -1
    let sx = x1 < x2 ? 1 : -1;
    let sy = y1 < y2 ? 1 : -1;
    // How far off ideal line we are
    let err = dx - dy;

    while (true) {
      points.push(new Coords(x1, y1));

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

  // Checks if tile lies within view of the player
  private isTileWithinView(player: Player, tile: Coords): boolean {
    const dx = Math.abs(player.coords.x - tile.x);
    const dy = Math.abs(player.coords.y - tile.y);

    return dx * dx + dy * dy <= player.view * player.view;
  }

  private isPointWithinMap({ x, y }: Coords): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }
}
