import { create } from 'zustand';

interface Store {
  opened: Set<number>;
  open: (id: number) => void;
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
  scroll: 0,
  setScroll: (n) => set({ scroll: n }),
}));