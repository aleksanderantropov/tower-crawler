import type { Settings } from '../configs/settings';
import type { ItemType } from '../types/ItemType';
import { Coords } from './Coords';
import type { Enemy } from './Enemy';
import { Item } from './Item';
import type { Player } from './Player';

export class ItemManager {
  items: Item[];
  settings: Settings['items'];

  constructor(settings: Settings['items']) {
    this.items = [];
    this.settings = settings;
  }

  removeItem(item: Item): void {
    this.items = this.items.filter((_item) => _item !== item);
  }

  spawnItems = (enemy: Enemy, isWall: (tile: Coords) => boolean): void => {
    for (const [lootType, chance] of Object.entries(enemy.lootTable)) {
      if (Math.random() > chance) {
        continue;
      }

      const { effectValue, name } = this.settings[lootType as ItemType];
      const tile = this.findItemSpawnTile(enemy.coords, isWall);

      if (!tile) {
        continue;
      }

      const item = new Item({
        coords: tile,
        effectValue: effectValue,
        name: name,
        type: lootType as ItemType,
      });

      this.items.push(item);
    }
  };

  private findItemSpawnTile(
    originalTile: Coords,
    isWall: (tile: Coords) => boolean,
  ): Coords | null {
    if (!this.tileHasItem(originalTile)) {
      return originalTile;
    }

    const { x, y } = originalTile;

    const possibleTiles = [
      new Coords(x - 1, y - 1),
      new Coords(x, y - 1),
      new Coords(x + 1, y - 1),
      new Coords(x + 1, y),
      new Coords(x + 1, y + 1),
      new Coords(x, y + 1),
      new Coords(x - 1, y + 1),
      new Coords(x - 1, y),
    ];

    while (possibleTiles.length) {
      const tile = possibleTiles.pop();

      if (tile && !isWall(tile) && !this.tileHasItem(tile)) {
        return tile;
      }
    }

    return null;
  }

  tileHasItem(tile: Coords): boolean {
    return this.items.some((item) => tile.equalTo(item.coords));
  }

  findItemByTile(tile: Coords): Item | undefined {
    return this.items.find((item) => item.coords.equalTo(tile));
  }
}
