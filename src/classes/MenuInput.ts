import type { Settings } from '../configs/settings';
import type { MenuAction } from '../types/MenuAction';
import { MenuInputType } from '../types/MenuInputType';

export class MenuInput {
  restartButtonElement: HTMLButtonElement;
  resolvePromise = (action: MenuAction) => {};

  constructor(settings: Settings['ui']) {
    this.restartButtonElement = document.getElementById(
      settings.id.restartButton,
    ) as HTMLButtonElement;

    this.restartButtonElement.addEventListener(
      'click',
      this.handleRestartClick,
    );
  }

  handleRestartClick = (): void => {
    this.resolvePromise(this.createInputAction(MenuInputType.GAME_RESTART));
  };

  async awaitAction(): Promise<MenuAction> {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
    });
  }

  private createInputAction(type: MenuInputType, payload?: any): MenuAction {
    return { type, payload };
  }
}
