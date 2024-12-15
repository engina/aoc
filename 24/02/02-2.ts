function verify(arr: number[]): boolean {
  let direction: "up" | "down" | undefined;

  let prev = arr[0];
  for (let i = 1; i < arr.length; i++) {
    const current = arr[i];
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
}

export function part2(lines: number[][]) {
  return lines
    .filter((line) => {
      const tokens = line;
      if (tokens.length < 2) return false;

      if (verify(tokens)) return true;

      for (let i = 0; i < tokens.length; i++) {
        const tokensCopy = tokens.slice();
        tokensCopy.splice(i, 1);
        if (verify(tokensCopy)) return true;
      }
      return false;
    })
    .length.toString();
}
