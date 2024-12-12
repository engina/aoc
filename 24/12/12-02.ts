import fs from "fs";

import color from "colors";
import { Cell, Vector } from "../../lib/grid";
import { parseGrid } from "../../lib/parse";
import { bench } from "../../lib";

const bgColors = [
  color.bgYellow,
  color.bgRed,
  color.bgMagenta,
  color.bgGreen,
  color.bgCyan,
  color.bgBlue,
  color.bgBlack,
  color.bgWhite,
  color.green,
];

const input = fs.readFileSync("input.txt", "utf-8");
const grid = parseGrid(input);

const uniquePlants = grid.cells
  .map((cell) => cell.value)
  .filter((v, i, a) => a.indexOf(v) === i);

function walk(cell: Cell<string>, visited: Set<Cell<string>> = new Set()) {
  if (visited.has(cell)) return visited;
  visited.add(cell);
  for (const neighbor of cell.getNeighbors()) {
    if (neighbor?.value === cell.value) {
      walk(neighbor, visited);
    }
  }
  return visited;
}

function printGarden() {
  process.stdout.write("    ");
  for (let i = 0; i < grid.width; i += 10) {
    process.stdout.write(i.toString().padEnd(10, " "));
  }
  process.stdout.write("\n");
  for (let y = 0; y < grid.height; y++) {
    process.stdout.write(
      y % 10 === 0 ? y.toString().padStart(3, " ").padEnd(4, " ") : "    "
    );
    for (let x = 0; x < grid.width; x++) {
      const cell = grid.get(x, y);
      if (cell === undefined) throw new Error("Cell is undefined");
      const colorFn =
        bgColors[uniquePlants.indexOf(cell.value) % bgColors.length];
      process.stdout.write(colorFn(cell.value));
    }
    process.stdout.write(y % 10 === 0 ? " " + y.toString() : "");
    process.stdout.write("\n");
  }
}

function calc(group: Cell<string>[]) {
  let perimeter = 0;
  const sides = ["N", "E", "S", "W"] as const;
  const fences: {
    position: Vector;
    side: (typeof sides)[number];
    group: number;
  }[] = [];

  for (const cell of group) {
    const neighbors = cell.getNeighbors();
    for (let i = 0; i < neighbors.length; i++) {
      const neighbor = neighbors[i];
      if (neighbor === undefined || neighbor.value !== cell.value) {
        fences.push({
          position: cell.position,
          side: sides[i],
          group: -1,
        });
        perimeter++;
      }
    }
  }
  // merge fences
  let fenceGroupId = 0;
  for (let i = 0; i < fences.length; i++) {
    const fence = fences[i];
    const { position, side } = fence;
    if (fence.group === -1) {
      fence.group = fenceGroupId++;
    }
    if (side === "N" || side === "S") {
      // walk left and right and merge fences
      let f: typeof fence | undefined;
      let [x, y] = position;
      for (let xx = x - 1; ; xx--) {
        f = fences.find(
          (f) => f.position[0] === xx && f.position[1] == y && f.side === side
        );
        if (f === undefined) break;
        f.group = fence.group;
      }
      for (let xx = x + 1; ; xx++) {
        f = fences.find(
          (f) => f.position[0] === xx && f.position[1] == y && f.side === side
        );
        if (f === undefined) break;
        f.group = fence.group;
      }
    }

    if (side === "E" || side === "W") {
      // walk up and down and merge fences
      let f: typeof fence | undefined;
      let [x, y] = position;
      for (let yy = y - 1; ; yy--) {
        f = fences.find(
          (f) => f.position[1] === yy && f.position[0] === x && f.side === side
        );
        if (f === undefined) break;
        f.group = fence.group;
      }

      for (let yy = y + 1; ; yy++) {
        f = fences.find(
          (f) => f.position[1] === yy && f.position[0] === x && f.side === side
        );
        if (f === undefined) break;
        f.group = fence.group;
      }
    }
  }

  const uniqueFenceGroups = fences
    .map((f) => f.group)
    .filter((v, i, a) => a.indexOf(v) === i);

  return {
    plant: group[0].value,
    area: group.length,
    perimeter,
    fences,
    fenceGroups: uniqueFenceGroups.length,
  };
}

// printGarden();

// const costs = groups.map(calc).map((r) => {
//   return r.area * r.fenceGroups;
// });
// const fences = groups.map(calc).flatMap((r) => r.fences);
// for (let y = 0; y < grid.height; y++) {
//   for (let x = 0; x < grid.width; x++) {
//     const f = fences.filter((f) => f.position[0] === x && f.position[1] === y);
//     if (f.length === 0) {
//       process.stdout.write(" ");
//       continue;
//     }
//     let char = "";
//     const sides = f.map((f) => f.side);
//     if (
//       sides.includes("N") &&
//       sides.includes("S") &&
//       sides.includes("E") &&
//       sides.includes("W")
//     ) {
//       // print a square
//       char = "■";
//     } else if (
//       sides.includes("N") &&
//       sides.includes("S") &&
//       sides.includes("E")
//     ) {
//       // print a 90-degrees counter clock wise rotated U
//       process.stdout.write("]");
//     } else if (
//       sides.includes("N") &&
//       sides.includes("S") &&
//       sides.includes("W")
//     ) {
//       // print a 90-degrees clock wise rotated U
//       char = "[";
//     } else if (
//       sides.includes("N") &&
//       sides.includes("E") &&
//       sides.includes("W")
//     ) {
//       // print a 90-degrees counter clock wise rotated L
//       char = "n";
//     } else if (
//       sides.includes("S") &&
//       sides.includes("E") &&
//       sides.includes("W")
//     ) {
//       // print a 90-degrees clock wise rotated L
//       char = "U";
//     } else if (sides.includes("N") && sides.includes("S")) {
//       // print a |
//       char = "=";
//     } else if (sides.includes("E") && sides.includes("W")) {
//       // roman number 2
//       char = "II";
//     } else if (sides.includes("N") && sides.includes("E")) {
//       // print a 90-degrees counter clock wise rotated L
//       char = "┐";
//     } else if (sides.includes("N") && sides.includes("W")) {
//       // print a 90-degrees clock wise rotated L
//       char = "┌";
//     } else if (sides.includes("S") && sides.includes("E")) {
//       // print a 90-degrees counter clock wise rotated L
//       char = "┘";
//     } else if (sides.includes("S") && sides.includes("W")) {
//       // print a 90-degrees clock wise rotated L
//       char = "└";
//     } else if (sides.includes("N")) {
//       // print a 90-degrees counter clock wise rotated L
//       char = "⎺";
//     } else if (sides.includes("S")) {
//       // print a 90-degrees clock wise rotated L
//       char = "_";
//     } else if (sides.includes("E")) {
//       // print a 90-degrees counter clock wise rotated L
//       char = "▕";
//     } else if (sides.includes("W")) {
//       // print a 90-degrees clock wise rotated L
//       char = "⎸";
//     }
//     process.stdout.write(char);
//   }
//   process.stdout.write("\n");
// }
// const sum = costs.reduce((acc, c) => acc + c, 0);
// console.log(sum);

function part1(input: string) {
  let grid = parseGrid(input);
  let groups: Cell<string>[][] = [];
  let visited = new Set<Cell<string>>();
  for (let cell of grid.cells) {
    if (visited.has(cell)) continue;
    let group = walk(cell);
    group.forEach((cell) => visited.add(cell));
    groups.push([...group]);
  }
  let costs = groups.map(calc).map((r) => r.area * r.perimeter);
  return costs.reduce((acc, c) => acc + c, 0);
}

function part2(input: string) {
  let grid = parseGrid(input);
  let groups: Cell<string>[][] = [];
  let visited = new Set<Cell<string>>();
  for (let cell of grid.cells) {
    if (visited.has(cell)) continue;
    let group = walk(cell);
    group.forEach((cell) => visited.add(cell));
    groups.push([...group]);
  }
  let costs = groups.map(calc).map((r) => r.area * r.fenceGroups);
  return costs.reduce((acc, c) => acc + c, 0);
}

bench(() => console.log("part1", part1(input), "part1"));
bench(() => console.log("part2", part2(input), "part2"));
