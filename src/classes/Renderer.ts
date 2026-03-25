import type { Settings } from '../configs/settings';
import type { Animation } from '../types/Animation';
import { AnimationRenderingPhase } from '../types/AnimationRenderingPhase';
import { TileType } from '../types/TileType';
import { VisibilityType } from '../types/VisibilityType';
import { Coords } from './Coords';
import type { Enemy } from './Enemy';
import type { Item } from './Item';
import type { Map } from './Map';
import type { Player } from './Player';
import type { Visibility } from './Visibility';

export class Renderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  tileSize: number;
  animations: Animation[] = [];

  constructor(private settings: Settings['renderer']) {
    this.canvas = document.getElementById(settings.id) as HTMLCanvasElement;
    this.canvas.width = settings.width;
    this.canvas.height = settings.height;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.tileSize = settings.tileSize;
  }

  render({
    tiles,
    visibility,
    player,
    enemies,
    items,
  }: {
    tiles: Map['tiles'];
    visibility: Visibility['tiles'];
    player: Player;
    enemies: Enemy[];
    items: Item[];
  }): void {
    this.clear();
    this.updateAnimations();

    this.drawWorld({ player, tiles, visibility, enemies, items });
    this.drawMinimap({ player, tiles, visibility, enemies, items });
  }

  playAnimations(...animations: Animation[]): void {
    this.animations.push(...animations);
  }

  private drawWorld({
    player,
    tiles,
    visibility,
    enemies,
    items,
  }: Parameters<Renderer['render']>[0]): void {
    this.ctx.save();

    this.centerCameraOnPlayer(player.coords);
    this.renderAnimation(AnimationRenderingPhase.PRE);
    this.drawMap({ tiles, visibility, size: this.tileSize });
    this.drawPlayer(player.coords);
    this.drawEnemies(enemies, visibility);
    this.drawItems(items, visibility);
    this.renderAnimation(AnimationRenderingPhase.POST);

    this.ctx.restore();
  }

  private drawMinimap({
    player,
    tiles,
    visibility,
    enemies,
    items,
  }: Parameters<Renderer['render']>[0]): void {
    const minimapWidth = 200;
    const minimapHeight = 200;

    const scale = Math.min(
      minimapWidth / tiles[0].length,
      minimapHeight / tiles.length,
    );

    this.ctx.save();

    // border
    this.ctx.strokeStyle = '#e9e9e9';
    this.ctx.strokeRect(1, 1, minimapWidth + 1, minimapHeight + 1);

    // background
    this.ctx.globalAlpha = 0.8;
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(1, 1, minimapWidth, minimapHeight);
    this.ctx.globalAlpha = 1;

    this.drawMap({ tiles, visibility, size: scale });

    this.ctx.restore();
  }

  private clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private centerCameraOnPlayer(player: Coords): void {
    const cameraOffsetX =
      player.x * this.tileSize - this.canvas.width / 2 + this.tileSize / 2;
    const cameraOffsetY =
      player.y * this.tileSize - this.canvas.height / 2 + this.tileSize / 2;

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

  private drawMap({
    tiles,
    visibility,
    size,
  }: {
    tiles: Map['tiles'];
    visibility: Visibility['tiles'];
    size: number;
  }): void {
    const { tiles: tileColors } = this.settings.colors;
    const { visibility: tileVisibility } = this.settings.alpha;

    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        const fillStyle = tileColors[tiles[y][x]] ?? tileColors.default;
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

    this.ctx.globalAlpha = this.settings.alpha.visibility.default;
  }

  private drawPlayer(player: Coords): void {
    this.ctx.fillStyle = this.settings.colors.player;
    this.ctx.beginPath();

    // Convert coords to tileSize and shift by 1/2 of tileSize to center
    const centerX = player.x * this.tileSize + this.tileSize / 2;
    const centerY = player.y * this.tileSize + this.tileSize / 2;
    this.ctx.arc(centerX, centerY, this.tileSize / 3, 0, Math.PI * 2);

    this.ctx.fill();
  }

  private drawEnemies(enemies: Enemy[], visibility: Visibility['tiles']): void {
    enemies.forEach((enemy) => {
      if (
        visibility[enemy.coords.y][enemy.coords.x] !== VisibilityType.VISIBLE
      ) {
        return;
      }

      this.ctx.fillStyle = this.settings.colors.enemies[enemy.type];
      this.ctx.fillRect(
        enemy.coords.x * this.tileSize + 4,
        enemy.coords.y * this.tileSize + 4,
        this.tileSize - 8,
        this.tileSize - 8,
      );
    });
  }

  private drawItems(items: Item[], visibility: Visibility['tiles']): void {
    items.forEach((item) => {
      if (visibility[item.coords.y][item.coords.x] !== VisibilityType.VISIBLE) {
        return;
      }

      this.ctx.fillStyle = this.settings.colors.items[item.type];
      this.ctx.fillRect(
        item.coords.x * this.tileSize + 8,
        item.coords.y * this.tileSize + 8,
        this.tileSize - 16,
        this.tileSize - 16,
      );
    });
  }
}
