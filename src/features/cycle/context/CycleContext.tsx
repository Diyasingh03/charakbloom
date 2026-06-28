import React, { createContext, useContext, ReactNode } from 'react';
import { useCycleData, CycleState } from '../hooks/useCycleData';

const CycleContext = createContext<CycleState | null>(null);

export function CycleProvider({ children }: { children: ReactNode }) {
  const cycle = useCycleData();
  return <CycleContext.Provider value={cycle}>{children}</CycleContext.Provider>;
}

export function useCycle(): CycleState {
  const ctx = useContext(CycleContext);
  if (!ctx) throw new Error('useCycle must be used within CycleProvider');
  return ctx;
}
