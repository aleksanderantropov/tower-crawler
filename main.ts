import { CanvasRenderer } from './src/classes/CanvasRenderer';
import { DungeonGenerator } from './src/classes/DungeonGenerator';
import { SETTINGS } from './src/configs/settings';

const dungeon = new DungeonGenerator(SETTINGS.dungeon);
const map = dungeon.generateRooms(SETTINGS.rooms);
const renderer = new CanvasRenderer(SETTINGS.renderer);
renderer.render(map);
