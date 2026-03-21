import type { MenuInputType } from './MenuInputType';

export type MenuAction = {
  type: MenuInputType;
  payload?: any;
};
