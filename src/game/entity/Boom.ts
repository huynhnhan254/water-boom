import type { Position } from "../Position";

export class Bomb {
  private position: Position;
  private timer: number;
  private radius: number;

  constructor(position: Position) {
    this.position = position;
    this.timer = 2000;
    this.radius = 2;
  }

  getPosition(): Position {
    return this.position;
  }

  getRadius(): number {
    return this.radius;
  }

  getTimer(): number {
    return this.timer;
  }

  update(deltaTime: number): boolean {
    this.timer -= deltaTime;

    return this.timer <= 0;
  }
}