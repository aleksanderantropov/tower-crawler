import type { Direction } from '../types/Direction';

export class Coords {
  constructor(
    public x: number,
    public y: number,
  ) {}

  equalTo(coords: Coords): boolean {
    return this.x === coords.x && this.y === coords.y;
  }

  clone(): Coords {
    return new Coords(this.x, this.y);
  }

  add(direction: Direction): Coords {
    return new Coords(this.x + direction.dx, this.y + direction.dy);
  }
}
