import type { Settings } from '../configs/settings';
import type { Ability } from '../types/Ability';
import { AbilityType } from '../types/AbilityType';
import type { Direction } from '../types/Direction';
import type { GameAction } from '../types/GameAction';
import { GameInputType } from '../types/GameInputType';

export class GameInput {
  inventoryElement: HTMLOListElement;
  resolvePromise = (action: GameAction) => {};

  constructor(settings: Settings['ui']) {
    this.inventoryElement = document.getElementById(
      settings.id.inventory,
    ) as HTMLOListElement;
  }

  init(): void {
    document.addEventListener('keydown', this.handleKeyDown);
    this.inventoryElement.addEventListener('click', this.handleInventoryClick);
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

    const moveDirection = moveDirections[event.code];

    if (!moveDirection) {
      return;
    }

    event.preventDefault();
    this.resolvePromise?.(
      this.createInputAction(GameInputType.PLAYER_MOVE, moveDirection),
    );
  }

  handleInventoryKeys(event: KeyboardEvent): void {
    const inventorySlot = parseInt(event.key, 10);
    const inventoryIndex = inventorySlot - 1;

    if (!Number.isInteger(inventoryIndex) || inventoryIndex < 0) {
      return;
    }

    this.resolvePromise?.(
      this.createInputAction(GameInputType.INVENTORY_USE, inventoryIndex),
    );
  }

  handleAbilityKeys(event: KeyboardEvent): void {
    const abilityTypes: { [key: KeyboardEvent['key']]: number } = {
      q: AbilityType.DASH,
      e: AbilityType.CLEAVE,
    };

    const abilityType = abilityTypes[event.key];

    if (abilityType === undefined) {
      return;
    }

    this.resolvePromise(
      this.createInputAction(GameInputType.ABILITY_USE, abilityType),
    );
  }

  handleInventoryClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement;

    if (!target.hasAttribute('data-index')) {
      return;
    }

    const index = parseInt(target.dataset.index || '0', 10);

    this.resolvePromise(
      this.createInputAction(GameInputType.INVENTORY_USE, index),
    );
  };

  destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    this.inventoryElement.removeEventListener(
      'click',
      this.handleInventoryClick,
    );
  }

  async awaitAction(): Promise<GameAction> {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
    });
  }

  private createInputAction(type: GameInputType, payload?: any): GameAction {
    return { type, payload };
  }
}
