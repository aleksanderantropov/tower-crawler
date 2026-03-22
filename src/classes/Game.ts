import type { Settings } from '../configs/settings';
import { AbilityType } from '../types/AbilityType';
import { AnimationType } from '../types/AnimationType';
import type { Direction } from '../types/Direction';
import type { GameAction } from '../types/GameAction';
import { GameInputType } from '../types/GameInputType';
import type { MenuAction } from '../types/MenuAction';
import { MenuInputType } from '../types/MenuInputType';
import { DashAbility } from './abilities/DashAbility';
import { DamageNumberAnimation } from './animations/DamageNumberAnimation';
import { ShakeAnimation } from './animations/ShakeAnimation';
import { Coords } from './Coords';
import { EnemyManager } from './EnemyManager';
import { GameInput } from './GameInput';
import { ItemManager } from './ItemManager';
import { Map } from './Map';
import { MenuInput } from './MenuInput';
import { Player } from './Player';
import { Renderer } from './Renderer';
import { UI } from './UI';
import { Visibility } from './Visibility';

export class Game {
  private map!: Map;
  private visibility!: Visibility;
  private renderer: Renderer;
  private player!: Player;
  private enemyManager!: EnemyManager;
  private itemManager!: ItemManager;
  private gameInput!: GameInput;
  private menuInput!: MenuInput;
  private ui!: UI;

  constructor(private settings: Settings) {
    this.renderer = new Renderer(settings.renderer);
    this.menuInput = new MenuInput(settings.ui);
    this.gameInput = new GameInput(settings.ui);
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
      ...this.settings.player.stats,
    });
    this.player.onDamage.on((damage: number) => {
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
          damage,
          isTargetPlayer: true,
        }),
      );
    });

    this.ui = new UI(this.settings.ui);

    this.enemyManager = new EnemyManager(this.settings.enemies);
    this.enemyManager.onSpawn.on((enemy) => {
      enemy.onDamage.on((damage: number) => {
        this.renderer.playAnimations(
          new DamageNumberAnimation({
            duration:
              this.settings.renderer.duration.animations[
                AnimationType.DAMAGE_NUMBER
              ],
            coords: enemy.coords,
            damage,
          }),
        );
      });
    });
    this.enemyManager.spawn(this.map.floorTiles.length / 4);
    this.positionEnemies();

    this.itemManager = new ItemManager(this.settings.items);
    this.gameInput.init();
  }

  start(): void {
    this.initialize();
    this.visibility.update(this.player, this.map.tiles);
    this.ui.update(this.player);
    this.renderLoop();
    this.gameLoop();
  }

  // Rendering is processed separately for animations
  renderLoop() {
    this.renderer.render({
      tiles: this.map.tiles,
      visibility: this.visibility.tiles,
      player: this.player,
      enemies: this.enemyManager.enemies,
      items: this.itemManager.items,
    });

    requestAnimationFrame(() => this.renderLoop());
  }

  async gameLoop() {
    while (!this.player.dead) {
      const gameAction = await this.gameInput.awaitAction();
      const successfulAction = this.handleGameAction(gameAction);

      if (successfulAction) {
        this.updatePlayer();
        this.enemyManager.update({
          target: this.player,
          isTileWalkable: this.isTileWalkable,
          onEnemyDeath: (enemy) =>
            this.itemManager.spawnItems(enemy, this.map.isWall),
        });
        this.visibility.update(this.player, this.map.tiles);
        this.ui.update(this.player);
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
        successfulAction = this.player.useAbility(inputAction.payload);
        break;
      case GameInputType.INVENTORY_USE:
        successfulAction = this.player.useItem(inputAction.payload);
        break;
    }

    return successfulAction;
  }

  private handlePlayerMove(direction: Direction): void {
    const targetTile = this.player.coords.clone(direction);

    const targetEnemy = this.enemyManager.findByTile(targetTile);

    if (targetEnemy) {
      this.player.attack(targetEnemy);
    } else if (this.isTileWalkable(targetTile)) {
      this.player.move(targetTile);
    }
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
    this.player.decreaseAbilitiesCooldown();
    const item = this.itemManager.findItemByTile(this.player.coords);

    if (!item) {
      return;
    }

    this.itemManager.removeItem(item);
    this.player.pickItem(item);
  }

  private positionEnemies(): void {
    this.enemyManager.enemies.forEach((enemy) => {
      let randomFloorTile;

      do {
        randomFloorTile = this.map.getRandomFloorTile();
      } while (!this.isTileWalkable(randomFloorTile));

      enemy.move(randomFloorTile);
    });
  }

  private tileHasPlayer(tile: Coords): boolean {
    return tile.equalTo(this.player.coords);
  }

  private isTileWalkable = (tile: Coords): boolean => {
    return (
      !this.map.isWall(tile) &&
      !this.enemyManager.tileHasEnemy(tile) &&
      !this.tileHasPlayer(tile)
    );
  };
}
