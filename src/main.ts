import "./style.css";

import {
  Board,
  ROWS,
  COLS,
} from "./game/Board";

import { Player } from "./game/Player";
import type { Position } from "./game/Position";
import { Bomb } from "./game/Boom";

import {
  calculateExplosion,
  isPlayerHit,
} from "./game/Explosion";

const CELL_SIZE: number = 60;

const canvasElement =
  document.querySelector<HTMLCanvasElement>("#game");

if (canvasElement === null) {
  throw new Error("Game canvas not found");
}

const canvas: HTMLCanvasElement = canvasElement;

const context = canvas.getContext("2d");

if (context === null) {
  throw new Error("Canvas context not available");
}

const ctx: CanvasRenderingContext2D = context;

canvas.width = COLS * CELL_SIZE;
canvas.height = ROWS * CELL_SIZE;

const board: Board = new Board();

const player: Player = new Player({
  row: 0,
  col: 0,
});

let bomb: Bomb | null = null;

let explosionPositions: Position[] = [];
let explosionTimer: number = 0;

let gameOver: boolean = false;

//Draw the board
function drawBoard(): void {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x: number = col * CELL_SIZE;
      const y: number = row * CELL_SIZE;

      ctx.strokeRect(
        x,
        y,
        CELL_SIZE,
        CELL_SIZE
      );

      if (board.getGrid()[row][col] === 1) {
        ctx.fillRect(
          x + 5,
          y + 5,
          CELL_SIZE - 10,
          CELL_SIZE - 10
        );
      }
    }
  }
}

//Draw the player
function drawPlayer(): void {
  console.log("isDead:", typeof player.isDead);
  
  if (player.isDead()) {
    return;
  }
  const position: Position = player.getPosition();

  const x: number =
    position.col * CELL_SIZE + CELL_SIZE / 2;

  const y: number =
    position.row * CELL_SIZE + CELL_SIZE / 2;

  ctx.beginPath();

  ctx.arc(
    x,
    y,
    CELL_SIZE / 3,
    0,
    Math.PI * 2
  );

  ctx.fill();
}

//Draw the bomb
function drawBoom(): void {
  if (bomb === null) {
    return;
  }

  const position: Position = bomb.getPosition();

  const x: number =
    position.col * CELL_SIZE + CELL_SIZE / 2;

  const y: number =
    position.row * CELL_SIZE + CELL_SIZE / 2;

  ctx.beginPath();

  ctx.arc(
    x,
    y,
    CELL_SIZE / 4,
    0,
    Math.PI * 2
  );

  ctx.fill();
}

//Draw the explosion
function drawExplosion(): void {
  for (const position of explosionPositions) {
    const x: number = position.col * CELL_SIZE;
    const y: number = position.row * CELL_SIZE;

    ctx.fillRect(
      x + 10,
      y + 10,
      CELL_SIZE - 20,
      CELL_SIZE - 20
    );
  }
}

//Draw Game Over
function drawGameOver(): void {
  if (!gameOver) {
    return;
  }

  ctx.font = "48px Arial";
  ctx.textAlign = "center";
  ctx.fillText(
    "GAME OVER",
    canvas.width / 2,
    canvas.height / 2
  );
}

//Draw everything
function draw(): void {
  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  drawBoard();
  drawExplosion();
  drawBoom();
  drawPlayer();
  if (gameOver) {
    drawGameOver();
  }
}

draw();

let lastTime: number = performance.now();

function gameLoop(currentTime: number): void {
  const deltaTime: number = currentTime - lastTime;

  lastTime = currentTime;

  if (!gameOver) {
    if (bomb !== null) {
      const exploded: boolean = bomb.update(deltaTime);
      
      if (exploded) {
        explosionPositions = calculateExplosion(bomb, board);

        if (isPlayerHit(player, explosionPositions)) {
          player.die();
          gameOver = true;
          console.log("gameOver:", gameOver);
        }

        explosionTimer = 500;

        bomb = null;
      }
    }
      
    if (explosionPositions.length > 0) {
      explosionTimer -= deltaTime;

      if (explosionTimer <= 0) {
        explosionPositions = [];
      }
    }
  }

  draw();

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

//Movement
window.addEventListener("keydown", (event: KeyboardEvent) => {
  switch (event.key) {
    case "ArrowUp":
      if (!gameOver) {
        player.move(-1, 0, board);
      }
      break;

    case "ArrowDown":
      if (!gameOver) {
        player.move(1, 0, board);
      }
      break;

    case "ArrowLeft":
      if (!gameOver) {
        player.move(0, -1, board);
      }
      break;

    case "ArrowRight":
      if (!gameOver) {
        player.move(0, 1, board);
      }
      break;

    case " ":
      if (gameOver) {
        restartGame();
        break;
      }

      if (!player.isDead() && bomb === null) {
        bomb = new Bomb(player.getPosition());
      }
      break;
  }
});

//Reset game
function restartGame(): void {
  gameOver = false;
  player.reset();
  bomb = null;
  explosionPositions = [];
  explosionTimer = 0;
}