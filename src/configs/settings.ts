import { TileType } from '../types/TileType';

export const SETTINGS = {
  dungeon: {
    width: 20,
    height: 20,
  },
  rooms: {
    maxRooms: 50,
    minSize: 2,
    maxSize: 4,
  },
  renderer: {
    id: 'canvas',
    tileSize: 32,
    width: 640,
    height: 640,
    colors: {
      floor: '#2c3e50',
      wall: '#ecf0f1',
      default: '#fff',
    },
  },
} as const;

export type Settings = typeof SETTINGS;
