import fs from "fs";
import assert from "assert";

const input = fs.readFileSync("input.txt", "utf8").trim();

// const input = `2333133121414131402`;

class Node<T> {
  constructor(
    public payload: T,
    public prev: Node<T> | null = null,
    public next: Node<T> | null = null
  ) {}

  remove() {
    if (this.prev) {
      this.prev.next = this.next;
    }
    if (this.next) {
      this.next.prev = this.prev;
    }
  }

  insertAfter(node: Node<T>) {
    if (node.prev) {
      node.prev.next = node.next;
    }
    if (node.next) {
      node.next.prev = node.prev;
    }
    node.next = this.next;
    node.prev = this;
    this.next = node;
    return node;
  }

  insertBefore(node: Node<T>) {
    if (node.prev) {
      node.prev.next = node.next;
    }
    if (node.next) {
      node.next.prev = node.prev;
    }

    node.prev = this.prev;
    node.next = this;

    if (this.prev) this.prev.next = node;
    this.prev = node;
    return node;
  }

  walk(cb: (a: Node<T>) => void, direction: "forward" | "reverse" = "forward") {
    let current: Node<T> | null = this;
    while (current) {
      cb(current);
      current = direction === "forward" ? current.next : current.prev;
    }
  }
}

class List<T> {
  constructor(public head: Node<T> | null, public tail: Node<T> | null) {}

  forEach(
    cb: (a: Node<T>) => void,
    direction: "forward" | "reverse" = "forward"
  ) {
    if (direction === "forward") {
      let current: Node<T> | null = this.head;
      while (current) {
        cb(current);
        current = current.next;
      }
    } else {
      let current: Node<T> | null = this.tail;
      while (current) {
        cb(current);
        current = current.prev;
      }
    }
  }

  insertAfter(node: Node<T>, after: Node<T>) {
    if (node === this.tail) {
      this.tail = node;
    }
    after.insertAfter(node);
  }

  insertBefore(node: Node<T>, before: Node<T>) {
    if (node === this.head) {
      console.log("setting head to", node.payload);
      this.head = node;
    }
    before.insertBefore(node);
  }

  remove(node: Node<T>) {
    if (node === this.head) {
      this.head = node.next;
    }
    if (node === this.tail) {
      this.tail = node.prev;
    }
    node.remove();
  }

  find(cb: (a: T) => boolean, before?: Node<T>): Node<T> | null {
    let current: Node<T> | null = this.head;
    while (current && current !== before) {
      if (cb(current.payload)) {
        return current;
      }
      current = current.next;
    }
    return null;
  }
}

type BlockBase = {
  type: string;
  length: number;
};

type FileBlock = BlockBase & {
  type: "file";
  id: number;
};

type SpaceBlock = BlockBase & {
  type: "space";
};

type Block = FileBlock | SpaceBlock;

function layout(input: string): List<Block> {
  let id = 0;
  let length = parseInt(input[0], 10);

  const head: Node<Block> = new Node({
    type: "file",
    id: id++,
    length,
  });

  // start from space state because first file is already created
  let state: "file" | "space" = "space";

  let prev = head;

  for (let i = 1; i < input.length; i++) {
    length = parseInt(input[i], 10);

    if (state === "file") {
      prev = prev.insertAfter(
        new Node({
          type: "file",
          id,
          length,
        })
      );
      id++;
    } else {
      if (length > 0)
        prev = prev.insertAfter(
          new Node({
            type: "space",
            length,
          })
        );
    }
    state = state === "file" ? "space" : "file";
  }

  return new List(head, prev);
}

function blockListToString(blockList: List<Block>) {
  let result = "";
  blockList.forEach((b) => {
    const length = b.payload.length;
    if (b.payload.type === "file") {
      result += b.payload.id.toString().repeat(length);
    } else {
      result += ".".repeat(length);
    }
  });
  return result;
}

function printBlockList(blockList: List<Block>) {
  console.log(blockListToString(blockList));
}

// mutates the list
function defrag(blockList: List<Block>): List<Block> {
  const fileBlocks: Node<FileBlock>[] = [];

  blockList.forEach((b) => {
    if (b.payload.type !== "file") return;
    fileBlocks.push(b as Node<FileBlock>);
  }, "reverse");

  for (const fileBlock of fileBlocks) {
    const freeBlock = blockList.find(
      (b) => b.type === "space" && b.length >= fileBlock.payload.length,
      fileBlock
    );

    if (!freeBlock) {
      continue;
    }
    const remaining = freeBlock.payload.length - fileBlock.payload.length;

    fileBlock.insertAfter(
      new Node({ type: "space", length: fileBlock.payload.length } as any)
    );
    blockList.insertBefore(fileBlock, freeBlock);
    if (remaining > 0) {
      freeBlock.payload.length = remaining;
    } else {
      freeBlock.remove();
    }
  }

  return blockList;
}

function checksumList(blockList: List<Block>) {
  let offset = 0;
  let sum = 0;
  blockList.forEach((b) => {
    if (b.payload.type === "file") {
      const idStr = b.payload.id.toString();
      for (let i = 0; i < b.payload.length; i++) {
        sum += b.payload.id * offset;
        offset++;
      }
    } else offset += b.payload.length;
  });
  return sum;
}

import { bench } from "../../lib";

let l = bench(() => layout(input), "layoutting");
const d = bench(() => defrag(l), "defragging");
const c = bench(() => checksumList(d), "checksumming");

console.log(c);
