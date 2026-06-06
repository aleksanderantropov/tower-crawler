import type { Settings } from '../configs/settings';
import { AbilityType } from '../types/AbilityType';
import { AnimationType } from '../types/AnimationType';
import type { GameAction } from '../types/GameAction';
import { GameInputType } from '../types/GameInputType';
import type { MenuAction } from '../types/MenuAction';
import { MenuInputType } from '../types/MenuInputType';
import { CleaveAbility } from './abilities/CleaveAbility';
import { DashAbility } from './abilities/DashAbility';
import { DamageNumberAnimation } from './animations/DamageNumberAnimation';
import { HitFlashAnimation } from './animations/HitFlashAnimation';
import { Movement } from './motions/Movement';
import { ShakeAnimation } from './animations/ShakeAnimation';
import { Coords } from './Coords';
import { EnemyManager } from './EnemyManager';
import { GameInput } from './GameInput';
import { ItemManager } from './ItemManager';
import { GameMap } from './GameMap';
import { MenuInput } from './MenuInput';
import { Player } from './Player';
import { Renderer } from './Renderer';
import { UI } from './UI';
import { Visibility } from './Visibility';

export class Game {
  private map!: GameMap;
  private visibility!: Visibility;
  private renderer: Renderer;
  private player!: Player;
  private enemyManager!: EnemyManager;
  private itemManager!: ItemManager;
  private gameInput!: GameInput;
  private menuInput!: MenuInput;
  private ui!: UI;
  private rafId = 0;

  constructor(private settings: Settings) {
    this.renderer = new Renderer(settings.renderer);
    this.menuInput = new MenuInput(settings.ui);
    this.gameInput = new GameInput(settings.ui);
  }

  private initialize(): void {
    this.ui = new UI(this.settings.ui);
    this.map = new GameMap(this.settings.gameMap);
    this.visibility = new Visibility(this.settings.gameMap);
    this.itemManager = new ItemManager(this.settings.items);

    this.player = new Player({
      coords: this.map.getRandomFloorTile(),
      abilities: [
        new DashAbility({
          isTileWalkable: this.isTileWalkable,
          ...this.settings.player.abilities[AbilityType.DASH],
        }),
        new CleaveAbility({
          getTargets: () => this.enemyManager.enemies,
          ...this.settings.player.abilities[AbilityType.CLEAVE],
        }),
      ],
      ...this.settings.player.stats,
    });
    this.enemyManager = new EnemyManager(this.settings.enemies);

    this.setupVisualListeners();

    this.enemyManager.spawn(Math.floor(this.map.floorTiles.length / 4));
    this.positionEnemies();

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
  private renderLoop() {
    this.renderer.render({
      tiles: this.map.tiles,
      visibility: this.visibility.tiles,
      player: this.player,
      enemies: this.enemyManager.enemies,
      items: this.itemManager.items,
    });

    this.rafId = requestAnimationFrame(() => this.renderLoop());
  }

  private async gameLoop() {
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

    await this.end();
  }

  async end() {
    this.gameInput.destroy();
    this.ui.showGameOverScreen();
    cancelAnimationFrame(this.rafId);

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

  private handlePlayerMove(direction: Coords): void {
    const targetTile = this.player.coords.clone().add(direction);
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

  private setupVisualListeners(): void {
    const animationSettings = this.settings.renderer.animations;

    this.player.onDamage.on((damage: number) => {
      this.renderer.playAnimations(
        new ShakeAnimation({
          duration: animationSettings[AnimationType.SHAKE].duration,
        }),
        new DamageNumberAnimation({
          duration: animationSettings[AnimationType.DAMAGE_NUMBER].duration,
          coords: this.player.coords,
          damage,
          isTargetPlayer: true,
        }),
      );
    });

    this.player.onMove.on(
      ({
        initialCoords,
        targetCoords,
      }: {
        initialCoords: Coords;
        targetCoords: Coords;
      }) => {
        this.renderer.startMotion(
          new Movement({
            unitId: this.player.id,
            initialCoords,
            targetCoords,
            duration: 150,
          }),
        );
      },
    );

    this.enemyManager.onSpawn.on((enemy) => {
      enemy.onDamage.on((damage: number) => {
        this.renderer.playAnimations(
          new ShakeAnimation({
            duration: animationSettings[AnimationType.SHAKE].duration,
            intensity: 0.5,
          }),
          new HitFlashAnimation({
            coords: enemy.coords,
            duration:
              animationSettings[AnimationType.HIT_FLASH_ANIMATION].duration,
          }),
          new DamageNumberAnimation({
            duration: animationSettings[AnimationType.DAMAGE_NUMBER].duration,
            coords: enemy.coords,
            damage,
          }),
        );
      });
    });
  }
}
