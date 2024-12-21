import { bench, bfs, dfs, dijkstraPQ } from "../../lib";
import { Cell, Grid, Vector } from "../../lib/grid";
import colors from "colors";

let input = ``;

input = `
###############
#...#...#.....#
#.#.#.#.#.###.#
#S#...#.#.#...#
#######.#.#.###
#######.#.#...#
#######.#.###.#
###..E#...#...#
###.#######.###
#...###...#...#
#.#####.#.###.#
#.#...#.#.#...#
#.#.#.#.#.#.###
#...#...#...###
###############
`;

// import fs from "fs";
// input = fs.readFileSync("input.txt", "utf-8");

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
    // u.value = u.value.bgGreen;
    u = u.prev;
  }
  path.reverse();

  // abuse distance to store the index for fast look up below
  path.forEach((p, i) => {
    p.distance = i;
  });

  grid.cells.forEach((c) => (c.explored = false));

  return { grid, path, start, end };
}

export type Input = ReturnType<typeof setup>;

export function part1(input: Input) {
  const { path } = input;
  const totalLength = path.length;
  console.log(totalLength);
  print(path[path.length - 1]);

  const cheatVectors: Vector[] = [
    [0, -2],
    [2, 0],
    [0, 2],
    [-2, 0],
  ];

  const ADVANTAGE_THRESHOLD = 50;
  let cheats = 0;
  const stat: Record<string, number> = {};
  for (let i = 0; i < path.length; i++) {
    const p = path[i];
    const ch = p
      .getNeighbors(cheatVectors)
      .filter(Boolean)
      .filter((c) => c?.value !== "#") as Cell<string>[];
    if (ch.length === 0) continue;
    for (const c of ch) {
      p.value = colors.strip(p.value).bgBlue;
      c.value = colors.strip(c.value).bgMagenta;
      input.grid.print();
      p.value = colors.strip(p.value);
      c.value = colors.strip(c.value);
      const ci = c.distance; // fast lookup
      const advantage = ci - i - 2;
      if (advantage >= ADVANTAGE_THRESHOLD) {
        cheats++;
        if (stat[advantage]) {
          stat[advantage]++;
        } else {
          stat[advantage] = 1;
        }
      }
    }
  }

  console.log(stat);

  return cheats.toString();
}

export function part2(input: Input) {
  const { grid, path } = input;

  // abuse distance to store the index for fast look up below
  path.forEach((p, i) => {
    p.distance = i;
    p.prev = undefined;
    p.explored = false;
  });

  const CHEAT_THRESHOLD = 20;
  const ADVANTAGE_THRESHOLD = 50;
  let cheats = 0;
  const stat: Record<string, number> = {};
  for (let i = 0; i < path.length; i++) {
    if (i % 100 === 0) {
      console.log("i", i, path.length);
    }
    const p = path[i];
    const pos = p.position;
    const shortcuts = path.filter(
      (c) =>
        c.distance > i + ADVANTAGE_THRESHOLD &&
        c.position.manhattan(pos) <= CHEAT_THRESHOLD
    );
    shortcuts.forEach((c) => {
      c.value = colors.strip(c.value).bgRed;
      c.explored = false;
    });
    p.value = colors.strip(p.value).bgBlue;
    grid.print();
    shortcuts.forEach((c) => (c.value = colors.strip(c.value)));

    if (shortcuts.length === 0) continue;

    for (const c of shortcuts) {
      path.forEach((c) => {
        c.explored = false;
        c.prev = undefined;
        // c.value = colors.strip(c.value);
      });

      const x = bfs(
        p,
        (cell) => cell === c,
        (n, steps) => {
          if (steps < CHEAT_THRESHOLD) {
            return n
              .getNeighbors()
              .filter((n) => n?.value === "#" || n === c) as Cell<string>[];
          }
          return [];
        }
      );

      grid.cells.forEach((p) => (p.explored = false));

      if (!x) {
        console.log("no path");
        continue;
      }

      const ci = c.distance; // fast lookup, see above
      const advantage = ci - i - x.cost;
      console.log(i, "advantage", advantage);
      print(x?.goal);

      if (advantage >= ADVANTAGE_THRESHOLD) {
        print(x.goal);
        cheats++;
        if (stat[advantage]) {
          stat[advantage]++;
        } else {
          stat[advantage] = 1;
        }
      }
    }
  }

  console.log(stat);
  return cheats.toString();
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

/*
export function part2(grid: Input) {
  const start = grid.find("S")!;
  const end = grid.find("E")!;

  // grid.cells.forEach((c) => (c.distance = Infinity));
  // start.distance = 0;

  const CHEAT_THRESHOLD = 19;
  const results: [Cell<string>[], number][] = [];
  const queue: [Cell<string>[], number, boolean][] = [[[start], 0, false]];

  while (queue.length) {
    const [path, cheats, hasCheated] = queue.shift()!;
    const last = path[path.length - 1];
    const canCheat = !hasCheated && cheats < CHEAT_THRESHOLD;
    let next = last
      .getNeighbors()
      .filter(Boolean)
      .filter((c) => !path.includes(c!)) as Cell<string>[];

    if (!canCheat) {
      next = next.filter((c) => c.value !== "#");
    }
    // console.log("next", next);

    for (const n of next) {
      if (n === end) {
        // console.log("queue len", queue.length);
        results.push([[...path, n], cheats]);
        // if (results.length > 10) {
        //   process.exit(0);
        // }
        // print(path);
      } else {
        const cheated = hasCheated || (last.value === "#" && n.value !== "#");
        queue.push([[...path, n], cheats + (n.value === "#" ? 1 : 0), cheated]);
      }
    }
  }
  const [fairPath, fairPathLen] = results.find(([p, c]) => c === 0)!;
  results.forEach((p) => {
    const [path, cheats] = p;
    // print(path);
  });
  console.log("results", results.length, fairPathLen);
  print(fairPath);

  // console.log(results.length);

  /////
  grid.print();
  // console.log(br);
}
*/
bench(
  () => {
    console.log(part1(setup(input)));
  },
  { runs: 1 }
);
