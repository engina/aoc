export class Node<T> {
  constructor(public value: T, public prev?: Node<T>, public next?: Node<T>) {}

  append(node: Node<T>) {
    node.prev = this;
    node.next = this.next;
    if (this.next) this.next.prev = node;
    this.next = node;
  }

  prepend(node: Node<T>) {
    node.prev = this.prev;
    node.next = this;
    if (this.prev) this.prev.next = node;
    this.prev = node;
  }
}

function debug(...args: any[]) {
  return;
  console.log(...args);
}

export class LinkedList<T> {
  static fromArray<T>(arr: T[], compare: (a: T, b: T) => number) {
    const list = new LinkedList<T>(undefined, undefined, compare);
    let prev: Node<T> | undefined;
    if (compare) arr.sort(compare);
    for (const value of arr) {
      const node = new Node<T>(value, prev);
      if (prev) prev.next = node;
      list.tail = node;
      if (!list.head) list.head = node;
      prev = node;
    }
    return list;
  }

  constructor(
    public head?: Node<T>,
    public tail?: Node<T>,
    public compare: (a: T, b: T) => number = (a, b) => (a as any) - (b as any)
  ) {}

  remove(value: T) {
    let node = this.head;
    while (node) {
      if (this.compare(node.value, value) === 0) {
        if (node.prev) node.prev.next = node.next;
        if (node.next) node.next.prev = node.prev;
        if (node === this.head) this.head = node.next;
        if (node === this.tail) this.tail = node.prev;
        return node;
      }
      node = node.next;
    }
  }

  shift() {
    if (!this.head) return;
    const oldHead = this.head;
    this.head = oldHead.next;
    if (this.head) this.head.prev = undefined;
    else this.tail = undefined; // Ensure tail is updated if list becomes empty
    debug("shift", oldHead.value);
    return oldHead;
  }

  pop() {
    if (!this.tail) return;
    const node = this.tail;
    this.tail = node.prev;
    if (this.tail) this.tail.next = undefined;
    else this.head = undefined; // Ensure head is updated if list becomes empty
    debug("pop", node.value);
    return node;
  }

  push(value: T) {
    const newTail = new Node(value, this.tail);
    if (this.tail) this.tail.next = newTail;
    else this.head = newTail; // Ensure head is updated if list was empty
    this.tail = newTail;
  }

  pushSorted(value: T) {
    let node = this.head;
    while (node && this.compare(node.value, value) < 0) {
      node = node.next;
    }
    if (node) {
      debug("pushSorted prepending", value, "to", node);
      node.prepend(new Node(value));
      if (node === this.head) this.head = node.prev;
    } else {
      debug("pushSorted push", value);
      this.push(value);
    }
  }
}

const ll = LinkedList.fromArray(
  [10, 30, 20, 50, 90, 70, 60, 80, 40, 100],
  (a, b) => a - b
);
function print(list: LinkedList<number>) {
  let n = list.head;
  let i = 0;
  console.log("---");
  while (n) {
    console.log(`${i++}: ${n.value}`);
    n = n.next;
  }
}

// print(ll);
// ll.pushSorted(11);
// print(ll);
// ll.shift();
// ll.shift();
// print(ll);
// ll.pushSorted(4);
// print(ll);
