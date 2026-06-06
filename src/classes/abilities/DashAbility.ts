import type { Ability } from '../../types/Ability';
import { AbilityType } from '../../types/AbilityType';
import { Coords } from '../Coords';
import type { Player } from '../Player';

type isTileWalkable = (tile: Coords) => boolean;

type DashAbilityProps = {
  maxCd: number;
  range: number;
  isTileWalkable: isTileWalkable;
  cd?: number;
  name?: string;
};

export class DashAbility implements Ability {
  type = AbilityType.DASH;
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
    name = 'Dash',
  }: DashAbilityProps) {
    this.cd = cd;
    this.maxCd = maxCd;
    this.name = name;
    this.isTileWalkable = isTileWalkable;
    this.range = range;
  }

  use(user: Player): void {
    if (!this.ready) {
      return;
    }

    this.cd = this.maxCd;

    for (let i = 1; i <= this.range; i++) {
      const nextTile = user.coords.clone().add(user.viewDirection);

      if (!this.isTileWalkable(nextTile)) {
        return;
      }

      user.move(nextTile);
    }
  }

  decreaseCooldown(): void {
    this.cd = Math.max(0, this.cd - 1);
  }

  get ready(): boolean {
    return this.cd === 0;
  }
}
