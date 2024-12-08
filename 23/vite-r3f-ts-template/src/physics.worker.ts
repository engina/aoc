// physics.worker.ts
import * as Cannon from 'cannon-es';
import { ParseResult } from '../../25/parse';

let world: Cannon.World;
let bodies: Cannon.Body[] = [];

export type MessageBase = {
  id: number;
  type: string;
};

export type MessageInit = MessageBase & {
  type: 'init';
  data: ParseResult;
};

export type MessageAddBody = MessageBase & {
  type: 'step';
};

export type PhysicsMessage = MessageInit | MessageAddBody;

export type ResponseBase = MessageBase & {
  status: 'ok' | 'fail';
};

export type InitResponse = ResponseBase & {
  type: 'init';
};

export type PositionResponse = ResponseBase & {
  type: 'positions';
  positions: Cannon.Vec3[];
};

export type PhysicsResponse = PositionResponse | InitResponse;

self.onmessage = (e: MessageEvent) => {
  const msg = e.data as PhysicsMessage;
  switch (msg.type) {
    case 'init':
      console.log('Initializing physics worker', msg.data);
      world = new Cannon.World();
      const nodes = Object.values(msg.data.nodeDict);
      const rowWidth = Math.floor(Math.sqrt(nodes.length));

      const nodeBodies = nodes.map((node, i) => {
        const row = Math.floor(i / rowWidth);
        const col = i % rowWidth;
        const space = 2;
        // const pos = new Vector3(row * space, col * space, Math.random() * 5 - 2.5);
        // console.log(node.id, 'row', row, 'col', col, pos);
        const body = new Cannon.Body({
          mass: i === 0 ? 1 : 1,
          shape: new Cannon.Sphere(0.2),
          position: new Cannon.Vec3(row * space, col * space, Math.random() * 5 - 2.5),
        });
        body.linearDamping = 0.6;
        body.angularDamping = 0.6;
        world.addBody(body);
        return { body, node };
      });

      self.postMessage({ id: msg.id, type: 'init', status: 'ok' } as PhysicsResponse);
      // Set initial world config
      break;

    case 'step':
      world.step(1 / 60);
      // Send updated positions back to main thread
      self.postMessage({
        id: msg.id,
        type: 'positions',
        positions: bodies.map((body) => body.position),
      } as PhysicsResponse);
      break;
  }
};
