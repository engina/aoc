import fs from "fs";

const input = fs.readFileSync("input.txt", "utf8");
const lines = input
  .split("\n")
  .filter((i) => !!i)
  .map((line) => {
    const tokens = [
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
    ];
    function tok2num(tok: string): string {
      switch (tok) {
        case "one":
          return "1";
        case "two":
          return "2";
        case "three":
          return "3";
        case "four":
          return "4";
        case "five":
          return "5";
        case "six":
          return "6";
        case "seven":
          return "7";
        case "eight":
          return "8";
        case "nine":
          return "9";
        default:
          return tok;
      }
    }
    const firstArr = tokens
      .map((token) => [token, line.indexOf(token)])
      .filter(([_, idx]) => idx !== -1)
      .sort((a, b) => a[1] - b[1]);
    const first = firstArr[0][0] as string;
    const lastArr = tokens
      .map((token) => [token, line.lastIndexOf(token)])
      .filter(([_, idx]) => idx !== -1)
      .sort((a, b) => b[1] - a[1]);
    const last = lastArr[0][0] as string;
    // console.log({ firstArr, lastArr });
    const result = tok2num(first) + tok2num(last);
    console.log(line, first, last, result);
    return parseInt(result);
  });
const sum = lines.reduce((acc, x) => acc + x, 0);
console.log("sum", sum);

// 53363 not right
