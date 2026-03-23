import type { Settings } from '../configs/settings';
import { AbilityType } from '../types/AbilityType';
import type { Player } from './Player';

export class UI {
  stats: HTMLDivElement;
  inventory: HTMLDivElement;
  abilities: HTMLDivElement;
  gameOver: HTMLDivElement;
  restartButton: HTMLButtonElement;

  constructor(private settings: Settings['ui']) {
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

    this.restartButton = document.getElementById(
      settings.id.restartButton,
    ) as HTMLButtonElement;
  }

  update(player: Player): void {
    this.stats.innerHTML = `
<li>Health: ${player.currentHp} / ${player.maxHp}</li>
<li>Power: ${player.power}</li>
<li>Weapon: ${player.weapon ?? '-'}</li>
`;

    this.inventory.innerHTML = `
${player.inventory.map((item, index) => `<li>${item} <button data-index="${index}">Use</button></li>`).join('')}
`;
    this.abilities.innerHTML = `
${player.abilities.map((ability) => `<li>${this.settings.keyboardShortcuts.abilities[ability.type].toUpperCase()}: ${ability.name} [${ability.ready ? 'Ready' : ability.cd}]</li>`).join('')}
`;
  }

  showGameOverScreen(): void {
    this.gameOver.classList.add('shown');
    this.restartButton.focus();
  }

  hideGameOverScreen(): void {
    this.gameOver.classList.remove('shown');
  }
}
