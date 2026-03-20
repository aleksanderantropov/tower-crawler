import { TileType } from '../types/TileType';
import type { Settings } from '../configs/settings';
import { Coords } from './Coords';
import type { Visibility } from './Visibility';
import { VisibilityType } from '../types/VisibilityType';
import type { Map } from './Map';
import type { Enemy } from './Enemy';
import type { Player } from './Player';
import type { Item } from './Item';
import { ShakeAnimation } from './animations/ShakeAnimation';
import type { Animation } from '../types/Animation';
import { DamageNumberAnimation } from './animations/DamageNumberAnimation';
import { AnimationType } from '../types/AnimationType';

export class Renderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  tileSize: Settings['renderer']['tileSize'];
  animations: Animation[];
  settings: {
    colors: Settings['renderer']['colors'];
    alpha: Settings['renderer']['alpha'];
    text: Settings['renderer']['text'];
  };

  constructor({
    id,
    tileSize,
    width,
    height,
    ...settings
  }: Settings['renderer']) {
    this.canvas = document.getElementById(id) as HTMLCanvasElement;
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.tileSize = tileSize;
    this.settings = settings;
    this.animations = [];
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
    this.ctx.save();
    this.updateAnimations();
    this.drawShakeAnimations();
    this.drawMap(tiles, visibility);
    this.drawPlayer(player.coords);
    this.drawEnemies(enemies, visibility);
    this.drawItems(items, visibility);
    this.drawDamageNumberAnimations();
    this.ctx.restore();
  }

  playAnimations(...animations: Animation[]): void {
    this.animations.push(...animations);
  }

  private clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawShakeAnimations(): void {
    this.animations.forEach((animation) => {
      if (animation instanceof ShakeAnimation) {
        this.ctx.translate(animation.offset.x, animation.offset.y);
      }
    });
  }

  private updateAnimations() {
    this.animations = this.animations.filter(
      (animation) => !animation.isFinished,
    );

    this.animations.forEach((animation) => {
      animation.update();
    });
  }

  private drawDamageNumberAnimations(): void {
    this.animations.forEach((animation) => {
      if (animation instanceof DamageNumberAnimation) {
        this.ctx.globalAlpha = animation.opacity;
        this.ctx.fillStyle = animation.isTargetPlayer
          ? this.settings.colors.animations[AnimationType.DAMAGE_NUMBER].player
          : this.settings.colors.animations[AnimationType.DAMAGE_NUMBER]
              .enemies;
        this.ctx.font =
          this.settings.text.animations[AnimationType.DAMAGE_NUMBER];
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
          animation.damage.toString(),
          animation.currentCoords.x * this.tileSize + this.tileSize / 2,
          animation.currentCoords.y * this.tileSize,
        );
      }
    });
  }

  private drawMap(tiles: Map['tiles'], visibility: Visibility['tiles']): void {
    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        const fillStyle = this.getTileFillStyle(tiles[y][x]);
        const alpha = this.getAlphaValue(visibility[y][x]);

        this.drawTile({ fillStyle, alpha, coords: new Coords(x, y) });
      }
    }
  }

  private drawTile({
    fillStyle,
    alpha,
    coords,
  }: {
    fillStyle: string;
    alpha: number;
    coords: Coords;
  }): void {
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = fillStyle;

    this.ctx.fillRect(
      coords.x * this.tileSize,
      coords.y * this.tileSize,
      this.tileSize,
      this.tileSize,
    );

    this.ctx.globalAlpha = this.settings.alpha.visibility.default;
  }

  private getTileFillStyle(tile: TileType): string {
    switch (tile) {
      case TileType.FLOOR:
        return this.settings.colors.tiles.floor;
      case TileType.WALL:
        return this.settings.colors.tiles.wall;
      default:
        return this.settings.colors.tiles.default;
    }
  }

  private getAlphaValue(visibility: VisibilityType): number {
    switch (visibility) {
      case VisibilityType.HIDDEN:
        return this.settings.alpha.visibility.hidden;
      case VisibilityType.REVEALED:
        return this.settings.alpha.visibility.revealed;
      case VisibilityType.VISIBLE:
        return this.settings.alpha.visibility.visible;
      default:
        return this.settings.alpha.visibility.default;
    }
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
      this.ctx.beginPath();

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
      this.ctx.beginPath();

      this.ctx.fillRect(
        item.coords.x * this.tileSize + 8,
        item.coords.y * this.tileSize + 8,
        this.tileSize - 16,
        this.tileSize - 16,
      );
    });
  }
}
