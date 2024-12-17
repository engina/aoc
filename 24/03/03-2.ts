export function part2(input: string) {
  let state: "do" | "don't" = "do";

  class Reader {
    constructor(private lines: string, private pos = 0) {}

    nextToken() {
      // (mul)\((\d{1,3}),(\d{1,3})\)|(do\(\))|(don't\(\))
      const match = this.lines
        .slice(this.pos)
        .match(/(mul)\((\d{1,3}),(\d{1,3})\)|((do)\(\))|((don't)\(\))/);
      if (match) {
        this.pos += match[0].length + (match.index ?? 0);
      }
      return match;
    }
  }

  const reader = new Reader(input);
  let sum = 0;
  while (true) {
    const token = reader.nextToken();
    if (!token) {
      break;
    }
    const [all, op, a, b] = token;
    if (op === "mul") {
      if (state === "do") {
        sum += parseInt(a) * parseInt(b);
      }
    } else if (all === "do()") {
      state = "do";
    } else if (all === "don't()") {
      state = "don't";
    }
  }
  return sum.toString();
}
