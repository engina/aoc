import fs from "fs";

const input = fs.readFileSync("input.txt", "utf8");

const lines = input.split("\n").filter(Boolean);

const rules = lines
  .filter((l) => l.includes("|"))
  .map((l) => {
    const [a, b] = l.split("|").map((s) => parseInt(s, 10));
    return [a, b];
  });

const updates = lines
  .filter((l) => !l.includes("|"))
  .map((l) => l.split(",").map((s) => parseInt(s, 10)));

function sortCmp(a: number, b: number, rules: number[][]): number {
  const relevantRules = rules.filter(
    ([o1, o2]) => (o1 === a && o2 === b) || (o1 === b && o2 === a)
  );

  for (const rule of relevantRules) {
    const [o1, o2] = rule;
    if (o1 === a && o2 === b) return -1;
    if (o1 === b && o2 === a) return 1;
  }
  return 0;
}

function sort(update: number[], rules: number[][]): number[] {
  return update.slice().sort((a, b) => sortCmp(a, b, rules));
}

function arrCmp(arr1: number[], arr2: number[]): boolean {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

function isCorrectOrder(update: number[], rules: number[][]): boolean {
  const sorted = sort(update, rules);
  return arrCmp(update, sorted);
}

const middlePages: number[] = [];

updates.forEach((u) => {
  console.log("before: ", u);
  const sorted = sort(u, rules);
  if (arrCmp(u, sorted)) return;
  if (sorted.length % 2 === 0) {
    console.error("No middle value for even numbers", sorted);
    throw Error("Invalid input");
  }
  const middle = sorted[Math.floor(sorted.length / 2)];
  middlePages.push(middle);

  console.log("sorted: ", sort(u, rules), isCorrectOrder(u, rules) ? "Y" : "N");
  console.log("middle: ", middle);
});

const sum = middlePages.reduce((acc, curr) => acc + curr, 0);
console.log(sum);
