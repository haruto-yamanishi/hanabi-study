import { create } from 'zustand';

export type Screen = 'home' | 'today' | 'diagnostic' | 'vocabulary' | 'progress';
export const useUIStore = create<{ screen: Screen; open: (screen: Screen) => void }>(set => ({ screen: 'home', open: screen => set({ screen }) }));
