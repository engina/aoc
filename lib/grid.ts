export type Vector = [number, number];

export class Vector2 {
  constructor(public x: number, public y: number) {}

  add(vector: Vector): Vector2 {
    this.x += vector[0];
    this.y += vector[1];
    return this;
  }

  isEqual(vector: Vector): boolean {
    return this.x === vector[0] && this.y === vector[1];
  }

  toString(): string {
    return `(${this.x}, ${this.y})`;
  }
}

export const Directions: Record<string, Vector> = {
  north: [0, -1],
  south: [0, 1],
  east: [1, 0],
  west: [-1, 0],
  northeast: [1, -1],
  northwest: [-1, -1],
  southeast: [1, 1],
  southwest: [-1, 1],
} as const;

export class Cell<T> {
  constructor(
    public readonly value: T,
    public readonly position: Vector,
    public readonly grid: Grid<T>
  ) {}

  getNeighbors(
    directions: Vector[] = [
      Directions.north,
      Directions.east,
      Directions.south,
      Directions.west,
    ]
  ): (Cell<T> | undefined)[] {
    const neighbors: (Cell<T> | undefined)[] = [];
    for (const v of directions) {
      const neighbor = this.grid.get(
        this.position[0] + v[0],
        this.position[1] + v[1]
      );
      neighbors.push(neighbor);
    }
    return neighbors;
  }

  toString(): string {
    return `${this.position[0]},${this.position[1]}: ${this.value}`;
  }
}

export class Grid<T> {
  public readonly width: number;
  public readonly height: number;
  public readonly cells: Cell<T>[] = [];

  constructor(public readonly data: T[][] = []) {
    this.width = data[0]?.length ?? 0;
    this.height = data.length;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const value = data[y][x];
        const cell = new Cell(value, [x, y], this);
        this.cells.push(cell);
      }
    }
  }

  get(x: number, y: number): Cell<T> | undefined {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return undefined;
    }
    return this.cells[y * this.width + x];
  }
}
