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
  },
} as const;
