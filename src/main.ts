//Import the necessary modules and styles
import "./style.css";

import {
  Board,
  ROWS,
  COLS,
} from "./game/entity/Board";

import { Player } from "./game/entity/Player";
import type { Position } from "./game/Position";
import { Boom } from "./game/entity/Boom";

import {
  calculateExplosion,
  isPlayerHit,
} from "./game/entity/Explosion";

//Define the game state type
type GameState = "playing" | "gameOver";

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

let boom: Boom | null = null;

let explosionPositions: Position[] = [];
let explosionTimer: number = 0;

let gameState: GameState = "playing";

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

//Draw the boom
function drawBoom(): void {
  if (boom === null) {
    return;
  }

  const position: Position = boom.getPosition();

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
  if (gameState !== "gameOver") {
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
  drawGameOver();
}

draw();

let lastTime: number = performance.now();

//Update the game Loop 
function update(deltaTime: number): void {
  if (gameState === "gameOver") {
    return;
  }

  if (boom !== null) {
    const exploded: boolean = boom.update(deltaTime);
    
    if (exploded) {
      explosionPositions = calculateExplosion(boom, board);

      if (isPlayerHit(player, explosionPositions)) {
        player.die();
        checkGameOver();
      }

      explosionTimer = 500;

      boom = null;
    }
  }
    
  if (explosionPositions.length > 0) {
    explosionTimer -= deltaTime;

    if (explosionTimer <= 0) {
      explosionPositions = [];
    }
  }
  
}

function gameLoop(currentTime: number): void {
  const deltaTime: number = currentTime - lastTime;

  lastTime = currentTime;

  update(deltaTime);

  draw();

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

//Movement
window.addEventListener("keydown", (event: KeyboardEvent) => {
  switch (event.key) {
    case "ArrowUp":
      movePlayer(-1, 0);
      break;

    case "ArrowDown":
      movePlayer(1, 0);
      break;

    case "ArrowLeft":
      movePlayer(0, -1);
      break;

    case "ArrowRight":
      movePlayer(0, 1);
      break;

    case " ":
      if (gameState === "gameOver") {
        restartGame();
        break;
      }

      placeBoom();
      break;
  }
});

//Reset all game states to restart the game
function restartGame(): void {
  gameState = "playing";
  player.reset();
  boom = null;
  explosionPositions = [];
  explosionTimer = 0;
}

//Check if the player is dead and restart the game
function checkGameOver(): void {
  if (player.isDead()) {
    gameState = "gameOver";
  }
}

//Movement controls
function movePlayer(
  rowDirection: number,
  colDirection: number
): void {
  if (gameState !== "playing") {
    return;
  }

  player.move(rowDirection, colDirection, board);
}

//place boom
function placeBoom(): void {
  if (gameState !== "playing") {
    return;
  }
  
  if (player.isDead() || boom === null) {
    boom = new Boom(player.getPosition());
  }
}