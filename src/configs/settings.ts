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
    hp: 12,
    power: 3,
  },
  enemies: {
    spawn: {
      [EnemyType.SLIME]: 16,
      [EnemyType.SKELETON]: 10,
    },
    stats: {
      [EnemyType.SLIME]: {
        type: EnemyType.SLIME,
        view: 2,
        hp: 4,
        power: 1,
      },
      [EnemyType.SKELETON]: {
        type: EnemyType.SKELETON,
        view: 3,
        hp: 6,
        power: 2,
      },
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
        [EnemyType.SLIME]: '#207e1d',
        [EnemyType.SKELETON]: '#6a6c6a',
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
  stats: {
    id: 'stats',
  },
} as const;

export type Settings = typeof SETTINGS;
