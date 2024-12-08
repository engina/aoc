import fs from "fs";

const input = fs.readFileSync("input.txt", "utf8");

const lines = input.split("\n").filter((line) => {
  if (!line) return false;

  let direction: "up" | "down" | undefined;

  const tokens = line.split(" ").map((x) => parseInt(x, 10));
  if (tokens.length < 2) return false;

  let prev = tokens[0];
  for (let i = 1; i < tokens.length; i++) {
    const current = tokens[i];
    const diff = current - prev;
    prev = current;

    if (diff === 0) return false;

    if (direction === undefined) {
      direction = diff > 0 ? "up" : "down";
    }

    if (direction === "up" && diff < 0) return false;
    if (direction === "down" && diff > 0) return false;
    if (Math.abs(diff) > 3) return false;
  }
  return true;
});

console.log(lines.length);
