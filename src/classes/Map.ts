import type { Settings } from '../configs/settings';
import type { Point } from '../types/Point';
import { TileType } from '../types/TileType';
import { Room } from './Room';

export class Map {
  width: number;
  height: number;
  tiles: TileType[][];
  rooms: Room[];

  constructor({ width, height, rooms }: Settings['gameMap']) {
    this.width = width;
    this.height = height;
    this.tiles = Array.from({ length: this.height }, () =>
      Array(this.width).fill(TileType.WALL),
    );
    this.rooms = [];

    this.generate(rooms);
  }

  // Generates map with Random Room Placement algorythm
  private generate({
    maxRooms,
    minSize,
    maxSize,
  }: Settings['gameMap']['rooms']) {
    for (let i = 0; i < maxRooms; i++) {
      const newRoom = this.createRoom(minSize, maxSize);
      const intersects = this.checkRoomsIntersection(newRoom);

      if (!intersects) {
        this.fillRoom(newRoom, TileType.FLOOR);

        if (this.rooms.length > 0) {
          this.digCorridor(this.rooms[this.rooms.length - 1], newRoom);
        }

        this.rooms.push(newRoom);
      }
    }
  }

  isTileWalkable({ x, y }: Point): boolean {
    return this.tiles[y]?.[x] && this.tiles[y][x] !== TileType.WALL;
  }

  static calcDistance(p1: Point, p2: Point): number {
    const dx = Math.abs(p1.x - p2.x);
    const dy = Math.abs(p1.y - p2.y);

    return Math.sqrt(dx * dx + dy * dy);
  }

  // Checks if newRoom intersects with existing rooms
  private checkRoomsIntersection(newRoom: Room): boolean {
    return this.rooms.some((existingRoom) =>
      newRoom.intersectsWith(existingRoom),
    );
  }

  // Inits a Room
  private createRoom(minSize: number, maxSize: number): Room {
    // Math.floor gives better despersion: Math.round gives average numbers higher probability
    const width = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
    const height =
      Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
    // +1 and -1 guarantee that rooms don't touch edges
    const x = Math.floor(Math.random() * (this.width - width - 1)) + 1;
    const y = Math.floor(Math.random() * (this.height - height - 1)) + 1;

    return new Room({ width, height, x, y });
  }

  // Fills room with tileType
  private fillRoom(room: Room, tileType: TileType): void {
    for (let i = room.top; i < room.bottom; i++) {
      for (let j = room.left; j < room.right; j++) {
        this.tiles[i][j] = tileType;
      }
    }
  }

  // Creates a corridor between rooms
  private digCorridor(room1: Room, room2: Room): void {
    const start = room1.center;
    const end = room2.center;

    // Random order of vertical and horizontal lines
    if (Math.random() > 0.5) {
      this.drawHorizontalLine({
        tileType: TileType.FLOOR,
        x1: start.x,
        x2: end.x,
        y: start.y,
      });
      this.drawVerticalLine({
        tileType: TileType.FLOOR,
        y1: start.y,
        y2: end.y,
        x: end.x,
      });
    } else {
      this.drawVerticalLine({
        tileType: TileType.FLOOR,
        y1: start.y,
        y2: end.y,
        x: start.x,
      });
      this.drawHorizontalLine({
        tileType: TileType.FLOOR,
        x1: start.x,
        x2: end.x,
        y: end.y,
      });
    }
  }

  private drawVerticalLine({
    x,
    y1,
    y2,
    tileType,
  }: {
    x: number;
    y1: number;
    y2: number;
    tileType: TileType;
  }): void {
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
      this.tiles[y][x] = tileType;
    }
  }

  private drawHorizontalLine({
    y,
    x1,
    x2,
    tileType,
  }: {
    y: number;
    x1: number;
    x2: number;
    tileType: TileType;
  }): void {
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
      this.tiles[y][x] = tileType;
    }
  }
}
