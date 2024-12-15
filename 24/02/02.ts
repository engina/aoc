enum Direction {
  Up,
  Down,
}

export function part1(lines: number[][]) {
  return lines
    .filter((line) => {
      let direction: Direction | undefined;

      const tokens = line;
      if (tokens.length < 2) return false;

      let prev = tokens[0];
      for (let i = 1; i < tokens.length; i++) {
        const current = tokens[i];
        const diff = current - prev;
        prev = current;

        if (diff === 0) return false;

        if (direction === undefined) {
          direction = diff > 0 ? Direction.Up : Direction.Down;
        }

        if (direction === Direction.Up && diff < 0) return false;
        if (direction === Direction.Down && diff > 0) return false;
        if (Math.abs(diff) > 3) return false;
      }
      return true;
    })
    .length.toString();
}
