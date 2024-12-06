import fs from "fs";

type Rect = string[][];

const input = fs.readFileSync("input.txt", "utf8");

const buf: Rect = input
  .split("\n")
  .filter(Boolean)
  .map((line) => line.split(""));

function getRect(buf: Rect, x: number, y: number, w: number, h: number): Rect {
  return buf.slice(y, y + h).map((row) => row.slice(x, x + w));
}

function cmp(a: Rect, b: Rect): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].length !== b[i].length) return false;
    for (let j = 0; j < a[i].length; j++) {
      if (a[i][j] === "*" || b[i][j] === "*") continue;
      if (a[i][j] !== b[i][j]) return false;
    }
  }
  return true;
}

const validPatterns = [
  [
    ["M", "*", "S"],
    ["*", "A", "*"],
    ["M", "*", "S"],
  ],
  [
    ["M", "*", "M"],
    ["*", "A", "*"],
    ["S", "*", "S"],
  ],
  [
    ["S", "*", "M"],
    ["*", "A", "*"],
    ["S", "*", "M"],
  ],
  [
    ["S", "*", "S"],
    ["*", "A", "*"],
    ["M", "*", "M"],
  ],
];

function print(rect: Rect) {
  console.log("+-+-+-+");
  console.log(rect.map((row) => `|${row.join("|")}|`).join("\n+-+-+-+\n"));
  console.log("+-+-+-+");
}

let count = 0;
for (let y = 0; y < buf.length - 2; y++) {
  for (let x = 0; x < buf[y].length - 2; x++) {
    const rect = getRect(buf, x, y, 3, 3);
    console.log(`Checking ${x}, ${y}`);
    print(rect);
    if (validPatterns.some((pattern) => cmp(rect, pattern))) {
      count++;
    }
  }
}

console.log(count);
