import type { Settings } from '../configs/settings';
import { EnemyType } from '../types/EnemyType';
import type { Direction } from '../types/Direction';
import { Renderer } from './Renderer';
import { Enemy } from './Enemy';
import { Map } from './Map';
import { Input } from './Input';
import { Player } from './Player';
import { Visibility } from './Visibility';
import { UI } from './UI';
import { Coords } from './Coords';
import { Item } from './Item';
import { ItemType } from '../types/ItemType';
import { ShakeAnimation } from './animations/ShakeAnimation';
import { DamageNumberAnimation } from './animations/DamageNumberAnimation';
import { DashAbility } from './abilities/DashAbility';
import { AbilityType } from '../types/AbilityType';
import { AnimationType } from '../types/AnimationType';

export class Game {
  private map!: Map;
  private visibility!: Visibility;
  private items!: Item[];
  private renderer: Renderer;
  private player!: Player;
  private enemies!: Enemy[];
  private input!: Input;
  private ui!: UI;
  private settings: Settings;

  constructor(settings: Settings) {
    this.renderer = new Renderer(settings.renderer);

    this.input = new Input({
      onMove: this.handleMove,
      onInventoryUse: this.handleInventoryUse,
      onAbilityUse: this.handleAbilityUse,
      onRestart: this.handleRestart,
      settings: settings.ui,
    });

    this.settings = settings;
  }

  initialize(): void {
    this.map = new Map(this.settings.gameMap);
    this.visibility = new Visibility(this.settings.gameMap);

    this.player = new Player({
      coords: this.map.getRandomFloorTile(),
      abilities: [
        new DashAbility({
          isTileWalkable: this.isTileWalkable,
          ...this.settings.player.abilities[AbilityType.DASH],
        }),
      ],
      onHpLoss: (hpLoss: number) => {
        this.renderer.playAnimations(
          new ShakeAnimation({
            duration:
              this.settings.renderer.duration.animations[AnimationType.SHAKE],
          }),
          new DamageNumberAnimation({
            duration:
              this.settings.renderer.duration.animations[
                AnimationType.DAMAGE_NUMBER
              ],
            coords: this.player.coords,
            damage: hpLoss,
            isTargetPlayer: true,
          }),
        );
      },
      ...this.settings.player.stats,
    });

    this.ui = new UI(this.player, this.settings.ui);

    this.enemies = [];
    this.spawnEnemies(this.settings.enemies);

    this.items = [];

    this.input.init();
  }

  start(): void {
    this.initialize();
    this.updateVisibility();
    this.ui.update();
    this.gameLoop();
  }

  gameLoop() {
    this.render();

    requestAnimationFrame(() => this.gameLoop());
  }

  handleRestart = (): void => {
    this.ui.hideGameOverScreen();
    this.start();
  };

  end() {
    this.input.destroy();
    this.ui.showGameOverScreen();
  }

  private handleMove = (direction: Direction): void => {
    console.log('move');
    const targetTile = new Coords(
      this.player.coords.x + direction.dx,
      this.player.coords.y + direction.dy,
    );

    const targetEnemy = this.enemies.find((enemy) =>
      targetTile.equalTo(enemy.coords),
    );

    if (targetEnemy) {
      this.player.attack(targetEnemy);
    } else if (this.isTileWalkable(targetTile)) {
      this.player.move(targetTile);
    }

    this.processTurn();
  };

  handleInventoryUse = (index: number): void => {
    if (!this.player.useItem(index)) {
      return;
    }

    this.processTurn();
  };

  handleAbilityUse = (index: number): void => {
    if (!this.player.useAbility(index)) {
      return;
    }

    this.processTurn();
  };

  private processTurn(): void {
    this.updatePlayer();
    this.updateEnemies();

    if (this.player.dead) {
      this.end();
      return;
    }

    this.updateVisibility();
    this.ui.update();
  }

  private updatePlayer(): void {
    this.pickLoot();
    this.player.decreaseAbilitiesCooldown();
  }

  private pickLoot(): void {
    const item = this.items.find((item) =>
      item.coords.equalTo(this.player.coords),
    );

    if (!item) {
      return;
    }

    this.items = this.items.filter((_item) => _item !== item);

    this.player.pickItem(item);
  }

  private updateEnemies(): void {
    this.enemies.forEach((enemy) => {
      if (enemy.currentHp > 0) {
        return;
      }

      const item = this.spawnLoot(enemy);

      if (item) {
        this.items.push(item);
      }
    });

    this.enemies = this.enemies.filter((enemy) => enemy.currentHp > 0);

    this.enemies.forEach((enemy) => {
      if (!enemy.isWithinAggroRadius(this.player.coords)) {
        return;
      }

      const dist = Map.calcDistance(enemy.coords, this.player.coords);

      if (dist === 1) {
        enemy.attack(this.player);
        return;
      }

      const dx = Math.sign(this.player.coords.x - enemy.coords.x);
      const dy = Math.sign(this.player.coords.y - enemy.coords.y);

      const moveX = new Coords(enemy.coords.x + dx, enemy.coords.y);
      const moveY = new Coords(enemy.coords.x, enemy.coords.y + dy);

      if (dx && this.isTileWalkable(moveX)) {
        enemy.move(moveX);
      } else if (dy && this.isTileWalkable(moveY)) {
        enemy.move(moveY);
      }
    });
  }

  private spawnLoot(enemy: Enemy): Item | null {
    for (const [lootType, chance] of Object.entries(enemy.lootTable)) {
      if (Math.random() > chance) {
        continue;
      }

      const { effectValue, name } = this.settings.items[lootType as ItemType];
      const tile = this.findItemSpawnTile(enemy.coords);

      if (!tile) {
        continue;
      }

      return new Item({
        coords: tile,
        effectValue: effectValue,
        name: name,
        type: lootType as ItemType,
      });
    }

    return null;
  }

  private findItemSpawnTile(originalTile: Coords): Coords | null {
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

      if (tile && !this.map.isWall(tile) && !this.tileHasItem(tile)) {
        return tile;
      }
    }

    return null;
  }

  private render(): void {
    this.renderer.render({
      tiles: this.map.tiles,
      visibility: this.visibility.tiles,
      player: this.player,
      enemies: this.enemies,
      items: this.items,
    });
  }

  private updateVisibility(): void {
    this.visibility.update(this.player, this.map.tiles);
  }

  private tileHasEnemy(tile: Coords): boolean {
    return this.enemies.some((enemy) => tile.equalTo(enemy.coords));
  }

  private tileHasPlayer(tile: Coords): boolean {
    return tile.equalTo(this.player.coords);
  }

  private tileHasItem(tile: Coords): boolean {
    return this.items.some((item) => tile.equalTo(item.coords));
  }

  private isTileWalkable = (tile: Coords): boolean => {
    return (
      !this.map.isWall(tile) &&
      !this.tileHasEnemy(tile) &&
      !this.tileHasPlayer(tile)
    );
  };

  private spawnEnemies(settings: Settings['enemies']): void {
    Object.entries(settings.spawn).forEach(([enemyType, enemyQuantity]) => {
      if (
        this.map.floorTiles.length <
        this.enemies.length + enemyQuantity + 1
      ) {
        return;
      }

      for (let i = 0; i < enemyQuantity; i++) {
        let randomFloorTile;

        do {
          randomFloorTile = this.map.getRandomFloorTile();
        } while (
          this.tileHasEnemy(randomFloorTile) ||
          this.tileHasPlayer(randomFloorTile)
        );

        const newEnemy = new Enemy({
          coords: randomFloorTile,
          lootTable: settings.lootTable[enemyType as EnemyType],
          onHpLoss: (hpLoss: number) => {
            this.renderer.playAnimations(
              new DamageNumberAnimation({
                duration:
                  this.settings.renderer.duration.animations[
                    AnimationType.DAMAGE_NUMBER
                  ],
                coords: newEnemy.coords,
                damage: hpLoss,
              }),
            );
          },
          ...settings.stats[enemyType as EnemyType],
        });

        this.enemies.push(newEnemy);
      }
    });
  }
}
