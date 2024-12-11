import {
  Cloud,
  Clouds,
  Line,
  OrbitControls,
  Point,
  Points,
  PositionPoint,
} from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { button, useControls } from 'leva';
import { Perf } from 'r3f-perf';
import { createRef, RefObject, useRef } from 'react';
import { BoxGeometry, Mesh, MeshBasicMaterial, Vector3 } from 'three';
import { Cube, CubeType } from './components/Cube';
import { Line2, LineGeometry, LineSegments2 } from 'three-stdlib';
import * as THREE from 'three';

import { SampleParsedData, SampleInputs } from '../../25/sample-data';
import { bench, combinations } from '../../../lib';
import { Config, PhysicalMinCut } from '../../25/mincut/main';
import React from 'react';

function Scene() {
  const [example, setExample] = React.useState(0);

  const REST_LEN_START = 10;
  const INITIAL_RANDOM = 1000;
  const controls = useControls('Cube', {
    animate: true,
    force: 1,
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
    step: button(() => {}),
  });

  React.useEffect(() => {
    console.log('controls', controls);
  }, [controls]);

  const config: Config<{
    networks: Record<string, number>;
    mul: number;
  }> = React.useMemo(
    () => ({
      maxIter: 1000,
      skipVerificationFor: 20,
      verifyCB: (networks) => {
        const sizes = Object.values(networks);
        if (sizes.length !== 2) return false;
        return {
          networks,
          mul: sizes.reduce((acc, s) => acc * s, 1),
        };
      },
      edges: 3,
      force: 10,
      stiffness: 0.1,
      restLength: 10,
    }),
    []
  );

  const sim2 = React.useMemo(() => {
    const sim = PhysicalMinCut(SampleInputs[example]);
    return sim;

    // const data = SampleParsedData[example];
    // const nodes = Object.values(data.nodeDict).map((n) => ({
    //   ...n,
    //   pos: new Vector3().random().multiplyScalar(1),
    //   force: new Vector3(),
    // }));

    // const conns = Object.values(data.connDict).map((c) => {
    //   const a = nodes.find((n) => n.id === c.a.id);
    //   if (!a) throw new Error(`Node not found ${c.a.id}`);
    //   const b = nodes.find((n) => n.id === c.b.id);
    //   if (!b) throw new Error(`Node not found ${c.b.id}`);
    //   return { ...c, a, b };
    // });

    // // console.log('nodes', nodes);
    // // console.log('conns', conns);

    // const nodeCombosIter = combinations(nodes, 2);
    // const nodeCombos = Array.from(nodeCombosIter);
    // const forceV = new Vector3();
    // function step(dt: number, cfg: typeof config) {
    //   const { force, stiffness, restLength } = cfg;

    //   for (const node of nodeCombos) {
    //     const [a, b] = node;
    //     const distance = a.pos.distanceTo(b.pos);
    //     const repulsiveForce = force / distance ** 2;
    //     forceV.copy(a.pos).sub(b.pos).normalize().multiplyScalar(repulsiveForce);
    //     a.force.add(forceV);
    //     b.force.sub(forceV);
    //   }

    //   for (const conn of conns) {
    //     const { a, b } = conn;
    //     const distance = a.pos.distanceTo(b.pos);
    //     // spring force
    //     // const restLength = 10;
    //     const extension = distance - restLength;
    //     const springForce = stiffness * extension;
    //     forceV.copy(a.pos).sub(b.pos).normalize().multiplyScalar(springForce);
    //     a.force.sub(forceV);
    //     b.force.add(forceV);
    //   }

    //   for (const node of nodes) {
    //     node.pos.add(node.force);
    //     node.force.set(0, 0, 0);
    //   }
    // }
    // return { step: p, nodes, conns };
  }, [example]);

  const { performance } = useControls('Monitoring', {
    performance: true,
  });

  let iter = -1;
  useFrame((_) => {
    bench(() => sim2.step(10, config), 'step', true);
    // const edges = sim2.longestEdges();
    // const verResult = sim2.verify(edges, config.verifyCB);
    // if (verResult) console.log('verResult', verResult);
    // sim2.step(10, config);
    sim2.nodes.forEach((node, i) => {
      const cubeRef = particleMeshRefs.current[i].current;
      if (!cubeRef) {
        console.log('no ref1', particleMeshRefs.current, i);
        return;
      }
      cubeRef.position.set(node.pos.x, node.pos.y, 0);
    });

    sim2.conns.forEach((conn, i) => {
      const lineRef = springMeshRefs.current[i].current;
      if (!lineRef) {
        // console.log('no ref2');
        return;
      }
      const { a, b } = conn;
      lineRef.geometry.setPositions([
        a.pos.x,
        a.pos.y,
        0, //a.pos.z,
        b.pos.x,
        b.pos.y,
        0, //b.pos.z,
      ]);
      const len = a.pos.distanceTo(b.pos);
      // lineRef.visible = len < 1;
      lineRef.material.linewidth = 2; //(config.restLength * 2) / a.pos.distanceTo(b.pos);
    });

    springMeshRefs.current[0].current?.geometry;
    return;
  });

  const particleMeshRefs = useRef(
    Array.from({ length: sim2.nodes.length }).map(() => createRef<PositionPoint>())
  );
  const springMeshRefs = useRef(
    Array.from({ length: sim2.conns.length }).map(() =>
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

      <Points limit={particleMeshRefs.current.length}>
        {particleMeshRefs.current.map((ref, i) => {
          return (
            <Point
              key={i}
              position={new Vector3().random().multiplyScalar(1)}
              size={0.01}
              ref={ref}
            />
          );
        })}
      </Points>
      {/* {particleMeshRefs.current.map((ref, i) => {
        return (
          <Cube key={i} position={new Vector3().random().multiplyScalar(1)} ref={ref} />
        );
      })} */}
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
