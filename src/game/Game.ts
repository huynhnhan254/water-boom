import { Board } from "./entity/Board";
import { Player } from "./entity/Player";
import type { Position } from "./Position";
import { Boom } from "./entity/Boom";

import {
  calculateExplosion,
  isPlayerHit,
} from "./entity/Explosion";

import { CELL_SIZE } from "./config";

export type GameState = "playing" | "paused" | "gameOver";

export class Game {
  private board: Board;
  private player: Player;
  private boom: Boom | null = null;
  private gameState: GameState;
  private ctx: CanvasRenderingContext2D;
  private explosionPositions: Position[] = [];
  private explosionTimer: number = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;

    this.board = new Board();

    const startPosition: Position = {
      row: 0,
      col: 0,
    };

    this.player = new Player(startPosition);

    this.gameState = "playing";

    this.boom = null;
  }

  // Draw the board
    drawBoard(): void {
    const CELL_SIZE: number = 60;

    for (let row = 0; row < this.board.getGrid().length; row++) {
        for (let col = 0; col < this.board.getGrid()[row].length; col++) {
        const x: number = col * CELL_SIZE;
        const y: number = row * CELL_SIZE;

        this.ctx.strokeRect(
            x,
            y,
            CELL_SIZE,
            CELL_SIZE
        );

        if (this.board.getGrid()[row][col] === 1) {
            this.ctx.fillRect(
            x + 5,
            y + 5,
            CELL_SIZE - 10,
            CELL_SIZE - 10
            );
        }
        }
    }
    }

  // Move the player in the specified direction
  movePlayer(
    rowDirection: number,
    colDirection: number
  ): void {
    if (this.gameState !== "playing") {
      return;
    }

    this.player.move(
      rowDirection,
      colDirection,
      this.board
    );
  }

  //Draw the game state on the canvas
  drawPlayer(): void {
    if (this.player.isDead()) {
        return;
    }

    const position: Position = this.player.getPosition();

    const x: number =
        position.col * 60 + 60 / 2;

    const y: number =
        position.row * 60 + 60 / 2;

    this.ctx.beginPath();

    this.ctx.arc(
        x,
        y,
        60 / 3,
        0,
        Math.PI * 2
    );

    this.ctx.fill();
    }

    //place boom
    placeBoom(): void {
        if (this.gameState !== "playing") {
            return;
        }

        if (this.player.isDead() || this.boom === null) {
            this.boom = new Boom(this.player.getPosition());
        }
    }

    //draw boom
    drawBoom(): void {
        if (this.boom === null) {
            return;
        }

        const position: Position = this.boom.getPosition();

        const x: number =
            position.col * CELL_SIZE + CELL_SIZE / 2;

        const y: number =
            position.row * CELL_SIZE + CELL_SIZE / 2;

        this.ctx.beginPath();

        this.ctx.arc(
            x,
            y,
            CELL_SIZE / 4,
            0,
            Math.PI * 2
        );

        this.ctx.fill();
    }

    updateBoom(deltaTime: number): boolean {
        let explosion: boolean = false;

        if (this.boom !== null) {
            explosion = this.boom.update(deltaTime);

            if (explosion) {
                this.explosionPositions = calculateExplosion(this.boom, this.board);

                if (isPlayerHit(this.player, this.explosionPositions)) {
                    this.player.die();
                    this.checkGameOver();
                }
                this.explosionTimer = 500;
                this.boom = null;
            }   
        }

        return explosion;
    }

    //draw explosion
    drawExplosion(): void {
        for (const position of this.explosionPositions) {
            const x: number =
            position.col * CELL_SIZE;

            const y: number =
            position.row * CELL_SIZE;

            this.ctx.fillRect(
            x + 10,
            y + 10,
            CELL_SIZE - 20,
            CELL_SIZE - 20
            );
        }
    }

    checkGameOver(): void {
        if (this.player.isDead()) {
            this.gameState = "gameOver";
        }
    }

    restartGame(): void {
        this.gameState = "playing";
        this.player.reset();
        this.boom = null;
        this.explosionPositions = [];
        this.explosionTimer = 0;
    }

    getGameState(): GameState {
        return this.gameState;
    }

    togglePause(): void {
        if (this.gameState === "playing") {
            this.gameState = "paused";
        } else if (this.gameState === "paused") {
            this.gameState = "playing";
        }
    }

    private updateExplosion(deltaTime : number): void {
        if (this.explosionTimer === 0) {
            return;
        }

        this.explosionTimer -= deltaTime;

        if (this.explosionTimer <= 0) {
            this.explosionPositions = [];
        }
    }

    public update(deltaTime: number): void {
    if (this.getGameState() === "playing") {
      this.updateBoom(deltaTime);
    }

    this.updateExplosion(deltaTime);
  }
}