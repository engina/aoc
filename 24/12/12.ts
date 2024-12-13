import fs from "fs";
import { amemo, MemCacheStore } from "amemo";
import color from "colors";
import { Cell, Grid, Vector } from "../../lib/grid";
import { parseGrid } from "../../lib/parse";
import { bench } from "../../lib";

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

type Fence = {
  position: Vector;
  side: "N" | "E" | "S" | "W";
  group: number;
};

// Give a fence among fences, walk along the fence as in you touch the fence
// and walk along it until you reach a corner or a dead end
function* walkAlongFence(fence: Fence, fences: Fence[]) {
  let steps = 1;
  const [x, y] = fence.position;

  while (true) {
    let adjacentsVectors: Vector[] = [];
    if (fence.side === "N" || fence.side === "S") {
      // This is a north or south facing fence, meaning it's horizontal
      // so we walk east and west
      adjacentsVectors.push([x + steps, y]);
      adjacentsVectors.push([x - steps, y]);
    } else {
      // This is a east or west facing fence, meaning it's vertical
      // so we walk north and south
      adjacentsVectors.push([x, y + steps]);
      adjacentsVectors.push([x, y - steps]);
    }

    const adjacents = adjacentsVectors
      .map((v) =>
        fences.find(
          (f) =>
            f.position[0] === v[0] &&
            f.position[1] === v[1] &&
            f.side === fence.side
        )
      )
      .filter((f) => f !== undefined);

    if (adjacents.length === 0) {
      // We've reached a corner on both ends, end of the walk
      break;
    }

    // We have at least one adjacent fence, yield adjacent fences
    for (const adjacent of adjacents) {
      yield adjacent;
    }

    steps++;
  }
}

export function study(group: Cell<string>[]) {
  let perimeter = 0;
  const sides = ["N", "E", "S", "W"] as const;
  const fences: Fence[] = [];

  // create fences
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
    if (fence.group === -1) {
      fence.group = fenceGroupId++;
    }

    for (const f of walkAlongFence(fence, fences)) {
      f.group = fence.group;
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
    sides: uniqueFenceGroups.length,
  };
}

export const parse = amemo(
  (input: string) => {
    let grid = parseGrid(input);
    let groups: Cell<string>[][] = [];
    let visited = new Set<Cell<string>>();
    for (let cell of grid.cells) {
      if (visited.has(cell)) continue;
      let group = walk(cell);
      group.forEach((cell) => visited.add(cell));
      groups.push([...group]);
    }
    return { grid, groups };
  },
  {
    cacheStore: new MemCacheStore(),
  }
);

function printFences(groups: Cell<string>[][], grid: Grid<string>) {
  const fences = groups.map(study).flatMap((r) => r.fences);
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const f = fences.filter(
        (f) => f.position[0] === x && f.position[1] === y
      );
      if (f.length === 0) {
        process.stdout.write(" ");
        continue;
      }
      let char = "";
      const sides = f.map((f) => f.side);
      if (
        sides.includes("N") &&
        sides.includes("S") &&
        sides.includes("E") &&
        sides.includes("W")
      ) {
        // print a square
        char = "■";
      } else if (
        sides.includes("N") &&
        sides.includes("S") &&
        sides.includes("E")
      ) {
        // print a 90-degrees counter clock wise rotated U
        process.stdout.write("]");
      } else if (
        sides.includes("N") &&
        sides.includes("S") &&
        sides.includes("W")
      ) {
        // print a 90-degrees clock wise rotated U
        char = "[";
      } else if (
        sides.includes("N") &&
        sides.includes("E") &&
        sides.includes("W")
      ) {
        // print a 90-degrees counter clock wise rotated L
        char = "n";
      } else if (
        sides.includes("S") &&
        sides.includes("E") &&
        sides.includes("W")
      ) {
        // print a 90-degrees clock wise rotated L
        char = "U";
      } else if (sides.includes("N") && sides.includes("S")) {
        // print a |
        char = "=";
      } else if (sides.includes("E") && sides.includes("W")) {
        // roman number 2
        char = "II";
      } else if (sides.includes("N") && sides.includes("E")) {
        // print a 90-degrees counter clock wise rotated L
        char = "┐";
      } else if (sides.includes("N") && sides.includes("W")) {
        // print a 90-degrees clock wise rotated L
        char = "┌";
      } else if (sides.includes("S") && sides.includes("E")) {
        // print a 90-degrees counter clock wise rotated L
        char = "┘";
      } else if (sides.includes("S") && sides.includes("W")) {
        // print a 90-degrees clock wise rotated L
        char = "└";
      } else if (sides.includes("N")) {
        // print a 90-degrees counter clock wise rotated L
        char = "⎺";
      } else if (sides.includes("S")) {
        // print a 90-degrees clock wise rotated L
        char = "_";
      } else if (sides.includes("E")) {
        // print a 90-degrees counter clock wise rotated L
        char = "▕";
      } else if (sides.includes("W")) {
        // print a 90-degrees clock wise rotated L
        char = "⎸";
      }
      process.stdout.write(char);
    }
    process.stdout.write("\n");
  }
}

function printGarden(grid: Grid<string>) {
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
  const uniquePlants = grid.cells
    .map((cell) => cell.value)
    .filter((v, i, a) => a.indexOf(v) === i);
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
