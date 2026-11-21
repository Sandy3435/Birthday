import { appreciationItems } from '../data/appreciations';

export const CARD_OFFSET: [number, number, number] = [0, -2.15, 0];

export const balloonPositions: [number, number, number][] = appreciationItems.map(
  (it) => [it.position.x, it.position.y, it.position.z]
);

export const cardPositions: [number, number, number][] = appreciationItems.map((it) => [
  it.position.x + CARD_OFFSET[0],
  it.position.y + CARD_OFFSET[1],
  it.position.z + CARD_OFFSET[2],
]);

export function sub(a: [number, number, number], b: [number, number, number]): [number, number, number] {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

// scroll camera range
export const CAMERA_START_Y = 8.5;
export const CAMERA_END_Y = -30;
export const SCROLL_PAGES = 14;