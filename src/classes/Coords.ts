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

  multiply(multiplier: number | Coords): this {
    if (multiplier instanceof Coords) {
      this.x *= multiplier.x;
      this.y *= multiplier.y;
    } else {
      this.x *= multiplier;
      this.y *= multiplier;
    }

    return this;
  }

  add(addend: number | Coords): this {
    if (addend instanceof Coords) {
      this.x += addend.x;
      this.y += addend.y;
    } else {
      this.x += addend;
      this.y += addend;
    }

    return this;
  }

  subtract(addend: number | Coords): this {
    if (addend instanceof Coords) {
      this.x -= addend.x;
      this.y -= addend.y;
    } else {
      this.x -= addend;
      this.y -= addend;
    }

    return this;
  }
}
