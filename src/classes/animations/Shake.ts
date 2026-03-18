import { Coords } from '../Coords';

export class Shake {
  isFinished: boolean;
  duration: number;
  offset: Coords;

  constructor({ duration }: { duration: number }) {
    this.isFinished = false;
    this.duration = duration;
    this.offset = new Coords(0, 0);
  }

  play(): void {
    setTimeout(() => {
      this.isFinished = true;
    }, this.duration);

    if (this.isFinished) {
      this.offset.x = 0;
      this.offset.y = 0;
      return;
    }

    this.offset.x = Math.random() * 10;
    this.offset.y = Math.random() * 10;
  }
}
