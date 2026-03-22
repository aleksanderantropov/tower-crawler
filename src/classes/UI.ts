import type { Settings } from '../configs/settings';
import type { Player } from './Player';

export class UI {
  stats: HTMLDivElement;
  inventory: HTMLDivElement;
  abilities: HTMLDivElement;
  gameOver: HTMLDivElement;
  settings: Settings['ui'];

  constructor(settings: Settings['ui']) {
    this.settings = settings;

    this.stats = document.getElementById(settings.id.stats) as HTMLDivElement;
    this.inventory = document.getElementById(
      settings.id.inventory,
    ) as HTMLDivElement;
    this.abilities = document.getElementById(
      settings.id.abilities,
    ) as HTMLDivElement;
    this.gameOver = document.getElementById(
      settings.id.gameOver,
    ) as HTMLDivElement;
  }

  update(player: Player): void {
    this.stats.innerHTML = `
<li>Здоровье: ${player.currentHp} / ${player.maxHp}</li>
<li>Cила: ${player.power}</li>
<li>Оружие: ${player.weapon ?? '-'}</li>
`;

    this.inventory.innerHTML = `
${player.inventory.map((item, index) => `<li>${item} <button data-index="${index}">Использовать</button></li>`).join('')}
`;
    this.abilities.innerHTML = `
${player.abilities.map((ability) => `<li>Q: ${ability.name}: ${ability.ready ? 'Готово' : ability.cd}</li>`).join('')}
`;
  }

  showGameOverScreen(): void {
    this.gameOver.classList.add('shown');
  }

  hideGameOverScreen(): void {
    this.gameOver.classList.remove('shown');
  }
}
