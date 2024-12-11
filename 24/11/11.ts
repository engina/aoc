import { Node } from "../../lib/linked-list";
import fs from "fs";
const input = fs.readFileSync("input.txt", "utf-8");
// const input = `125 17`;

const nodes = input
  .trim()
  .split(" ")
  .map((t) => new Node(t));

nodes.forEach((n, i) => {
  if (i === nodes.length - 1) return;
  n.next = nodes[i + 1];
});

type Rule = {
  applies: (n: Node<string>) => boolean;
  transform: (n: Node<string>) => void;
};

const rules: Rule[] = [
  {
    applies: (n) => n.value === "0",
    transform: (n) => {
      n.value = "1";
    },
  },
  {
    applies: (n) => n.value.length % 2 === 0,
    transform: (n) => {
      const left = n.value.slice(0, n.value.length / 2);
      const right = parseInt(n.value.slice(n.value.length / 2), 10);
      n.value = left;
      n.next = new Node(right.toString(), n.next);
    },
  },
  {
    applies: (n) => true,
    transform: (n) => {
      n.value = (parseInt(n.value, 10) * 2024).toString();
    },
  },
];

console.log(
  nodes[0]
    .toArray()
    .map((n) => n.value)
    .join(" -> ")
);

for (let i = 0; i < 25; i++) {
  nodes[0].toArray().forEach((n) => {
    rules.find((r) => r.applies(n))?.transform(n);
  });
}

console.log(nodes[0].toArray().length);
