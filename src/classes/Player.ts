import type { Point } from '../types/Point';

export class Player {
  constructor(
    public x: number,
    public y: number,
  ) {}

  getPos(): Point {
    return {
      x: this.x,
      y: this.y,
    };
  }

  move({ x, y }: Point) {
    [this.x, this.y] = [x, y];
  }
}
