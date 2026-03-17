import type { Settings } from '../configs/settings';
import type { Player } from './Player';

export class UI {
  player: Player;
  stats: HTMLDivElement;
  inventory: HTMLDivElement;
  settings: Settings['ui'];

  constructor(player: Player, settings: Settings['ui']) {
    this.player = player;
    this.settings = settings;

    this.stats = document.getElementById(settings.id.stats) as HTMLDivElement;
    this.inventory = document.getElementById(
      settings.id.inventory,
    ) as HTMLDivElement;
  }

  update(): void {
    this.stats.innerHTML = `
<li>Здоровье: ${this.player.currentHp} / ${this.player.maxHp}</li>
<li>Атака: ${this.player.power}</li>
`;

    this.inventory.innerHTML = `
${this.player.inventory.map((item, index) => `<li>${item} <button data-index="${index}">Использовать</button></li>`).join('')}
`;
  }
}
