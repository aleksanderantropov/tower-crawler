export interface Animation {
  update(): void;
  duration: number;
  isFinished: boolean;
}
