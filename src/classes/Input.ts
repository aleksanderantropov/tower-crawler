import type { Settings } from '../configs/settings';
import type { Ability } from '../types/Ability';
import type { Direction } from '../types/Direction';

type OnMove = (direction: Direction) => void;
type OnInventoryUse = (index: number) => void;
type OnAbilityUse = (index: number) => void;

export class Input {
  onMove: OnMove;
  onInventoryUse: OnInventoryUse;
  onAbilityUse: OnAbilityUse;
  onRestart: VoidFunction;
  inventoryElement: HTMLOListElement;
  restartButtonElement: HTMLButtonElement;

  constructor({
    onMove,
    onInventoryUse,
    onAbilityUse,
    onRestart,
    settings,
  }: {
    onMove: OnMove;
    onInventoryUse: OnInventoryUse;
    onAbilityUse: OnAbilityUse;
    onRestart: VoidFunction;
    settings: Settings['ui'];
  }) {
    this.onMove = onMove;
    this.onInventoryUse = onInventoryUse;
    this.onAbilityUse = onAbilityUse;
    this.onRestart = onRestart;

    this.inventoryElement = document.getElementById(
      settings.id.inventory,
    ) as HTMLOListElement;

    this.restartButtonElement = document.getElementById(
      settings.id.restartButton,
    ) as HTMLButtonElement;
  }

  init(): void {
    document.addEventListener('keydown', this.handleKeyDown);
    this.inventoryElement.addEventListener('click', this.handleInventoryClick);
    this.restartButtonElement.addEventListener(
      'click',
      this.handleRestartClick,
    );
  }

  handleKeyDown = (event: KeyboardEvent): void => {
    this.handleMoveKeys(event);
    this.handleInventoryKeys(event);
    this.handleAbilityKeys(event);
  };

  handleMoveKeys(event: KeyboardEvent): void {
    const moveDirections: { [key: KeyboardEvent['code']]: Direction } = {
      ArrowUp: { dx: 0, dy: -1 },
      ArrowDown: { dx: 0, dy: 1 },
      ArrowLeft: { dx: -1, dy: 0 },
      ArrowRight: { dx: 1, dy: 0 },
      Space: { dx: 0, dy: 0 },
    };

    const move = moveDirections[event.code];

    if (move) {
      event.preventDefault();
      this.onMove(move);
    }
  }

  handleInventoryKeys(event: KeyboardEvent): void {
    const inventorySlot = parseInt(event.key, 10);

    if (!Number.isInteger(inventorySlot) || inventorySlot - 1 < 0) {
      return;
    }

    this.onInventoryUse(inventorySlot - 1);
  }

  handleAbilityKeys(event: KeyboardEvent): void {
    const abilityIndices: { [key: KeyboardEvent['key']]: number } = {
      q: 0,
    };

    const abilityIndex = abilityIndices[event.key];

    if (abilityIndex === undefined) {
      return;
    }

    this.onAbilityUse(abilityIndex);
  }

  handleInventoryClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement;

    if (!target.hasAttribute('data-index')) {
      return;
    }

    const index = parseInt(target.dataset.index || '0', 10);

    this.onInventoryUse(index);
  };

  handleRestartClick = (): void => {
    this.onRestart();
  };

  destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    this.inventoryElement.removeEventListener(
      'click',
      this.handleInventoryClick,
    );
  }
}
