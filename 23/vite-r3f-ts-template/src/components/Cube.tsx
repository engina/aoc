import { forwardRef } from 'react';
import { Mesh, BoxGeometry, MeshBasicMaterial, Vector3 } from 'three';
import { Physics, useBox } from '@react-three/cannon';
import { Node } from '../../../25/lib';

type CubeType = Mesh<BoxGeometry, MeshBasicMaterial>;

export type NodeUI = Node & { pos: Vector3 };

export type CubeProps = {
  position: Vector3;
};

const Cube = forwardRef<CubeType, CubeProps>((props, fwref) => {
  const { position } = props;
  // const [ref, api] = useBox(() => ({ mass: 1, position: node.pos.toArray() }), fwref);
  return (
    <mesh position={position} castShadow>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshStandardMaterial color={'yellow'} />
    </mesh>
  );
});

export { Cube };
