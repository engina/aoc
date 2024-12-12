import fs from "fs";
import { Cell } from "../../lib/grid";
import { parseArr, parseGrid } from "../../lib/parse";

import color, { bgBlack } from "colors";

const colors = [
  color.bgYellow,
  color.bgRed,
  color.bgMagenta,
  color.bgGreen,
  color.bgCyan,
  color.bgBlue,
  color.bgBlack,
  color.bgWhite,
];

let input = `RRRRIICCFF
RRRRIICCCF
VVRRRCCFFF
VVRCCCJFFF
VVVVCJJCFE
VVIVCCJJEE
VVIIICJJEE
MIIIIIJJEE
MIIISIJEEE
MMMISSJEEE
`;

// input = `AAAA
// BBCD
// BBCC
// EEEC
// `;

// input = fs.readFileSync("input.txt", "utf-8");
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

const visited = new Set<Cell<string>>();
const regions: Cell<string>[][] = [];

for (const cell of grid.cells) {
  if (visited.has(cell)) continue;
  const v = walk(cell);
  v.forEach((cell) => visited.add(cell));
  regions.push([...v]);
}

function printGrid() {
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const cell = grid.get(x, y);
      if (cell === undefined) throw new Error("Cell is undefined");
      const colorFn = colors[uniquePlants.indexOf(cell.value) % colors.length];
      process.stdout.write(colorFn(cell.value));
    }
    process.stdout.write("\n");
  }
}

function calc(region: Cell<string>[]) {
  let perimeter = 0;
  for (const cell of region) {
    for (const neighbor of cell.getNeighbors()) {
      // console.log(`cell: ${cell}, neighbor: ${neighbor}`);
      if (neighbor === undefined || neighbor.value !== cell.value) {
        // console.log(`putting a fence`);
        perimeter++;
      }
    }
  }
  return {
    plant: region[0].value,
    area: region.length,
    perimeter,
  };
}

printGrid();
const costs = regions.map(calc).map((r) => r.area * r.perimeter);
const sum = costs.reduce((acc, c) => acc + c, 0);
console.log(sum);
