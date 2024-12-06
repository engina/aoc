import { OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { Perf } from 'r3f-perf';
import { useRef } from 'react';
import { BoxGeometry, Mesh, MeshBasicMaterial, Vector3 } from 'three';
import { Cube } from './components/Cube';
import { Plane } from './components/Plane';
import { Sphere } from './components/Sphere';
import { Physics, useBox } from '@react-three/cannon';

import input from '../../25-input.txt?raw';

export class Connection {
  public static readonly all: Record<string, Connection> = {};
  public static create(a: Node, b: Node) {
    const key = [a.id, b.id].sort().join('-');
    if (!Connection.all[key]) {
      Connection.all[key] = new Connection(a, b);
    }
    return Connection.all[key];
  }

  private constructor(
    public readonly a: Node,
    public readonly b: Node,
    public cut: boolean = false
  ) {}

  public other(node: Node) {
    if (node === this.a) {
      return this.b;
    }
    if (node === this.b) {
      return this.a;
    }
    throw new Error('Node not in connection');
  }

  public isEqual(conn: Connection) {
    return (
      (conn.a === this.a && conn.b === this.b) || (conn.a === this.b && conn.b === this.a)
    );
  }
}

export class Node {
  public static readonly all: Record<string, Node> = {};
  public static create(id: string, connections?: Set<Connection>) {
    if (Node.all[id] === undefined) {
      Node.all[id] = new Node(id, connections);
    }
    return Node.all[id];
  }

  public readonly pos: Vector3 = new Vector3();

  private constructor(
    public readonly id: string,
    public readonly conns: Set<Connection> = new Set()
  ) {
    const x = Math.random() * 10 - 5;
    const y = Math.random() * 10 - 5;
    const z = Math.random() * 10 - 5;
    this.pos.set(x, y, z);
  }

  // Calculate the repulsive force Vector3 from this node to node to
  private _force: Vector3 = new Vector3();
  public force(to: Node): Vector3 {
    const delta = this._force.copy(this.pos).sub(to.pos);
    const dist = delta.length();
    const force = delta.normalize().multiplyScalar(1 / dist ** 2);
    return force;
  }
}

input
  .split('\n')
  .filter((i) => !!i)
  .map((line) => {
    const [_id, ...nextIds] = line.split(' ');
    let id = _id.slice(0, 3);

    const node = Node.create(id);

    nextIds.forEach((nextId) => {
      const nextNode = Node.create(nextId);
      const newConn = Connection.create(node, nextNode);
      node.conns.add(newConn);
      nextNode.conns.add(newConn);
    });
  });

const forceSum = new Vector3();

function Scene() {
  const { performance } = useControls('Monitoring', {
    performance: false,
  });

  const { animate } = useControls('Cube', {
    animate: true,
  });

  const cubeRef = useRef<Mesh<BoxGeometry, MeshBasicMaterial>>(null);

  useFrame((_, delta) => {
    return;
    // Calculate the repulsive forces
    Object.values(Node.all).forEach((node) => {
      forceSum.set(0, 0, 0);
      Object.values(Node.all).forEach((other) => {
        if (node === other) {
          return;
        }
        forceSum.add(node.force(other));
      });
      node.pos.add(forceSum);
    });
    // update the cube position
  });

  return (
    <>
      {performance && <Perf position='top-left' />}

      <OrbitControls makeDefault />

      <directionalLight
        position={[-2, 2, 3]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024 * 2, 1024 * 2]}
      />
      <ambientLight intensity={0.2} />

      <Physics>
        {Object.values(Node.all).map((node) => {
          return <Cube key={node.id} node={node} />;
        })}
      </Physics>
    </>
  );
}

export { Scene };
