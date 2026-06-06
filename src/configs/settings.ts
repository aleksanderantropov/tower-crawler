import { Visibility } from '../classes/Visibility';
import { AbilityType } from '../types/AbilityType';
import { AnimationType } from '../types/AnimationType';
import { EnemyType } from '../types/EnemyType';
import { ItemType } from '../types/ItemType';
import { TileType } from '../types/TileType';
import { VisibilityType } from '../types/VisibilityType';

export const SETTINGS = {
  gameMap: {
    width: 100,
    height: 100,
    rooms: {
      maxRooms: 500,
      minSize: 4,
      maxSize: 20,
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
      [EnemyType.SLIME]: 200,
      [EnemyType.SKELETON]: 100,
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
      name: 'Health Potion',
      effectValue: 5,
    },
    [ItemType.WEAPON]: {
      name: 'Sword',
      effectValue: 1,
    },
  },
  renderer: {
    canvas: {
      id: 'canvas',
      width: 640,
      height: 640,
    },
    world: {
      tileSize: 32,
    },
    minimap: {
      width: 200,
      height: 200,
      borderWidth: 1,
      alpha: 0.8,
    },
    player: {
      color: '#e74c3c',
    },
    enemies: {
      [EnemyType.SLIME]: {
        color: '#207e1d',
      },
      [EnemyType.SKELETON]: {
        color: '#6a6c6a',
      },
    },
    items: {
      [ItemType.POTION]: {
        color: '#af2121',
      },
      [ItemType.WEAPON]: { color: '#9b59b6' },
    },
    tiles: {
      [TileType.FLOOR]: { color: '#2c3e50' },
      [TileType.WALL]: { color: '#ecf0f1' },
      default: { color: '#fff' },
    },
    visibility: {
      alpha: {
        [VisibilityType.HIDDEN]: 0,
        [VisibilityType.REVEALED]: 0.5,
        [VisibilityType.VISIBLE]: 1,
        default: 1,
      },
    },
    animations: {
      [AnimationType.SHAKE]: {
        duration: 100,
      },
      [AnimationType.DAMAGE_NUMBER]: {
        colors: {
          player: '#e74c3c',
          enemies: '#f1c40f',
        },
        text: 'bold 16px sans-serif',
        duration: 1000,
      },
      [AnimationType.HIT_FLASH_ANIMATION]: {
        color: '#fff',
        duration: 150,
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
