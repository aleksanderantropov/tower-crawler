import type { Move } from '../types/Move';

type OnMove = (move: Move) => void;
type OnInventoryUse = (index: number) => void;

export class Input {
  onMove: OnMove;
  onInventoryUse: OnInventoryUse;

  constructor({
    onMove,
    onInventoryUse,
  }: {
    onMove: OnMove;
    onInventoryUse: OnInventoryUse;
  }) {
    this.onMove = onMove;
    window.addEventListener('keydown', (e) => {
      this.handleMoveKeys(e);
      this.handleInventoryKeys(e);
    });

    this.onInventoryUse = onInventoryUse;
    const inventory = document.getElementById('inventory');
    inventory?.addEventListener('click', (e) => this.handleInventoryClick(e));
  }

  handleMoveKeys(event: KeyboardEvent): void {
    const moveActions: { [key: KeyboardEvent['key']]: Move } = {
      ArrowUp: { dx: 0, dy: -1 },
      ArrowDown: { dx: 0, dy: 1 },
      ArrowLeft: { dx: -1, dy: 0 },
      ArrowRight: { dx: 1, dy: 0 },
      Space: { dx: 0, dy: 0 },
    };

    const move = moveActions[event.code];

    if (move) {
      event.preventDefault();
      this.onMove(move);
    }
  }

  handleInventoryKeys(event: KeyboardEvent): void {
    const inventorySlot = parseInt(event.key, 10);

    if (inventorySlot - 1 < 0) {
      return;
    }

    this.onInventoryUse(inventorySlot - 1);
  }

  handleInventoryClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!target.hasAttribute('data-index')) {
      return;
    }

    const index = parseInt(target.dataset.index || '0', 10);

    this.onInventoryUse(index);
  }
}
