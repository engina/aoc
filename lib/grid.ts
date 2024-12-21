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

  manhattan(vector: Vector2 | Vector): number {
    if (Array.isArray(vector)) {
      return Math.abs(this.x - vector[0]) + Math.abs(this.y - vector[1]);
    }
    return Math.abs(this.x - vector.x) + Math.abs(this.y - vector.y);
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

export const DirectionsOrthogonal = [
  Directions.north,
  Directions.east,
  Directions.south,
  Directions.west,
] as const;

export const DirectionsDiagonal = [
  Directions.northeast,
  Directions.southeast,
  Directions.southwest,
  Directions.northwest,
] as const;

export const DirectionsAll = [
  Directions.north,
  Directions.northeast,
  Directions.east,
  Directions.southeast,
  Directions.south,
  Directions.southwest,
  Directions.west,
  Directions.northwest,
] as const;

export function directionToStr(direction: Vector) {
  if (direction[0] === 0 && direction[1] === -1) {
    return "^";
  }
  if (direction[0] === 1 && direction[1] === 0) {
    return ">";
  }
  if (direction[0] === 0 && direction[1] === 1) {
    return "v";
  }
  if (direction[0] === -1 && direction[1] === 0) {
    return "<";
  }
  return "?";
}

export type Direction = (typeof Directions)[keyof typeof Directions];

export class Cell<T> {
  public distance = Infinity;
  public explored = false;
  public index: number = -1;
  public prev: Cell<T> | undefined;
  constructor(
    public value: T,
    public readonly position: Vector2,
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
        this.position.x + v[0],
        this.position.y + v[1]
      );
      neighbors.push(neighbor);
    }
    return neighbors;
  }

  walk(opts: GridWalkOpts<T>) {
    return gridWalk(this, opts);
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

  // inclusive until
  peek2(direction: Vector | Vector2, until: (c: T) => boolean): Cell<T>[] {
    const cells: Cell<T>[] = [];
    const p = this.position.clone().add(direction);
    while (true) {
      const cell = this.grid.get(p);
      if (cell === undefined) {
        break;
      }
      cells.push(cell);
      if (until(cell.value)) {
        break;
      }
      p.add(direction);
    }
    return cells;
  }

  toString(): string {
    return `${this.position.x},${this.position.y}: "${this.value}"`; // [${this.distance}]`;
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
    // a.updated = b.updated = true;
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
    console.log("Grid dump".bgBlue);
    for (let y = 0; y < this.height; y++) {
      let row = y % 10 === 0 ? y.toString().padStart(3, " ") + " " : "    ";
      for (let x = 0; x < this.width; x++) {
        const cell = this.cells[y * this.width + x];
        let str = (cell.value as any).toString();
        if (cell.explored) {
          str = str.red;
        }
        row += str;
      }
      console.log(row);
    }
  }
}

type WalkState<T> = {
  best: number;
  cost: number;
  paths: [number, Cell<T>[]][];
  path: Cell<T>[];
  branchEndState: CollisionType;
  visited: Set<Cell<T>>;
};

export enum CollisionType {
  NONE = 0,
  GOAL = 1,
  OBSTACLE = 2,
}

export type GridWalkOpts<T> = {
  cost?: (path: Cell<T>[], prevCost: number) => number;
  collision?: (cell: Cell<T>) => CollisionType;
};

let depth = 0;
export function gridWalk<T>(
  cell: Cell<T>,
  opts: GridWalkOpts<T> = {},
  state: WalkState<T> = {
    best: Infinity,
    cost: 0,
    paths: [],
    path: [],
    branchEndState: CollisionType.NONE,
    visited: new Set(),
  }
) {
  // console.log(depth, "walking", cell.toString());
  depth++;
  state.path.push(cell);

  cell.explored = true;
  state.cost = opts.cost?.(state.path, state.cost) ?? 0;
  if (state.cost > state.best) {
    depth--;
    return state;
  }

  if (opts.collision && state.path.length > 1) {
    const collision = opts.collision(cell);
    if (collision !== CollisionType.NONE) {
      // cell.grid.cells.forEach((c) => (c.updated = false));
      if (collision === CollisionType.GOAL) {
        // console.log(
        //   "end".red,
        //   state.cost,
        //   state.path.map((c) => c.toString()).join(" -> ")
        // );
        // cell.grid.print();
        // console.log(`FOUND`.bgRed);
        if (state.cost < state.best) {
          // cell.grid.print();
          // console.log(`New min cost ${state.cost}`.bgYellow, state.path);
          state.best = state.cost;
          state.paths.push([state.cost, [...state.path]]);
          state.branchEndState = collision;
        }
      }
      // console.log(
      //   "end".red,
      //   state.cost,
      //   state.path.map((c) => c.toString()).join(" -> ")
      // );
      depth--;
      return state;
    }
  }
  const i = state.path.indexOf(cell);
  if (i !== -1 && i !== state.path.length - 1) {
    depth--;
    return state;
  }
  // if (i !== -1 && i > 4 && i === state.path.length - 1) return state;
  // if (state.path.includes(cell)) return state;

  // if (state.visited.has(cell)) return state;
  // state.visited.add(cell);
  // console.log(`walking ${cell.toString()} ${state.cost} ${state.path}`.blue);
  // if (state.cost > best) {
  //   console.log("already worse".yellow);
  //   return state;
  // }
  // we can disregard the prev cell here to optimize

  // we must look for long empty corridors, r

  for (const neighbor of cell.getNeighbors()) {
    if (neighbor === undefined) continue;
    // do not branch to walls
    if (opts.collision?.(neighbor) === CollisionType.OBSTACLE) continue;
    // do not go back
    if (neighbor === state.path[state.path.length - 1]) continue;
    // const dir = neighbor.position.clone().sub(cell.position);
    // cell.peek(dir, "#" as T); // fixme
    const p = state.path.length;
    const c = state.cost;
    // console.log(
    //   "branching to".red,
    //   neighbor.toString(),
    //   "from",
    //   cell.toString()
    // );
    const s = gridWalk(neighbor, opts, state);
    state.cost = c;
    const branchExtension = state.path.splice(p);
    if (s.branchEndState === CollisionType.GOAL) {
      // cell.grid.print();
    }
    s.branchEndState = CollisionType.NONE;
    branchExtension.forEach((c) => (c.explored = false));

    // console.log(
    //   "branch ended",
    //   "current best",
    //   state.best,
    //   s.path.map((c) => c.toString()).join("->"),
    //   s.cost,
    //   s.branchEndState
    // );
    //state.best = s.best;//
    // if (s.branchEndState === CollisionType.GOAL && s.cost < state.best) {
    //   console.log(`new best ${s.cost}`.bgYellow);
    //   state.best = s.cost;
    // }
  }
  depth--;
  return state;
}

// breadth-first search
export function BFS<T>(root: Cell<T>) {
  const queue: Cell<T>[] = [root];
  root.explored = true;
  while (queue.length) {
    const cell = queue.shift()!;
    if (cell.value === "E") return cell;
    for (const n of cell.getNeighbors()) {
      if (n === undefined) continue;
      if (n.explored === true) continue;
      n.explored = true;
      n.prev = cell;
      queue.push(n);
    }
  }
}

const moveCost = <T>(path: Cell<T>[], prevCost = 0) => {
  let c = prevCost;
  if (path.length < 2) return 0;

  // Get current direction
  // const thirdToLast = path[path.length - 3] ?? Directions.east;
  const secondToLast = path[path.length - 2];
  const last = path[path.length - 1];
  const dirCurr = [
    last.position.x - secondToLast.position.x,
    last.position.y - secondToLast.position.y,
  ];

  if (path.length === 2) {
    if (dirCurr[0] !== 1) {
      return 1001;
    }
    return 1;
  }

  const dirPrev = [
    secondToLast.position.x - path[path.length - 3].position.x,
    secondToLast.position.y - path[path.length - 3].position.y,
  ];
  // console.log({ dirCurr, dirPrev });
  // Get direction change
  const dx = dirCurr[0] - dirPrev[0];
  const dy = dirCurr[1] - dirPrev[1];
  if (dx !== 0 || dy !== 0) {
    c += 1000;
  }
  c += 1;
  return c;
};

export function BFS2<T>(root: Cell<T>) {
  const queue: Cell<T>[] = [root];
  root.explored = true;
  let cost = 0;
  let best = Infinity;
  const path: Cell<T>[] = [];
  while (queue.length) {
    const cell = queue.shift()!;
    path.push(cell);
    cost = moveCost(path, cost);
    if (cell.value === "E") {
      return cell;
    }

    for (const n of cell.getNeighbors()) {
      if (n === undefined) continue;
      if (n.explored === true) continue;
      if (n.value === "#") continue;
      n.explored = true;
      n.prev = cell;
      queue.push(n);
    }
  }
}
