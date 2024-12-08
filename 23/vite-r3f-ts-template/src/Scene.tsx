import { Line, OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import { Perf } from 'r3f-perf';
import { createRef, RefObject, useRef } from 'react';
import { BoxGeometry, Mesh, MeshBasicMaterial, Vector3 } from 'three';
import { Cube } from './components/Cube';
import { Plane } from './components/Plane';
import { Sphere } from './components/Sphere';
// import { Physics, useBox } from '@react-three/cannon';
import { Line2, LineSegments2 } from 'three-stdlib';

import { SampleParsedData } from '../../25/sample-data';
import React from 'react';
import {
  Physics,
  RapierRigidBody,
  RigidBody,
  useImpulseJoint,
  useRopeJoint,
  useSphericalJoint,
  useSpringJoint,
} from '@react-three/rapier';
import { RawJointType } from '@dimforge/rapier3d-compat/rapier_wasm3d';

const forceSum = new Vector3();

class Particle {
  public readonly connections = new Set<Spring>();
  constructor(public readonly id: string, public pos: Vector3 = new Vector3()) {}
}

class Spring {
  private v0 = new Vector3();
  constructor(public a: Particle, public b: Particle, public length: number) {
    a.connections.add(this);
    b.connections.add(this);
  }

  force() {
    const diff = this.v0.subVectors(this.a.pos, this.b.pos);
    const length = diff.length();
    const force = diff.multiplyScalar(0.1 * (length - this.length));
    return force;
  }

  destroy() {
    this.a.connections.delete(this);
    this.b.connections.delete(this);
  }

  toString() {
    return `${this.a.id}-${this.b.id}`;
  }
}
const RopeJoint = ({
  a,
  b,
  conn,
}: {
  a: RefObject<RapierRigidBody>;
  b: RefObject<RapierRigidBody>;
  conn: Line2 | LineSegments2;
}) => {
  // useSphericalJoint(a, b, [
  //   [-0.5, 0, 0],
  //   [0.5, 0, 0],
  // ]);
  const mass = 1;
  const springRestLength = 0;
  const stiffness = 1.0e3;
  const criticalDamping = 10000; //2.0 * Math.sqrt(stiffness * mass);
  const joint = useSpringJoint(a, b, [
    [0, 0, 0],
    [0, 0, 0],
    springRestLength,
    stiffness,
    criticalDamping,
  ]);

  console.log({ conn });

  return null;
};

function Scene() {
  const [example, setExample] = React.useState(2);

  const { particles, springs } = React.useMemo(() => {
    const data = SampleParsedData[example];
    const particles: Record<string, Particle> = {};

    Object.values(data.nodeDict).forEach((node) => {
      particles[node.id] = new Particle(
        node.id,
        new Vector3().random().multiplyScalar(2)
      );
    });

    const springs = Object.values(data.connDict).map((conn) => {
      const a = particles[conn.a.id];
      const b = particles[conn.b.id];
      if (!a || !b) {
        throw new Error('Missing particle');
      }
      return new Spring(a, b, 1);
    });
    return {
      particles: Object.values(particles),
      springs,
    };
  }, [example]);

  const { performance } = useControls('Monitoring', {
    performance: false,
  });

  const { animate } = useControls('Cube', {
    animate: true,
  });

  const cubeRef = useRef<Mesh<BoxGeometry, MeshBasicMaterial>>(null);

  const [counter, setCounter] = React.useState(0);

  useFrame((_, delta) => {
    particles.forEach((p) => {
      forceSum.set(0, 0, 0);
      p.connections.forEach((s) => {
        forceSum.add(s.force());
      });
      forceSum.multiplyScalar(0.1);
      p.pos.add(forceSum);
      // particleMeshRefs.current[p.id].position.copy(p.pos);
    });
    // setCounter((c) => c + 1);
  });

  const particleMeshRefs = useRef(
    Array.from({ length: particles.length }).map(() => createRef<RapierRigidBody>())
  );
  const springMeshRefs = useRef(Array.from({ length: springs.length }).map(() => createRef<Line2 | LineSegments2>());
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

      <Physics gravity={[0, 0, 0]}>
        {particleMeshRefs.current.map((ref, i) => {
          return (
            <RigidBody ref={ref}>
              <Cube key={i} position={particles[i].pos} />
            </RigidBody>
          );
        })}
        {springMeshRefs.current.map((ref, i) => {
          return (
            <>
            <Line
              points={[new Vector3(), new Vector3()]}
              ref={ref}
            />
            <RopeJoint
              key={i}
              a={particleMeshRefs.current[particles.findIndex((p) => p === ref.current.)]}
              b={particleMeshRefs.current[particles.findIndex((p) => p === s.b)]}
              conn={springMeshRefs.current[i]}
            /></>
          );
        })}
        {/* {springs.map((s, i) => {
          return (
            <>
              <Line
                points={[s.a.pos, s.b.pos]}
                ref={(ref) => {
                  if (!ref) return;
                  springMeshRefs.current[i] = ref;
                }}
              />
              <RopeJoint
                key={i}
                a={particleMeshRefs.current[particles.findIndex((p) => p === s.a)]}
                b={particleMeshRefs.current[particles.findIndex((p) => p === s.b)]}
                conn={springMeshRefs.current[i]}
              />
            </>
          );
        })} */}
      </Physics>
    </>
  );
}

export { Scene };
