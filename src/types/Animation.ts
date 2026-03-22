import type { Settings } from '../configs/settings';
import type { AnimationRenderingPhase } from './AnimationRenderingPhase';

export interface Animation {
  duration: number;
  isFinished: boolean;
  phase: AnimationRenderingPhase;
  update(): void;
  render(ctx: CanvasRenderingContext2D, settings: Settings['renderer']): void;
}
