import { Line, OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { button, useControls } from 'leva';
import { Perf } from 'r3f-perf';
import { createRef, RefObject, useRef } from 'react';
import { BoxGeometry, Mesh, MeshBasicMaterial, Vector3 } from 'three';
import { Cube, CubeType } from './components/Cube';
import { Plane } from './components/Plane';
import { Sphere } from './components/Sphere';
// import { Physics, useBox } from '@react-three/cannon';
import { Line2, LineGeometry, LineSegments2 } from 'three-stdlib';
import * as Cannon from 'cannon-es';
import * as THREE from 'three';

import { SampleParsedData } from '../../25/sample-data';
import { combinations } from '../../../lib';
import React from 'react';
import { Connection } from '../../25/lib';
import { PhysicsMessage, PhysicsResponse } from './physics.worker';
import { error } from 'console';

const physicsWorker = new Worker(new URL('./physics.worker.ts?worker', import.meta.url), {
  type: 'module',
});

const requests = new Map<
  number,
  [(r: PhysicsResponse) => void, (r: PhysicsResponse) => void]
>();

physicsWorker.onmessage = (e: MessageEvent) => {
  const msg = e.data as PhysicsResponse;
  // console.log('worker message', msg);
  const p = requests.get(msg.id);
  if (!p) {
    console.error('No request found for', msg);
    return;
  }
  const [resolve, reject] = p;
  if (msg.status === 'ok') {
    resolve(msg);
  } else {
    reject(msg);
  }
  requests.delete(msg.id);
};

let i = 0;
async function sendToWorker(
  msg: Omit<PhysicsMessage, 'id'>,
  timeout = 1000
): Promise<PhysicsResponse> {
  const m = { ...msg } as PhysicsMessage;
  m.id = i++;
  const p = new Promise<PhysicsResponse>((resolve, reject) => {
    requests.set(m.id, [resolve, reject]);
    setTimeout(() => {
      requests.delete(m.id);
      reject({
        error: 'timeout',
        msg,
      });
    }, timeout);
    physicsWorker.postMessage(m);
  });
  return p;
}

function Scene() {
  const [example, setExample] = React.useState(0);

  const REST_LEN_START = 10;
  const INITIAL_RANDOM = 1000;
  const { animate, force, stiffness, damping, restLength } = useControls('Cube', {
    animate: true,
    force: 800,
    damping: 0.6,
    stiffness: 0.1,
    restLength: REST_LEN_START,
    // shuffler: button(() => {
    //   sim.world.bodies.forEach((b) => {
    //     b.position.set(
    //       Math.random() * INITIAL_RANDOM - INITIAL_RANDOM / 2,
    //       Math.random() * INITIAL_RANDOM - INITIAL_RANDOM / 2,
    //       Math.random() * INITIAL_RANDOM - INITIAL_RANDOM / 2
    //     );
    //   });
    // }),
    step: button(() => {
      sendToWorker({
        type: 'step',
      })
        .then((res) => {
          if (res.type !== 'positions') return;
          console.log('positions', res.positions);

          const { positions } = res;
          positions.forEach((pos, i) => {
            const cubeRef = particleMeshRefs.current[i].current;
            if (!cubeRef) {
              console.log('no ref1', particleMeshRefs.current, i);
              return;
            }
            cubeRef.position.set(pos.x, pos.y, pos.z);
          });
        })
        .catch(console.error);
    }),
  });

  const sim = React.useMemo(() => {
    const config = {
      force: 12,
      stiffness: 1,
    };
    const world = new Cannon.World({
      // gravity: new Cannon.Vec3(0, -9.82, 0),
    });
    const data = SampleParsedData[example];
    sendToWorker({
      type: 'init',
      data,
    } as PhysicsMessage)
      .then(console.log)
      .catch(console.error);

    const nodes = Object.values(data.nodeDict);
    const rowWidth = Math.floor(Math.sqrt(nodes.length));
    const nodeBodies = nodes.map((node, i) => {
      const row = Math.floor(i / rowWidth);
      const col = i % rowWidth;
      const space = 2;
      const pos = new Vector3(row * space, col * space, Math.random() * 5 - 2.5);
      console.log(node.id, 'row', row, 'col', col, pos);
      const body = new Cannon.Body({
        mass: i === 0 ? 1 : 1,
        shape: new Cannon.Sphere(0.2),
        position: new Cannon.Vec3(pos.x, pos.y, pos.z),
      });
      body.linearDamping = 0.6;
      body.angularDamping = 0.6;
      world.addBody(body);
      return { body, node };
    });

    const connections = Object.values(data.connDict);
    const springs = connections.map((connection) => {
      const a = nodeBodies.find((nb) => nb.node.id === connection.a.id);
      const b = nodeBodies.find((nb) => nb.node.id === connection.b.id);
      if (!a || !b) throw new Error('Node not found');

      const spring = new Cannon.Spring(a.body, b.body, {
        restLength: 1,
        stiffness: config.stiffness,
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

        if (distance > 0) {
          const forceMagnitude = config.force / (distance * distance); // Inverse-square law
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
            .scale(config.force);
          a.applyForce(force, a.position);
          b.applyForce(force.negate(), b.position);
        }
      }
    });

    return { world, nodeBodies, connections, nodes, springs, config };
  }, [example]);

  const { performance } = useControls('Monitoring', {
    performance: false,
  });

  React.useEffect(() => {
    sim.config.force = force;
    sim.springs.forEach((s) => {
      s.spring.stiffness = stiffness;
      s.spring.damping = damping;
      s.spring.restLength = restLength;
    });
  }, [sim, force, stiffness, damping, restLength]);

  let iter = 0;
  useFrame((_, delta) => {
    // sim.world.fixedStep(1 / 60, delta);
    // sendToWorker({
    //   type: 'step',
    // })
    //   .then((res) => {
    //     if (res.type !== 'positions') return;
    //     const { positions } = res;
    //     positions.forEach((pos, i) => {
    //       const cubeRef = particleMeshRefs.current[i].current;
    //       if (!cubeRef) {
    //         console.log('no ref1', particleMeshRefs.current, i);
    //         return;
    //       }
    //       cubeRef.position.set(pos.x, pos.y, pos.z);
    //     });
    //   })
    //   .catch(console.error);
    // sim.world.fixedStep();
    // sim.nodeBodies.forEach((nb, i) => {
    //   const { body, node } = nb;
    //   const cubeRef = particleMeshRefs.current[i].current;
    //   if (!cubeRef) {
    //     console.log('no ref1', particleMeshRefs.current, i);
    //     return;
    //   }
    //   cubeRef.position.copy(body.position);
    // });
    // let connectionTensions: [number, Connection][] = [];
    // sim.springs.forEach((s, i) => {
    //   const lineRef = springMeshRefs.current[i].current;
    //   if (!lineRef) {
    //     // console.log('no ref2');
    //     return;
    //   }
    //   const { bodyA, bodyB } = s.spring;
    //   const a = bodyA.position;
    //   const b = bodyB.position;
    //   const len = a.distanceTo(b);
    //   connectionTensions.push([len, s.connection]);
    //   if (!a || !b) return;
    //   lineRef.geometry.setPositions([a.x, a.y, a.z, b.x, b.y, b.z]);
    //   lineRef.material.linewidth = 100 / len;
    //   // make it redder as line gets longer
    //   lineRef.material.color = new THREE.Color((len * 10) / restLength, 0, 0);
    // });
    // const correctAnswers = ['hfx-pzl', 'bvb-cmg', 'jqt-nvd'];
    // if (iter++ % 100 === 0) {
    //   const top = connectionTensions.sort((a, b) => b[0] - a[0]).slice(0, 10);
    //   top.forEach(([len, conn], i) => {
    //     console.log(i, len, conn.toString());
    //   });
    //   const found = correctAnswers.every((ca) =>
    //     top.find(([_, conn]) => conn.toString() === ca)
    //   );
    //   if (found) {
    //     console.log('FOUND');
    //   }
    //   console.log('---');
    // }
    // _.gl.render(_.scene, _.camera);
  });

  const particleMeshRefs = useRef(
    Array.from({ length: sim.nodes.length }).map(() => createRef<CubeType>())
  );
  const springMeshRefs = useRef(
    Array.from({ length: sim.connections.length }).map(() =>
      createRef<Line2 | LineSegments2>()
    )
  );

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

      {particleMeshRefs.current.map((ref, i) => {
        return (
          <Cube key={i} position={new Vector3().random().multiplyScalar(4)} ref={ref} />
        );
      })}
      {springMeshRefs.current.map((ref, i) => {
        // return null;
        return (
          <Line
            key={i}
            ref={ref}
            points={[
              [0, 0, 0],
              [0, 0, 1],
            ]}
            color='white' // Default
          />
        );
      })}
    </>
  );
}

export { Scene };
