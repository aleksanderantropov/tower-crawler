import { Coords } from './Coords';

export class Room {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
  readonly width: number;
  readonly height: number;
  readonly center: Coords;

  constructor({
    width,
    height,
    x,
    y,
  }: {
    width: number;
    height: number;
    x: number;
    y: number;
  }) {
    this.left = x;
    this.right = x + width;
    this.top = y;
    this.bottom = y + height;

    this.width = width;
    this.height = height;

    this.center = new Coords(
      Math.floor(this.left + this.width / 2),
      Math.floor(this.top + this.height / 2),
    );
  }

  intersectsWith(room: Room): boolean {
    return (
      this.left <= room.right &&
      room.left <= this.right &&
      this.top <= room.bottom &&
      room.top <= this.bottom
    );
  }
}
