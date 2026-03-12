import type { Move } from '../types/Move';

export class InputHandler {
  onMove: (move: Move) => void;

  constructor(onMove: (move: Move) => void) {
    this.onMove = onMove;
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  handleKeyDown(event: KeyboardEvent): void {
    const actions: { [key: KeyboardEvent['key']]: Move } = {
      ArrowUp: { dx: 0, dy: -1 },
      ArrowDown: { dx: 0, dy: 1 },
      ArrowLeft: { dx: -1, dy: 0 },
      ArrowRight: { dx: 1, dy: 0 },
    };

    const move = actions[event.key];

    if (move) {
      event.preventDefault();
      this.onMove(move);
    }
  }
}
