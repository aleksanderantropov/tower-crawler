import { EnemyType } from '../types/EnemyType';

export const SETTINGS = {
  gameMap: {
    width: 20,
    height: 20,
    rooms: {
      maxRooms: 50,
      minSize: 2,
      maxSize: 4,
    },
  },
  player: {
    view: 3,
    hp: 20,
    attack: 5,
  },
  enemies: {
    [EnemyType.SLIME]: {
      type: EnemyType.SLIME,
      view: 8,
      hp: 5,
      attack: 2,
    },
  },
  renderer: {
    id: 'canvas',
    tileSize: 32,
    width: 640,
    height: 640,
    colors: {
      player: '#e74c3c',
      enemies: {
        [EnemyType.SLIME]: '#f1c40f',
      },
      tiles: {
        floor: '#2c3e50',
        wall: '#ecf0f1',
        fog: '#000',
        default: '#fff',
      },
    },
    alpha: {
      visibility: {
        hidden: 0,
        revealed: 0.5,
        visible: 1,
        default: 1,
      },
    },
  },
} as const;

export type Settings = typeof SETTINGS;
