import type { Position } from "./Position";
import { Board } from "./Board";

export class Player {
  private position: Position;
  private startPosition: Position;
  private dead: boolean = false;

  constructor(startPosition: Position) {
    this.position = startPosition;
    this.startPosition = startPosition;
  }

  // Get the current position of the player
  getPosition(): Position {
    return this.position;
  }

  move(
    rowDirection: number,
    colDirection: number,
    board: Board
  ): void {
    if (this.dead) {
      return;
    }

    const newPosition: Position = {
      row: this.position.row + rowDirection,
      col: this.position.col + colDirection,
    };

    if (board.isWalkable(newPosition)) {
      this.position = newPosition;
    }
  }

  // Call this method when the player is hit by an explosion
  public die(): void {
    this.dead = true;
 }

 // Check if the player is dead
  public isDead(): boolean {
    return this.dead;
  }

  // Reset the player's position to the starting position
  public reset(): void {
    this.position = this.startPosition;
    this.dead = false;
  }
}

