import { Line } from '@react-three/drei';

interface Props {
  points: [number, number, number][];
}

export default function BalloonString({ points }: Props) {
  return (
    <Line
      points={points}
      color="#D8D5D0"
      lineWidth={1.1}
      transparent
      opacity={0.85}
    />
  );
}