interface Props {
  size?: number;
  seed?: number;
  onPointerDown?: (e: any) => void;
  onClick?: (e: any) => void;
}

export default function Balloon({ size = 1, onPointerDown, onClick }: Props) {
  const s = size;
  const knotScale = s;

  return (
    <group>
      {/* inflated body */}
      <mesh
        castShadow
        receiveShadow
        scale={[0.92 * s, 1.08 * s, 0.92 * s]}
        onPointerDown={onPointerDown}
        onClick={onClick}
      >
        <sphereGeometry args={[0.46, 48, 48]} />
        <meshPhysicalMaterial
          color="#FFFFFF"
          roughness={0.18}
          metalness={0.02}
          clearcoat={0.85}
          clearcoatRoughness={0.08}
          iridescence={0.25}
          iridescenceIOR={1.3}
          envMapIntensity={1.3}
          transmission={0.04}
          thickness={0.6}
          sheen={0.4}
          sheenColor="#F5F0E8"
        />
      </mesh>

      {/* soft highlight spot */}
      <mesh position={[0.12 * s, 0.32 * s, 0.3 * s]} scale={0.18 * s}>
        <sphereGeometry args={[0.46, 16, 16]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.35} />
      </mesh>

      {/* knot */}
      <mesh position={[0, -0.52 * s, 0]} scale={knotScale}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#F5F0E8" roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.58 * s, 0]} rotation={[Math.PI, 0, 0]} scale={knotScale}>
        <coneGeometry args={[0.06, 0.1, 12]} />
        <meshStandardMaterial color="#F5F0E8" roughness={0.4} />
      </mesh>

      {/* little red bow tied at the knot */}
      <group position={[0, -0.53 * s, 0.05 * s]} scale={s}>
        {/* centre knot */}
        <mesh>
          <sphereGeometry args={[0.028, 12, 12]} />
          <meshStandardMaterial color="#C81E1E" roughness={0.45} />
        </mesh>
        {/* left loop */}
        <mesh position={[-0.048, 0.008, 0]} rotation={[0, 0, 0.5]} scale={[1, 0.52, 0.5]}>
          <sphereGeometry args={[0.05, 14, 14]} />
          <meshStandardMaterial color="#C81E1E" roughness={0.45} />
        </mesh>
        {/* right loop */}
        <mesh position={[0.048, 0.008, 0]} rotation={[0, 0, -0.5]} scale={[1, 0.52, 0.5]}>
          <sphereGeometry args={[0.05, 14, 14]} />
          <meshStandardMaterial color="#C81E1E" roughness={0.45} />
        </mesh>
        {/* left tail */}
        <mesh position={[-0.022, -0.055, 0]} rotation={[0, 0, 0.28]}>
          <coneGeometry args={[0.018, 0.085, 8]} />
          <meshStandardMaterial color="#B91C1C" roughness={0.5} />
        </mesh>
        {/* right tail */}
        <mesh position={[0.022, -0.055, 0]} rotation={[0, 0, -0.28]}>
          <coneGeometry args={[0.018, 0.085, 8]} />
          <meshStandardMaterial color="#B91C1C" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}
