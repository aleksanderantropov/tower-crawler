import type { Settings } from '../configs/settings';
import type { Player } from './Player';

export class Stats {
  player: Player;
  element: HTMLDivElement;

  constructor(player: Player, settings: Settings['stats']) {
    this.player = player;
    this.element = document.getElementById(settings.id) as HTMLDivElement;
  }

  update(): void {
    this.element.innerHTML = `HP: ${this.player.currentHp} / ${this.player.maxHp}`;
  }
}
