import { AbilityType } from '../types/AbilityType';
import { AnimationType } from '../types/AnimationType';
import { EnemyType } from '../types/EnemyType';
import { ItemType } from '../types/ItemType';

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
    stats: {
      view: 3,
      hp: 12,
      power: 3,
    },
    abilities: {
      [AbilityType.DASH]: {
        maxCd: 5,
        range: 2,
      },
      [AbilityType.CLEAVE]: {
        maxCd: 10,
        radius: 1,
        damageMultiplier: 1.5,
      },
    },
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
        view: 2,
        hp: 6,
        power: 2,
      },
    },
    lootTable: {
      [EnemyType.SLIME]: {
        [ItemType.POTION]: 0.2,
        [ItemType.WEAPON]: 0.1,
      },
      [EnemyType.SKELETON]: {
        [ItemType.POTION]: 0.4,
        [ItemType.WEAPON]: 0.2,
      },
    },
  },
  items: {
    [ItemType.POTION]: {
      name: 'Зелье здоровья',
      effectValue: 5,
    },
    [ItemType.WEAPON]: {
      name: 'Меч',
      effectValue: 3,
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
      items: {
        [ItemType.POTION]: '#af2121',
        [ItemType.WEAPON]: '#9b59b6',
      },
      tiles: {
        floor: '#2c3e50',
        wall: '#ecf0f1',
        fog: '#000',
        default: '#fff',
      },
      animations: {
        [AnimationType.DAMAGE_NUMBER]: {
          player: '#e74c3c',
          enemies: '#f1c40f',
        },
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
    text: {
      animations: {
        [AnimationType.DAMAGE_NUMBER]: 'bold 16px sans-serif',
      },
    },
    duration: {
      animations: {
        [AnimationType.SHAKE]: 100,
        [AnimationType.DAMAGE_NUMBER]: 1000,
      },
    },
  },
  ui: {
    id: {
      stats: 'stats',
      inventory: 'inventory',
      abilities: 'abilities',
      gameOver: 'gameOver',
      restartButton: 'restart',
    },
    keyboardShortcuts: {
      abilities: {
        [AbilityType.CLEAVE]: 'e',
        [AbilityType.DASH]: 'q',
      },
    },
  },
} as const;

export type Settings = typeof SETTINGS;
