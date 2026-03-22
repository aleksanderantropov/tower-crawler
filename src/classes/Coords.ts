import type { Direction } from '../types/Direction';

export class Coords {
  constructor(
    public x: number,
    public y: number,
  ) {}

  equalTo(coords: Coords): boolean {
    return this.x === coords.x && this.y === coords.y;
  }

  clone(direction?: Direction): Coords {
    if (!direction) {
      return new Coords(this.x, this.y);
    }

    return new Coords(this.x + direction.dx, this.y + direction.dy);
  }
}
