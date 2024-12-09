import fs from "fs";
const input = fs.readFileSync("input.txt", "utf8").trim();
// const input = `2333133121414131402`;

function layout(input: string): string[] {
  let result: string[] = [];
  let id = 0;
  let state: "file" | "space" = "file";

  for (let i = 0; i < input.length; i++) {
    const digit = parseInt(input[i], 10);

    if (state === "file") {
      for (let j = 0; j < digit; j++) {
        result.push(id.toString());
      }
      id++;
    } else {
      for (let j = 0; j < digit; j++) {
        result.push(".");
      }
    }
    state = state === "file" ? "space" : "file";
  }

  return result;
}

const isFile = (c: string) => c !== ".";

function findLastFileBlock(
  layout: string[],
  startFrom = layout.length - 1
): number {
  for (let i = startFrom; i >= 0; i--) {
    if (isFile(layout[i])) {
      return i;
    }
  }
  return -1;
}

function defrag(layout: string[]): string[] {
  let defragged = layout;
  let firstFreeBlock = 0;
  let lastFileBlock = defragged.length - 1;
  while (true) {
    firstFreeBlock = defragged.indexOf(".", firstFreeBlock);
    lastFileBlock = findLastFileBlock(defragged, lastFileBlock);
    if (firstFreeBlock < lastFileBlock) {
      defragged[firstFreeBlock] = defragged[lastFileBlock];
      defragged[lastFileBlock] = ".";
    } else {
      break;
    }
  }
  return defragged;
}

function checksum(layout: string[], isDefragged = false): number {
  let sum = 0;
  for (let i = 0; i < layout.length; i++) {
    if (layout[i] !== ".") {
      const id = parseInt(layout[i], 10);
      sum += id * i;
    } else if (isDefragged) {
      break;
    }
  }
  return sum;
}

const bench = <R>(fn: () => R, label?: string) => {
  const start = performance.now();
  const result = fn();
  const elapsed = performance.now() - start;
  console.log(`[${label ?? "Bench"}] took: ${elapsed.toFixed(2)}ms`);
  return result;
};

const l = bench(() => layout(input), "layoutting");
const d = bench(() => defrag(l), "defragging");
const c = bench(() => checksum(d, true), "checksumming");

console.log(c);
