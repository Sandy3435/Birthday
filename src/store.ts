import { create } from 'zustand';

interface Store {
  opened: Set<number>;
  open: (id: number) => void;
  flipped: Set<number>;
  toggleFlip: (id: number) => void;
  scroll: number;
  setScroll: (n: number) => void;
}

export const useStore = create<Store>((set) => ({
  opened: new Set(),
  open: (id) =>
    set((s) => {
      const next = new Set(s.opened);
      next.add(id);
      return { opened: next };
    }),
  flipped: new Set(),
  toggleFlip: (id) =>
    set((s) => {
      const next = new Set(s.flipped);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { flipped: next };
    }),
  scroll: 0,
  setScroll: (n) => set({ scroll: n }),
}));
