import { CanvasRenderer } from './src/classes/CanvasRenderer';
import { Enemy } from './src/classes/Enemy';
import { GameMap } from './src/classes/GameMap';
import { InputHandler } from './src/classes/InputHandler';
import { Player } from './src/classes/Player';
import { VisibilityMap } from './src/classes/VisibilityMap';
import { SETTINGS } from './src/configs/settings';
import { EnemyType } from './src/types/EnemyType';
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
const enemies = gameMap.rooms.slice(1).map(
  (room) =>
    new Enemy({
      x: room.center.x,
      y: room.center.y,
      type: EnemyType.SLIME,
      aggroRadius: SETTINGS.enemies.aggroRadius[EnemyType.SLIME],
    }),
);

new InputHandler(({ dx, dy }: Move) => {
  const nextMove = { x: player.x + dx, y: player.y + dy };

  if (gameMap.isTileWalkable(nextMove)) {
    // Step 1.
    player.move(nextMove);

    // Step 2.
    enemies.forEach((enemy) => {
      if (enemy.isWithinAggroRadius(player)) {
        enemy.moveTowards(player, gameMap);
      }
    });

    // Step 3.
    visibilityMap.update(player, gameMap.tiles);

    renderer.render({
      tiles: gameMap.tiles,
      visibility: visibilityMap.visibility,
      player,
      enemies,
    });
  }
});

visibilityMap.update(player, gameMap.tiles);
renderer.render({
  tiles: gameMap.tiles,
  visibility: visibilityMap.visibility,
  player,
  enemies,
});
