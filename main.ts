import { CanvasRenderer } from './src/classes/CanvasRenderer';
import { DungeonGenerator } from './src/classes/DungeonGenerator';
import { InputHandler } from './src/classes/InputHandler';
import { Player } from './src/classes/Player';
import { SETTINGS } from './src/configs/settings';
import type { Move } from './src/types/Move';

const dungeon = new DungeonGenerator(SETTINGS.dungeon);
const map = dungeon.generateRooms(SETTINGS.rooms);
const visibility = dungeon.visibility;
const renderer = new CanvasRenderer(SETTINGS.renderer);
const playerStartRoom = dungeon.rooms[0];
const player = new Player(playerStartRoom.center.x, playerStartRoom.center.y);

new InputHandler(({ dx, dy }: Move) => {
  const nextMove = { x: player.x + dx, y: player.y + dy };

  if (dungeon.isTileWalkable(nextMove)) {
    player.setPos(nextMove);
    dungeon.updateVisibility(player);
    renderer.render({ map, visibility, player });
  }
});

dungeon.updateVisibility(player);
renderer.render({ map, visibility, player });
