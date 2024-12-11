import { Node } from "../../lib/linked-list";
import { bench } from "../../lib";

import fs from "fs";
// const input = fs.readFileSync("input.txt", "utf-8");
const input = `125 17`;

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
  transform: (n: Node<string>) => Node<string> | undefined;
};

const rules: Rule[] = [
  {
    applies: (n) => n.value === "0",
    transform: (n) => {
      n.value = "1";
      return n;
    },
  },
  {
    applies: (n) => n.value.length % 2 === 0,
    transform: (n) => {
      const left = n.value.slice(0, n.value.length / 2);
      const right = parseInt(n.value.slice(n.value.length / 2), 10).toString();
      console.log(
        "splitting",
        n.value,
        "into",
        left,
        right,
        "next",
        n.next?.value
      );
      const nn = n.next;
      n.value = left;
      n.next = new Node(right, n.next);
      return n.next;
    },
  },
  {
    applies: (n) => true,
    transform: (n) => {
      n.value = (parseInt(n.value, 10) * 2024).toString();
      return n.next;
    },
  },
];

function nodesPrint(node: Node<string>) {
  let result = node.value;
  node.next?.walk((n) => {
    result += " -> " + n.value;
    return n.next;
  });
  console.log(result);
}

let j = 0;
bench(() => {
  for (let i = 0; i < 6; i++) {
    console.log("iter", i);
    nodes[0].walk((n) => {
      console.log("  walking", n.value, "then", n.next?.value);
      const next = rules.find((r) => r.applies(n))?.transform(n);
      console.log(
        "    new value",
        n.value,
        "next",
        next?.value,
        "next next",
        next?.next?.value
      );
      // if (j++ > 20) process.exit(0);
      return next;
    });
    nodesPrint(nodes[0]);
  }
}, "walk");
