//Import the necessary modules and styles
import "./style.css";

import {
  ROWS,
  COLS,
} from "./game/entity/Board";

import { CELL_SIZE } from "./game/config";

import { Game } from "./game/Game";

//Define the game action type
type GameAction =
  | "moveUp"
  | "moveDown"
  | "moveLeft"
  | "moveRight"
  | "placeBoom"
  | "togglePause"
  | "restart";

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

const game: Game = new Game(ctx);

//Draw the paused state
function drawPaused(): void {
  if (game.getGameState() !== "paused") {
    return;
  }

  
  ctx.globalAlpha = 0.5;

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.globalAlpha = 1;

  ctx.font = "48px Arial";
  ctx.textAlign = "center";
  ctx.fillText(
    "PAUSED",
    canvas.width / 2,
    canvas.height / 2
  );
}

//Draw Game Over
function drawGameOver(): void {
  if (game.getGameState() !== "gameOver") {
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

  game.drawBoard();
  game.drawExplosion();
  game.drawBoom();
  game.drawPlayer();
  drawPaused();
  drawGameOver();
}

draw();

let lastTime: number = performance.now();

//Update the game Loop 
function update(deltaTime: number): void {
  game.update(deltaTime);
}

function gameLoop(currentTime: number): void {
  const deltaTime: number = currentTime - lastTime;

  lastTime = currentTime;

  update(deltaTime);

  draw();

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

//Handle keyboard input
window.addEventListener("keydown", (event: KeyboardEvent) => {
  switch (event.key) {
    case "ArrowUp":
      handleAction("moveUp");
      break;

    case "ArrowDown":
      handleAction("moveDown");
      break;

    case "ArrowLeft":
      handleAction("moveLeft");
      break;

    case "ArrowRight":
      handleAction("moveRight");
      break;

    case " ":
      event.preventDefault(); // Prevent the default spacebar action (scrolling)

      if (game.getGameState() === "gameOver") {
        game.restartGame();
        break;
      }

      handleAction("placeBoom");
      break;

    //Pause and resume the game
    case "p":
    case "P":
      handleAction("togglePause");
      break;
  }
});

//Handle game actions
function handleAction(action: GameAction): void {
  switch (action) {
    case "moveUp":
      game.movePlayer(-1, 0);
      break;

    case "moveDown":
      game.movePlayer(1, 0);
      break;

    case "moveLeft":
      game.movePlayer(0, -1);
      break;

    case "moveRight":
      game.movePlayer(0, 1);
      break;

    case "placeBoom":
      game.placeBoom();
      break;

    case "togglePause":
      game.togglePause();
      break;

    case "restart":
      game.restartGame();
      break;
  }
}

