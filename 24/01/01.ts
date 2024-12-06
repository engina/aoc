import fs from "fs";

const a: number[] = [];
const b: number[] = [];
fs.readFileSync("input.txt", "utf-8")
  .split("\n")
  .forEach((line) => {
    // /(\d+)\s+\(d+)/

    const [aa, bb] = line
      .trim()
      .split("   ")
      .map((x) => parseInt(x.trim()));
    if (isNaN(aa) || isNaN(bb)) {
      return;
    }
    a.push(aa);
    b.push(bb);
  });

a.sort();
b.sort();

let sum = 0;
for (let i = 0; i < a.length; i++) {
  sum += Math.abs(a[i] - b[i]);
}
console.log("sum", sum);

let similar = 0;
for (let i = 0; i < a.length; i++) {
  const needle = a[i];
  const n = b.filter((x) => x === needle).length;
  similar += a[i] * n;
}

console.log("similar", similar);
