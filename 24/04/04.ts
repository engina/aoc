import fs from "fs";
import assert from "assert";

function* rect(
  x: number,
  y: number,
  w: number,
  h: number
): Generator<[number, number]> {
  for (let i = x; i < x + w; i++) {
    for (let j = y; j < y + h; j++) {
      yield [i, j];
    }
  }
}

function* genV2(
  vs: [[number, number], [number, number]]
): Generator<[number, number]> {
  const [[x1, y1], [x2, y2]] = vs;
  for (let i = x1; i < x2; i++) {
    for (let j = y1; j < y2; j++) {
      yield [i, j];
    }
  }
}
for (const p of rect(0, 0, 3, 3)) {
  console.log(p);
}

const started = performance.now();
const needle = "XMAS";

const needleReversed = needle.split("").reverse().join("");
const input = fs.readFileSync("input.txt", "utf-8");
const lines = input.split("\n").filter(Boolean);

const HEIGHT = lines.length;
const WIDTH = lines[0].length;

// assert that all lines have the same length
for (let i = 0; i < lines.length; i++) {
  assert(lines[i].length === WIDTH);
}

console.log(`Width: ${WIDTH}, Height: ${HEIGHT}`);

const linesVertical: string[] = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    if (!linesVertical[j]) {
      linesVertical[j] = "";
    }
    linesVertical[j] += line[j];
  }
}

// assert vertical lines have the same length and equal to HEIGHT
for (let i = 0; i < linesVertical.length; i++) {
  assert(linesVertical[i].length === HEIGHT);
}

function get(x: number, y: number): string {
  const r = lines[y]?.[x];
  assert(r);
  return r;
}

type Vector2 = [number, number];

function diagCreate(w: number, h: number): Vector2[] {
  const result: Vector2[] = [];
  for (let i = 0; i < w; i++) {
    result.push([i, i]);
  }
  return result;
}

function diagMirror(diag: Vector2[]): Vector2[] {
  return diag.map(([x, y]) => [WIDTH - x - 1, y]);
}

function print(diag: Vector2[]): void {
  console.log("---");
  for (let x = 0; x < WIDTH; x++) {
    for (let y = 0; y < HEIGHT; y++) {
      if (diag.some(([dx, dy]) => dx === x && dy === y)) {
        process.stdout.write("X");
      } else {
        process.stdout.write(".");
      }
    }
    process.stdout.write("\n");
  }
}

const diag1 = diagCreate(WIDTH, HEIGHT);
const diag2 = diagMirror(diag1);

function diagShift(diag: Vector2[], shiftX: number, shiftY: number): Vector2[] {
  return diag
    .map<Vector2>(([x, y]) => [x + shiftX, y + shiftY])
    .filter(([x, y]) => x < WIDTH && y < HEIGHT);
}

const allLines = lines.concat(linesVertical);
allLines.push(diag2Str(diag1));
allLines.push(diag2Str(diag2));
async function gen() {
  // create all diagonals
  for (let i = 1; i < WIDTH - needle.length + 1; i++) {
    const diag1Shifted = diagShift(diag1, i, 0);
    const diag2Shifted = diagShift(diag2, i, 0);
    const diag1ShiftedNeg = diagShift(diag1, 0, i);
    const diag2ShiftedNeg = diagShift(diag2, 0, i);
    allLines.push(diag2Str(diag1Shifted));
    allLines.push(diag2Str(diag2Shifted));
    allLines.push(diag2Str(diag1ShiftedNeg));
    allLines.push(diag2Str(diag2ShiftedNeg));
    // if (i === 1 || i === WIDTH - needle.length)
    {
      // print(diag1Shifted);
      // print(diag2Shifted);
      // print(diag1ShiftedNeg);
      // print(diag2ShiftedNeg);
    }
    // await new Promise((resolve) => setTimeout(resolve, 50));
    continue;
  }
}

gen();

// diagonals to strings
function diag2Str(diag: Vector2[]): string {
  return diag.map(([x, y]) => get(x, y)).join("");
}

// let diagonalsStr: string[] = diagonals.map(diag2Str);
// diagonalsStr = diagonalsStr.concat(lines, linesVertical);

function countOccurancesForward(needle: string, haystack: string): number {
  let count = 0;
  let pos = 0;
  while (true) {
    const foundPos = haystack.indexOf(needle, pos);
    if (foundPos === -1) {
      break;
    }
    count++;
    pos = foundPos + 1;
  }
  return count;
}

function countOccurances(needle: string, haystack: string): number {
  return (
    countOccurancesForward(needle, haystack) +
    countOccurancesForward(needleReversed, haystack)
  );
}
console.log(allLines.length);

// print(diag1);
// console.log(diag2Str(diag1));

const counts = allLines.map((diag) => countOccurances(needle, diag));

const sum = counts.reduce((acc, curr) => acc + curr, 0);
const elapsed = performance.now() - started;
console.log(`Took: ${elapsed.toFixed(2)}ms`);
console.log(sum);

// const sample = 150;
// print(diagonals[sample]);
// console.log(diag2Str(diagonals[sample]));
// console.log(countOccurances(needle, diag2Str(diagonals[sample])));
