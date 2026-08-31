import type { Position } from "./Position";

export const ROWS: number = 9;
export const COLS: number = 9;

export class Board {
  private grid: number[][];

  constructor() {
    this.grid = [
      [0, 0, 1, 0, 0, 0, 1, 0, 0],
      [0, 1, 0, 0, 1, 0, 0, 1, 0],
      [0, 0, 0, 1, 0, 0, 1, 0, 0],
      [1, 0, 0, 0, 0, 0, 0, 0, 1],
      [0, 0, 1, 0, 0, 0, 0, 0, 0],
      [0, 1, 0, 0, 1, 0, 0, 1, 0],
      [0, 0, 0, 1, 0, 0, 1, 0, 0],
      [0, 1, 0, 0, 1, 0, 0, 1, 0],
      [0, 0, 1, 0, 0, 0, 1, 0, 0],
    ];
  }

  isWalkable(position: Position): boolean {
    const { row, col } = position;

    if (
      row < 0 ||
      row >= ROWS ||
      col < 0 ||
      col >= COLS
    ) {
      return false;
    }

    return this.grid[row][col] === 0;
  }

  getGrid(): number[][] {
    return this.grid;
  }
}