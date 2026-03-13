import type { Move } from '../types/Move';

export class Input {
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
      Space: { dx: 0, dy: 0 },
    };

    const move = actions[event.code];

    if (move) {
      event.preventDefault();
      this.onMove(move);
    }
  }
}
