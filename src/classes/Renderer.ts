import type { Settings } from '../configs/settings';
import type { Animation } from '../types/Animation';
import { AnimationRenderingPhase } from '../types/AnimationRenderingPhase';
import type { Motion } from '../types/Motion';
import { VisibilityType } from '../types/VisibilityType';
import { Coords } from './Coords';
import type { Enemy } from './Enemy';
import type { Item } from './Item';
import type { GameMap } from './GameMap';
import type { Player } from './Player';
import type { Visibility } from './Visibility';

export class Renderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  animations: Animation[] = [];
  motions = new Map<string, Motion>();

  constructor(private settings: Settings['renderer']) {
    this.canvas = document.getElementById(
      settings.canvas.id,
    ) as HTMLCanvasElement;
    this.canvas.width = settings.canvas.width;
    this.canvas.height = settings.canvas.height;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
  }

  render({
    tiles,
    visibility,
    player,
    enemies,
    items,
  }: {
    tiles: GameMap['tiles'];
    visibility: Visibility['tiles'];
    player: Player;
    enemies: Enemy[];
    items: Item[];
  }): void {
    this.clear();
    this.updateMotions();
    this.updateAnimations();

    this.drawWorld({ player, tiles, visibility, enemies, items });
    this.drawMinimap({ player, tiles, visibility, enemies, items });
  }

  playAnimations(...animations: Animation[]): void {
    this.animations.push(...animations);
  }

  startMotion(motion: Motion): void {
    this.motions.set(motion.unitId, motion);
  }

  private drawWorld({
    player,
    tiles,
    visibility,
    enemies,
    items,
  }: Parameters<Renderer['render']>[0]): void {
    this.ctx.save();

    const playerCoords = this.calcPlayerIntermediateCoords(player);

    this.centerCameraOnPlayer(playerCoords);
    this.renderAnimation(AnimationRenderingPhase.PRE);
    this.drawMap({ tiles, visibility, size: this.settings.world.tileSize });
    this.drawPlayer(playerCoords);
    this.drawEnemies(enemies, visibility);
    this.drawItems(items, visibility);
    this.renderAnimation(AnimationRenderingPhase.POST);

    this.ctx.restore();
  }

  private calcPlayerIntermediateCoords(player: Player): Coords {
    return this.motions.get(player.id)?.currentCoords ?? player.coords;
  }

  private drawMinimap({
    tiles,
    visibility,
  }: Parameters<Renderer['render']>[0]): void {
    const { alpha, borderWidth, height, width } = this.settings.minimap;

    const scale = Math.min(width / tiles[0].length, height / tiles.length);

    this.ctx.save();

    // border
    this.ctx.strokeStyle = '#e9e9e9';
    this.ctx.strokeRect(
      borderWidth,
      borderWidth,
      width + borderWidth,
      height + borderWidth,
    );

    // background
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(borderWidth, borderWidth, width, height);
    this.ctx.globalAlpha = borderWidth;

    this.drawMap({ tiles, visibility, size: scale });

    this.ctx.restore();
  }

  private clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private centerCameraOnPlayer(player: Coords): void {
    const cameraOffsetX =
      player.x * this.settings.world.tileSize -
      this.canvas.width / 2 +
      this.settings.world.tileSize / 2;
    const cameraOffsetY =
      player.y * this.settings.world.tileSize -
      this.canvas.height / 2 +
      this.settings.world.tileSize / 2;

    this.ctx.translate(-cameraOffsetX, -cameraOffsetY);
  }

  private renderAnimation(phase: AnimationRenderingPhase): void {
    this.animations
      .filter((animation) => animation.phase === phase)
      .forEach((animation) => animation.render(this.ctx, this.settings));
  }

  private updateAnimations() {
    this.animations = this.animations.filter(
      (animation) => !animation.isFinished,
    );

    this.animations.forEach((animation) => {
      animation.update();
    });
  }

  private updateMotions() {
    for (const [unitId, motion] of this.motions.entries()) {
      if (motion.isFinished) {
        this.motions.delete(unitId);
      } else {
        motion.update();
      }
    }
  }

  private drawMap({
    tiles,
    visibility,
    size,
  }: {
    tiles: GameMap['tiles'];
    visibility: Visibility['tiles'];
    size: number;
  }): void {
    const tileColors = this.settings.tiles;
    const tileVisibility = this.settings.visibility.alpha;

    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        const fillStyle = (tileColors[tiles[y][x]] ?? tileColors.default).color;
        const alpha =
          tileVisibility[visibility[y][x]] ?? tileVisibility.default;

        this.drawTile({
          fillStyle,
          alpha,
          coords: new Coords(x, y),
          size,
        });
      }
    }
  }

  private drawTile({
    fillStyle,
    alpha,
    coords,
    size,
  }: {
    fillStyle: string;
    alpha: number;
    coords: Coords;
    size: number;
  }): void {
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = fillStyle;

    this.ctx.fillRect(coords.x * size, coords.y * size, size, size);

    this.ctx.globalAlpha = this.settings.visibility.alpha.default;
  }

  private drawPlayer(player: Coords): void {
    this.ctx.fillStyle = this.settings.player.color;
    this.ctx.beginPath();

    // Convert coords to tileSize and shift by 1/2 of tileSize to center
    const centerX =
      player.x * this.settings.world.tileSize +
      this.settings.world.tileSize / 2;
    const centerY =
      player.y * this.settings.world.tileSize +
      this.settings.world.tileSize / 2;
    this.ctx.arc(
      centerX,
      centerY,
      this.settings.world.tileSize / 3,
      0,
      Math.PI * 2,
    );

    this.ctx.fill();
  }

  private drawEnemies(enemies: Enemy[], visibility: Visibility['tiles']): void {
    enemies.forEach((enemy) => {
      if (
        visibility[enemy.coords.y][enemy.coords.x] !== VisibilityType.VISIBLE
      ) {
        return;
      }

      this.ctx.fillStyle = this.settings.enemies[enemy.type].color;
      this.ctx.fillRect(
        enemy.coords.x * this.settings.world.tileSize + 4,
        enemy.coords.y * this.settings.world.tileSize + 4,
        this.settings.world.tileSize - 8,
        this.settings.world.tileSize - 8,
      );
    });
  }

  private drawItems(items: Item[], visibility: Visibility['tiles']): void {
    items.forEach((item) => {
      if (visibility[item.coords.y][item.coords.x] !== VisibilityType.VISIBLE) {
        return;
      }

      this.ctx.fillStyle = this.settings.items[item.type].color;
      this.ctx.fillRect(
        item.coords.x * this.settings.world.tileSize + 8,
        item.coords.y * this.settings.world.tileSize + 8,
        this.settings.world.tileSize - 16,
        this.settings.world.tileSize - 16,
      );
    });
  }
}
