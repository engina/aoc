import assert from "assert";

export function part1(input: string): string {
  // find all mul operations mul\(\d{1,3},\d{1,3}\)
  const mulOps = input.match(/(mul)\((\d{1,3}),(\d{1,3})\)/g);
  assert(mulOps);

  const sum = mulOps
    .map((opStr) => {
      const match = opStr.match(/(mul)\((\d{1,3}),(\d{1,3})\)/);
      assert(match);
      const [, op, a, b] = match;
      assert(op === "mul");
      const result = parseInt(a) * parseInt(b);
      return result;
    })
    .reduce((acc, curr) => acc + curr, 0);

  return sum.toString();
}
