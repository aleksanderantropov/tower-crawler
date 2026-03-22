import type { Ability } from '../../types/Ability';
import type { Combatant } from '../../types/Combatant';
import type { Direction } from '../../types/Direction';
import { Coords } from '../Coords';

type isTileWalkable = (tile: Coords) => boolean;

export class DashAbility implements Ability {
  cd: number;
  maxCd: number;
  range: number;
  name: string;
  isTileWalkable: isTileWalkable;

  constructor({
    maxCd,
    range,
    isTileWalkable,
    cd = 0,
    name = 'Рывок',
  }: {
    maxCd: number;
    range: number;
    isTileWalkable: isTileWalkable;
    cd?: number;
    name?: string;
  }) {
    this.cd = cd;
    this.maxCd = maxCd;
    this.name = name;
    this.isTileWalkable = isTileWalkable;
    this.range = range;
  }

  use(target: Combatant, direction: Direction): void {
    if (!this.ready) {
      return;
    }

    this.cd = this.maxCd;

    for (let i = 1; i <= this.range; i++) {
      const nextTile = new Coords(
        target.coords.x + direction.dx,
        target.coords.y + direction.dy,
      );

      if (!this.isTileWalkable(nextTile)) {
        return;
      }

      target.move(nextTile);
    }
  }

  decreaseCooldown(): void {
    this.cd = Math.max(0, this.cd - 1);
  }

  get ready(): boolean {
    return this.cd === 0;
  }
}
