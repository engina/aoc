// physics.worker.ts
import * as Cannon from 'cannon-es';
import { ParseResult } from '../../25/parse';
import { combinations } from '../../../lib';

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

      const connections = Object.values(msg.data.connDict);
      const springs = connections.map((connection) => {
        const a = nodeBodies.find((nb) => nb.node.id === connection.a.id);
        const b = nodeBodies.find((nb) => nb.node.id === connection.b.id);
        if (!a || !b) throw new Error('Node not found');

        const spring = new Cannon.Spring(a.body, b.body, {
          restLength: 1,
          stiffness: 0.1,
          damping: 0.01,
        });
        return { spring, connection };
      });

      world.addEventListener('postStep', () => {
        // return;
        springs.forEach((s) => {
          s.spring.applyForce();
        });

        // calculate repulsive forces between all particles
        // console.log('rep calc');
        for (const comb of combinations(nodeBodies, 2)) {
          const { body: a, node: na } = comb[0];
          const { body: b, node: nb } = comb[1];

          // Calculate the repulsive (magnetic-like) force
          const distanceVec = new Cannon.Vec3();
          b.position.vsub(a.position, distanceVec);
          const distance = distanceVec.length();
          // console.log(
          //   'repulsive',
          //   na.id,
          //   nb.id,
          //   distance,
          //   distanceVec,
          //   a.position,
          //   b.position
          // );

          const FORCE = 10;
          if (distance > 0) {
            const forceMagnitude = FORCE / (distance * distance); // Inverse-square law
            const force = distanceVec.unit().scale(forceMagnitude); // Normalize and scale
            // console.log('force', force);
            a.applyForce(force.negate(), a.position);
            b.applyForce(force, b.position);
          } else {
            // repel with max force on random direction
            const force = new Cannon.Vec3(
              Math.random() - 0.5,
              Math.random() - 0.5,
              Math.random() - 0.5
            )
              .unit()
              .scale(FORCE);
            a.applyForce(force, a.position);
            b.applyForce(force.negate(), b.position);
          }
        }
      });
      self.postMessage({ id: msg.id, type: 'init', status: 'ok' } as PhysicsResponse);
      // Set initial world config
      break;

    case 'step':
      const started = performance.now();
      world.fixedStep(0.1);
      const elapsed = performance.now() - started;
      console.log('Step elapsed', elapsed);
      // Send updated positions back to main thread
      self.postMessage({
        id: msg.id,
        status: 'ok',
        type: 'positions',
        positions: world.bodies.map((body) => body.position),
      } as PhysicsResponse);
      break;
  }
};

// import { World, RigidBodyDesc, SpringImpulseJoint, Vector3 } from '@dimforge/rapier3d';

// function setupSimulation() {
//   // Create the physics world with gravity
//   const gravity = new Vector3(0, -9.81, 0);
//   const world = new World(gravity);

//   // Create the first rigid body
//   const body1Desc = RigidBodyDesc.dynamic().setTranslation(0, 5, 0);
//   const body1 = world.createRigidBody(body1Desc);

//   // Create the second rigid body
//   const body2Desc = RigidBodyDesc.dynamic().setTranslation(2, 5, 0);
//   const body2 = world.createRigidBody(body2Desc);

//   // Add a spring-like joint between body1 and body2
//   const jointParams = new GenericJoint(
//     {
//       x: 0,
//       y: 0,
//       z: 0,
//     }, // Anchor on body1
//     {
//       x: 0,
//       y: 0,
//       z: 0,
//     } // Anchor on body2
//   );

//   // Configure spring-like behavior
//   jointParams.setLinearStiffness(JointAxis.X, 10); // Stiffness along X
//   jointParams.setLinearStiffness(JointAxis.Y, 10); // Stiffness along Y
//   jointParams.setLinearStiffness(JointAxis.Z, 10); // Stiffness along Z
//   jointParams.setLinearDamping(JointAxis.X, 1); // Damping along X
//   jointParams.setLinearDamping(JointAxis.Y, 1); // Damping along Y
//   jointParams.setLinearDamping(JointAxis.Z, 1); // Damping along Z

//   world.createJoint(jointParams, body1, body2);

//   // Simulation loop
//   const simulate = () => {
//     world.step(); // Advances the simulation

//     // Retrieve the positions of the bodies
//     const pos1 = body1.translation();
//     const pos2 = body2.translation();

//     console.log(`Body1: x=${pos1.x}, y=${pos1.y}, z=${pos1.z}`);
//     console.log(`Body2: x=${pos2.x}, y=${pos2.y}, z=${pos2.z}`);

//     // Continue simulation
//     requestAnimationFrame(simulate);
//   };

//   simulate();
// }
