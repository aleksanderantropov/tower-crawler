import { CanvasRenderer } from './src/classes/CanvasRenderer';
import { GameMap } from './src/classes/GameMap';
import { InputHandler } from './src/classes/InputHandler';
import { Player } from './src/classes/Player';
import { VisibilityMap } from './src/classes/VisibilityMap';
import { SETTINGS } from './src/configs/settings';
import type { Move } from './src/types/Move';

const gameMap = new GameMap(SETTINGS.gameMap);
const visibilityMap = new VisibilityMap({
  width: gameMap.width,
  height: gameMap.height,
  viewDistance: SETTINGS.visibilityMap.viewDistance,
});
const renderer = new CanvasRenderer(SETTINGS.renderer);

const playerStartRoom = gameMap.rooms[0];
const player = new Player(playerStartRoom.center.x, playerStartRoom.center.y);

new InputHandler(({ dx, dy }: Move) => {
  const nextMove = { x: player.x + dx, y: player.y + dy };

  if (gameMap.isTileWalkable(nextMove)) {
    player.setPos(nextMove);
    visibilityMap.update(player, gameMap.tiles);
    renderer.render({
      map: gameMap.tiles,
      visibility: visibilityMap.visibility,
      player,
    });
  }
});

visibilityMap.update(player, gameMap.tiles);
renderer.render({
  map: gameMap.tiles,
  visibility: visibilityMap.visibility,
  player,
});
