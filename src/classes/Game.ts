import type { Settings } from '../configs/settings';
import { EnemyType } from '../types/EnemyType';
import type { Direction } from '../types/Direction';
import { Renderer } from './Renderer';
import { Enemy } from './Enemy';
import { Map } from './Map';
import { GameInput } from './GameInput';
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
import { GameInputType } from '../types/GameInputType';
import type { GameAction } from '../types/GameAction';
import { MenuInput } from './MenuInput';
import { MenuInputType } from '../types/MenuInputType';
import type { MenuAction } from '../types/MenuAction';

export class Game {
  private map!: Map;
  private visibility!: Visibility;
  private items!: Item[];
  private renderer: Renderer;
  private player!: Player;
  private enemies!: Enemy[];
  private gameInput!: GameInput;
  private menuInput!: MenuInput;
  private ui!: UI;
  private settings: Settings;

  constructor(settings: Settings) {
    this.renderer = new Renderer(settings.renderer);
    this.menuInput = new MenuInput(settings.ui);
    this.gameInput = new GameInput(settings.ui);
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

    this.gameInput.init();
  }

  start(): void {
    this.initialize();
    this.updateVisibility();
    this.ui.update();
    this.renderLoop();
    this.gameLoop();
  }

  // Rendering is processed separately for animations
  renderLoop() {
    this.render();

    requestAnimationFrame(() => this.renderLoop());
  }

  async gameLoop() {
    while (!this.player.dead) {
      const gameAction = await this.gameInput.awaitAction();
      const successfulAction = this.handleGameAction(gameAction);

      if (successfulAction) {
        this.updatePlayer();
        this.updateEnemies();
        this.updateVisibility();
        this.ui.update();
      }
    }

    this.end();
  }

  async end() {
    this.gameInput.destroy();
    this.ui.showGameOverScreen();

    const menuAction = await this.menuInput.awaitAction();
    this.handleMenuAction(menuAction);
  }

  private handleGameAction(inputAction: GameAction): boolean {
    let successfulAction = false;

    switch (inputAction.type) {
      case GameInputType.PLAYER_MOVE:
        this.handlePlayerMove(inputAction.payload);
        successfulAction = true;
        break;
      case GameInputType.ABILITY_USE:
        successfulAction = this.handleAbilityUse(inputAction.payload);
        break;
      case GameInputType.INVENTORY_USE:
        successfulAction = this.handleInventoryUse(inputAction.payload);
        break;
    }

    return successfulAction;
  }

  private handlePlayerMove(direction: Direction): void {
    const targetTile = this.player.coords.add(direction);

    const targetEnemy = this.enemies.find((enemy) =>
      targetTile.equalTo(enemy.coords),
    );

    if (targetEnemy) {
      this.player.attack(targetEnemy);
    } else if (this.isTileWalkable(targetTile)) {
      this.player.move(targetTile);
    }
  }

  private handleInventoryUse(index: number): boolean {
    return this.player.useItem(index);
  }

  private handleAbilityUse(index: number): boolean {
    return this.player.useAbility(index);
  }

  private handleMenuAction(menuAction: MenuAction): void {
    switch (menuAction.type) {
      case MenuInputType.GAME_RESTART:
        this.handleGameRestart();
        break;
    }
  }

  private handleGameRestart(): void {
    this.ui.hideGameOverScreen();
    this.start();
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
