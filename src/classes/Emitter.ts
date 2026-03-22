type Listener<T> = (payload: T) => void;

export class Emitter<T> {
  private listeners: Listener<T>[] = [];

  on(listener: Listener<T>): void {
    this.listeners.push(listener);
  }

  emit(payload: T): void {
    this.listeners.forEach((listener) => listener.call(this, payload));
  }

  off(listener: Listener<T>): void {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  clear(): void {
    this.listeners = [];
  }
}
