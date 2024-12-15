import "colors";

export type Vector = [number, number];

export class Vector2 {
  constructor(public x: number, public y: number) {}

  add(vector: Vector2 | Vector): Vector2 {
    if (Array.isArray(vector)) {
      this.x += vector[0];
      this.y += vector[1];
      return this;
    }
    this.x += vector.x;
    this.y += vector.y;
    return this;
  }

  sub(vector: Vector2 | Vector): Vector2 {
    if (Array.isArray(vector)) {
      this.x -= vector[0];
      this.y -= vector[1];
      return this;
    }
    this.x -= vector.x;
    this.y -= vector.y;
    return this;
  }

  set(vector: Vector2 | Vector): Vector2 {
    if (Array.isArray(vector)) {
      this.x = vector[0];
      this.y = vector[1];
      return this;
    }
    this.x = vector.x;
    this.y = vector.y;
    return this;
  }

  isEqual(vector: Vector2): boolean {
    return this.x === vector.x && this.y === vector.y;
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

export const Directions = {
  north: [0, -1],
  south: [0, 1],
  east: [1, 0],
  west: [-1, 0],
  northeast: [1, -1],
  northwest: [-1, -1],
  southeast: [1, 1],
  southwest: [-1, 1],
} as const;

export type Direction = (typeof Directions)[keyof typeof Directions];

export class Cell<T> {
  public updated = false;
  constructor(
    public value: T,
    public readonly position: Vector2,
    public readonly grid: Grid<T>
  ) {}

  getNeighbors(
    directions: Direction[] = [
      Directions.north,
      Directions.east,
      Directions.south,
      Directions.west,
    ]
  ): (Cell<T> | undefined)[] {
    const neighbors: (Cell<T> | undefined)[] = [];
    for (const v of directions) {
      const neighbor = this.grid.get(
        this.position.x + v[0],
        this.position.y + v[1]
      );
      neighbors.push(neighbor);
    }
    return neighbors;
  }

  // inclusive until
  peek(direction: Vector | Vector2, until?: T): Cell<T>[] {
    const cells: Cell<T>[] = [];
    const p = this.position.clone().add(direction);
    while (true) {
      const cell = this.grid.get(p);
      if (cell === undefined) {
        break;
      }
      cells.push(cell);
      if (until !== undefined && cell.value === until) {
        break;
      }
      p.add(direction);
    }
    return cells;
  }

  toString(): string {
    return `${this.position.x},${this.position.y}: "${this.value}"`;
  }
}

export class Grid<T> {
  public width: number;
  public height: number;
  public readonly cells: Cell<T>[] = [];

  constructor(public readonly data: T[][] = []) {
    this.width = data[0]?.length ?? 0;
    this.height = data.length;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const value = data[y][x];
        const cell = new Cell(value, new Vector2(x, y), this);
        this.cells.push(cell);
      }
    }
  }

  get(pos: Vector2): Cell<T> | undefined;
  get(pos: Vector): Cell<T> | undefined;
  get(x: number, y: number): Cell<T> | undefined;
  get(...args: any[]): Cell<T> | undefined {
    let x: number, y: number;
    if (Array.isArray(args[0])) {
      [x, y] = args[0];
    } else if (typeof args[0] === "number") {
      [x, y] = args;
    } else {
      x = args[0].x;
      y = args[0].y;
    }

    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return undefined;
    }
    return this.cells[y * this.width + x];
  }

  find(value: T): Cell<T> | undefined {
    return this.cells.find((cell) => cell.value === value);
  }

  shift(cells: Set<Cell<T>>, direction: Direction, n = 1): void {
    Array.from(cells)
      .sort((a, b) => {
        switch (direction) {
          case Directions.north:
            return a.position.y - b.position.y;
          case Directions.south:
            return b.position.y - a.position.y;
          case Directions.east:
            return b.position.x - a.position.x;
          case Directions.west:
            return a.position.x - b.position.x;
          default:
            throw new Error("Unknown direction");
        }
      })
      .forEach((cell) => {
        const target = this.get([
          cell.position.x + direction[0] * n,
          cell.position.y + direction[1] * n,
        ]);
        if (target === undefined) {
          throw new Error("Target cell is undefined");
        }
        this.swap(cell, target);
      });
  }

  swap(a: Cell<T>, b: Cell<T>) {
    this.cells[a.position.y * this.width + a.position.x] = b;
    this.cells[b.position.y * this.width + b.position.x] = a;
    const temp = a.position.clone();
    a.position.set(b.position);
    b.position.set(temp);
    a.updated = b.updated = true;
  }

  getRect(x: number, y: number, width: number, height: number): Grid<T> {
    const data = this.data
      .slice(y, y + height)
      .map((row) => row.slice(x, x + width));
    return new Grid(data);
  }

  serialize() {
    return {
      width: this.width,
      height: this.height,
      data: this.cells.map((cell) => cell.value),
    };
  }

  unserialize(data: { width: number; height: number; data: T[] }) {
    this.width = data.width;
    this.height = data.height;
    data.data.forEach((value, i) => {
      this.cells[i].value = value;
    });
  }

  print() {
    for (let y = 0; y < this.height; y++) {
      let row = "";
      for (let x = 0; x < this.width; x++) {
        const cell = this.cells[y * this.width + x];
        let str = cell.value;
        if (cell.updated) {
          str = str.red;
        }
        row += str;
      }
      console.log(row);
    }
  }
}
