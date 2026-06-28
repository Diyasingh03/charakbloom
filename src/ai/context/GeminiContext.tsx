import React, { createContext, useContext, ReactNode } from 'react';
import { useCycle } from '../../features/cycle/context/CycleContext';
import { useGroceryList } from '../../features/groceries/hooks/useGroceryList';
import { useGeminiDaily, GeminiDailyState } from '../hooks/useGeminiDaily';
import { useConstraints } from '../../hooks/useConstraints';
import { UserConstraints } from '../../types';

interface GeminiContextValue extends GeminiDailyState {
  constraints: UserConstraints;
  saveConstraints: (c: UserConstraints) => Promise<void>;
  resetConstraints: () => Promise<void>;
}

const GeminiContext = createContext<GeminiContextValue | null>(null);

export function GeminiProvider({ children }: { children: ReactNode }) {
  const cycle = useCycle();
  const { inStockItems } = useGroceryList();
  const { constraints, saveConstraints, resetConstraints } = useConstraints();

  const gemini = useGeminiDaily({
    phase: cycle.phase,
    cycleDay: cycle.cycleDay,
    cycleLength: cycle.cycleLength,
    inStockItems,
    predictions: cycle.predictions,
    constraints,
    ready: !cycle.isLoading,
  });

  return (
    <GeminiContext.Provider value={{ ...gemini, constraints, saveConstraints, resetConstraints }}>
      {children}
    </GeminiContext.Provider>
  );
}

export function useGemini(): GeminiContextValue {
  const ctx = useContext(GeminiContext);
  if (!ctx) throw new Error('useGemini must be used within GeminiProvider');
  return ctx;
}
