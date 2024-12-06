import { forwardRef } from 'react';
import { Mesh, BoxGeometry, MeshBasicMaterial } from 'three';
import { Physics, useBox } from '@react-three/cannon';
import { Node } from '../Scene';

type CubeType = Mesh<BoxGeometry, MeshBasicMaterial>;

export type CubeProps = {
  node: Node;
};

const Cube = forwardRef<CubeType, CubeProps>((props, fwref) => {
  const { node } = props;
  const [ref, api] = useBox(() => ({ mass: 1, position: node.pos.toArray() }), fwref);
  return (
    <mesh ref={ref} position-x={2} castShadow>
      <boxGeometry args={[0.1, 0.1, 0.1]} />
      <meshStandardMaterial color={'mediumpurple'} />
    </mesh>
  );
});

export { Cube };
