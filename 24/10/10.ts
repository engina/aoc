import { parseArr } from "../../lib/parse";
import "colors";
import fs from "fs";

const DEBUG = false;

const input = fs.readFileSync("input.txt", "utf-8");

const debug = DEBUG ? (...args: any[]) => console.log(...args) : () => {};

// const input = `89010123
// 78121874
// 87430965
// 96549874
// 45678903
// 32019012
// 01329801
// 10456732
// `;

const data = parseArr(input);

type SummitPath = Cell[];

class Vector2 {
  constructor(public x: number, public y: number) {}
}

class Cell extends Vector2 {
  constructor(
    public x: number,
    public y: number,
    public readonly height: number,
    public readonly map: Map
  ) {
    super(x, y);
  }

  getNeighbors(): Cell[] {
    const neighborVectors = [
      new Vector2(this.x, this.y - 1),
      new Vector2(this.x, this.y + 1),
      new Vector2(this.x + 1, this.y),
      new Vector2(this.x - 1, this.y),
    ];

    return neighborVectors
      .map((v) => this.map.get(v))
      .filter((c) => c) as Cell[];
  }

  walk(state?: {
    summitPaths: SummitPath[];
    path: Cell[];
    uniqueSummits: Set<Cell>;
  }) {
    if (!state) {
      state = {
        path: [],
        summitPaths: [],
        uniqueSummits: new Set(),
      };
    }
    debug(
      "| ".repeat(state.path.length) + ` (${state.path.length}) walking x: `,
      this.x,
      "y: ",
      this.y,
      "height: ",
      this.height
    );

    if (this.height === 9) {
      const summitPath = [...state.path, this];
      state.summitPaths.push(summitPath);
      state.uniqueSummits.add(this);
      debug(
        "| ".repeat(state.path.length) + "       summit found",
        [...state.path, this].map((n) => `${n.x},${n.y}`).join(" -> ")
      );
      return state;
    }

    state.path.push(this);

    const neighbors = this.getNeighbors().filter(
      (n) => n.height - this.height === 1
    );
    neighbors.forEach((n) => {
      debug(
        `${"| ".repeat(state.path.length)}       \\-- x: ${n.x} y: ${
          n.y
        } height: ${n.height}`
      );
    });
    for (const neighbor of neighbors) {
      neighbor.walk(state);
    }

    state.path.pop();
    return state;
  }
}

class Map {
  public readonly width: number;
  public readonly height: number;
  public readonly cells: Cell[] = [];
  public readonly cellGrid: Cell[][] = [];

  constructor(public data: string[][]) {
    this.width = data[0].length;
    this.height = data.length;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const data = this.data[y][x];
        const height = parseInt(data);
        const cell = new Cell(x, y, height, this);
        this.cells.push(cell);
        if (!this.cellGrid[y]) {
          this.cellGrid[y] = [];
        }
        this.cellGrid[y][x] = cell;
      }
    }
  }

  get(pos: Vector2): Cell | undefined {
    return this.cellGrid[pos.y]?.[pos.x];
  }

  findAll(char: string): Cell[] {
    const result: Cell[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.data[y][x] === char) {
          result.push(this.cellGrid[y][x]);
        }
      }
    }
    return result;
  }
}

const map = new Map(data);
// debug("nb", map.findAll("0")[0]);
// const summits: SummitPath[] = [];

const walks = map.findAll("0").map((cell) => cell.walk());

const summits = walks
  .map((w) => w.uniqueSummits.size)
  .reduce((acc, curr) => acc + curr, 0);

const totalTrails = walks
  .map((w) => w.summitPaths.length)
  .reduce((acc, curr) => acc + curr, 0);

console.log("part1: total summits", summits);
console.log("part2: total trails", totalTrails);

function summitsPrint(summits: SummitPath) {
  const hline = "+" + "-".repeat(map.width) + "+";
  debug(hline);
  for (let y = 0; y < map.height; y++) {
    process.stdout.write("|");
    for (let x = 0; x < map.width; x++) {
      const cell = map.get(new Vector2(x, y))!;
      const isVisited = summits.some((summit) => summit === cell);
      if (!isVisited) {
        process.stdout.write(cell.height.toString());
      } else {
        process.stdout.write(cell.height.toString().green);
      }
    }
    process.stdout.write("|\n");
  }
  debug(hline);
}
