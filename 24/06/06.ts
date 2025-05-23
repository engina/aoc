// import fs, { Dirent } from "fs";

// const input = fs.readFileSync("input.txt", "utf8");

// const input = `....#.....
// .........#
// ..........
// ..#.......
// .......#..
// ..........
// .#..^.....
// ........#.
// #.........
// ......#...
// `;

type Vector2 = [number, number];
type Direction = "^" | "v" | "<" | ">";
type GuardVector = { pos: Vector2; dir: Direction };
export type Grid = string[][];

// const grid: Grid = input
//   .split("\n")
//   .filter(Boolean)
//   .map((l) => l.split(""));

function guardGetVector(grid: Grid): GuardVector {
  // guard characters are '^', 'v', '<', '>'
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const dir = grid[y][x];
      if (dir === "^" || dir === "v" || dir === "<" || dir === ">") {
        return { pos: [x, y], dir };
      }
    }
  }
  throw Error("No guard found");
}

function gridGetLingOfSight(grid: Grid, guardVector: GuardVector): number {
  const [x, y] = guardVector.pos;
  const dir = guardVector.dir;
  const result: string[] = [];
  let x2 = x;
  let y2 = y;
  while (true) {
    switch (dir) {
      case "^":
        y2--;
        break;
      case "v":
        y2++;
        break;
      case "<":
        x2--;
        break;
      case ">":
        x2++;
        break;
    }
    if (y2 < 0 || y2 >= grid.length || x2 < 0 || x2 >= grid[y2].length) {
      break;
    }
    if (grid[y2][x2] === "#") {
      break;
    }
    result.push(grid[y2][x2]);
  }
  return result.length;
}

function guardRotateRight(grid: Grid, guard: GuardVector) {
  const [x, y] = guard.pos;
  switch (guard.dir) {
    case "^":
      grid[y][x] = ">";
      guard.dir = ">";
      break;
    case "v":
      grid[y][x] = "<";
      guard.dir = "<";
      break;
    case "<":
      grid[y][x] = "^";
      guard.dir = "^";
      break;
    case ">":
      grid[y][x] = "v";
      guard.dir = "v";
      break;
  }
}

function guardMove(grid: Grid): "out" | "hit" {
  const guard = guardGetVector(grid);
  const steps = gridGetLingOfSight(grid, guard) + 1;
  grid[guard.pos[1]][guard.pos[0]] = "X";
  for (let i = 0; i < steps; i++) {
    const [x, y] = guard.pos;
    let x2 = x;
    let y2 = y;
    switch (guard.dir) {
      case "^":
        y2--;
        break;
      case "v":
        y2++;
        break;
      case "<":
        x2--;
        break;
      case ">":
        x2++;
        break;
    }

    if (y2 < 0 || y2 >= grid.length || x2 < 0 || x2 >= grid[y2].length) {
      return "out";
    }

    if (grid[y2][x2] === "#") {
      guardRotateRight(grid, guard);
      return "hit";
    }
    grid[y2][x2] = "X";
    guard.pos = [x2, y2];
  }
  throw Error("Guard did not hit anything");
}

function printGrid(grid: Grid) {
  console.log("Grid:");
  for (const row of grid) {
    console.log(row.join(""));
  }
}

function gridCountCovered(grid: Grid): number {
  let count = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (cell === "X") {
        count++;
      }
    }
  }
  return count;
}

export function run(grid: Grid) {
  while (guardMove(grid) !== "out") {
    // printGrid(grid);
  }
  return gridCountCovered(grid).toString();
}
