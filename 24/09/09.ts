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

export function run(input: string) {
  const l = layout(input);
  const d = defrag(l);
  const c = checksum(d, true);
  return c;
}
