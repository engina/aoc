export type Vector = [number, number];

export class Vector2 {
  constructor(public x: number, public y: number) {}

  add(vector: Vector2): Vector2 {
    this.x += vector.x;
    this.y += vector.y;
    return this;
  }

  isEqual(vector: Vector2): boolean {
    return this.x === vector[0] && this.y === vector[1];
  }

  m() {
    return this.y / this.x;
  }

  len() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  addScalar(scalar: number): Vector2 {
    this.x += scalar;
    this.y += scalar;
    return this;
  }

  mulScalar(scalar: number): Vector2 {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y);
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

  getRect(x: number, y: number, width: number, height: number): Grid<T> {
    const data = this.data
      .slice(y, y + height)
      .map((row) => row.slice(x, x + width));
    return new Grid(data);
  }
}
