import { bfs } from "../../lib";
import { Cell, Grid, Vector } from "../../lib/grid";
import colors from "colors";

export function setup(input: string) {
  const grid = new Grid(
    input
      .trim()
      .split("\n")
      .map((l) => l.split(""))
  );
  const start = grid.find("S")!;
  const end = grid.find("E")!;

  const br = bfs(
    start,
    (c) => c === end,
    (n) => n.getNeighbors().filter((c) => c?.value !== "#") as Cell<string>[]
  );

  let u = br?.goal;
  let path: Cell<string>[] = [];
  while (u) {
    path.push(u);
    u = u.prev;
  }
  path.reverse();

  // abuse distance to store the index for fast look up below
  path.forEach((p, i) => {
    p.distance = i;
  });

  return { grid, path, start, end };
}

export type Input = ReturnType<typeof setup>;

function run(input: Input, cheatSteps: number, advantageThreshold: number) {
  const { path } = input;

  let cheats = 0;
  for (let i = 0; i < path.length; i++) {
    const p = path[i];
    const ch = path
      .slice(p.distance + advantageThreshold)
      .filter((cell) => cell.position.manhattan(p.position) <= cheatSteps);
    if (ch.length === 0) continue;
    for (const c of ch) {
      const ci = c.distance; // fast lookup
      const advantage = ci - i - c.position.manhattan(p.position);
      if (advantage >= advantageThreshold) {
        cheats++;
      }
    }
  }

  return cheats.toString();
}

export function part1(input: Input) {
  return run(input, 2, 100);
}

export function part2(input: Input) {
  return run(input, 20, 100);
}

function print(path: Cell<string>) {
  const grid = path.grid;
  let u: Cell<string> | undefined = path;
  const total =
    grid.cells.filter((c) => colors.strip(c.value) === ".").length + 2;
  const tail = path;
  let head: Cell<string> | undefined = path;
  let dots = 1;
  let walls = 0;
  while (u) {
    const val = colors.strip(u.value);
    if (val === ".") {
      dots++;
    } else if (val === "#") {
      walls++;
    }
    u.value = val.bgMagenta;
    u.explored = false;
    if (!u.prev) {
      head = u;
      u.value = colors.strip(u.value).bgCyan;
    }
    u = u.prev;
  }
  const left = grid.cells.filter(
    (c) => c.distance > tail.distance && c.distance !== Infinity
  );
  left.forEach((c) => (c.value = colors.strip(c.value).bgYellow));
  path.value = colors.strip(path.value).bgRed;
  grid.print();
  console.log(
    "dots",
    dots,
    "walls",
    walls,
    "advantage",
    total - (dots + walls + left.length),
    total
  );
  grid.cells.forEach((c) => {
    c.explored = false;
    c.value = colors.strip(c.value);
  });
}
