import { Connection, ConnectionDict, NodeDict } from "./lib";
import { parseDict } from "../../lib/parse";

export type ParseResult = {
  connDict: ConnectionDict;
  nodeDict: NodeDict;
};
export function parse(inputs: string): ParseResult {
  const parsed = parseDict(inputs);

  const connDict: ConnectionDict = {};
  const nodeDict: NodeDict = {};

  parsed.forEach(([id, nextIds]) => {
    nextIds.forEach((nextId) => {
      Connection.create(id, nextId, connDict, nodeDict);
    });
  });
  return { connDict, nodeDict };
}
