import { Grid } from "./grid";

export type ParseTransform<V> = (
  valueStr: string,
  values: string[],
  lines: string,
  key?: string
) => V;

const defaultTransform = <V = string>(input: string): V => input as V;

const numberTransform = <V = number>(input: string): V => Number(input) as V;

const bigintTransform = <V = bigint>(input: string): V => BigInt(input) as V;

export const Transformers = {
  string: defaultTransform,
  number: numberTransform,
  bigint: bigintTransform,
};

export function parseDict<K = string, V = string>(
  inputs: string,
  transformKey: ParseTransform<K> = Transformers.string,
  transformValue: ParseTransform<V> = Transformers.string
): [K, V[]][] {
  const dict: [K, V[]][] = [];
  inputs
    .split("\n")
    .filter(Boolean)
    .forEach((line) => {
      const [_id, ...nextIds] = line.split(" ");
      let id = _id.slice(0, -1);
      const k = transformKey(id, nextIds, line);
      const operands = nextIds.map((nextId) =>
        transformValue(nextId, nextIds, line, id)
      );
      dict.push([k, operands]);
    });
  return dict;
}

export function parseArr<V = string>(
  inputs: string,
  transform: ParseTransform<V> = Transformers.string
): V[][] {
  return inputs
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const tokens = line.split("");
      return tokens.map((token) => transform(token, tokens, line));
    });
}

export function parseGrid<V = string>(
  inputs: string,
  transform: ParseTransform<V> = Transformers.string
): Grid<V> {
  return new Grid(
    inputs
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const tokens = line.split("");
        return tokens.map((token) => transform(token, tokens, line));
      })
  );
}
