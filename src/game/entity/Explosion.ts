import type { Position } from "../Position";
import { Board } from "./Board";
import { Bomb } from "./Boom";
import { Player } from "./Player";

export function calculateExplosion(
  bomb: Bomb,
  board: Board
): Position[] {
  const explosion: Position[] = [];

  const center: Position = bomb.getPosition();

  explosion.push(center);

  const directions: Position[] = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];

  for (const direction of directions) {
    for (let distance = 1; distance <= bomb.getRadius(); distance++) {
      const position: Position = {
        row: center.row + direction.row * distance,
        col: center.col + direction.col * distance,
      };

      if (!board.isWalkable(position)) {
        break;
      }

      explosion.push(position);
    }
  }

  return explosion;
}

export function isPlayerHit(
  player: Player,
  explosion: Position[]
): boolean {
  const playerPosition = player.getPosition();

  for (const position of explosion) {
    if (
      position.row === playerPosition.row &&
      position.col === playerPosition.col
    ) {
      return true;
    }
  }

  return false;
}