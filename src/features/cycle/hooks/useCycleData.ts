import { useState, useEffect, useCallback, useMemo } from 'react';
import { FloData, CyclePhase, FloPredictions } from '../../../types';
import { storageGet, storageSet, STORAGE_KEYS } from '../../../lib/storage';
import { floPlaceholderData } from '../data/floPlaceholder';
// Private user data lives in data/ (gitignored). When present it takes priority over
// the generic placeholder. Others cloning the repo should create data/floData.ts.
import { floUserData } from '../../../../data/floData';

const DEFAULT_DATA: FloData = floUserData ?? floPlaceholderData;
import {
  getMostRecentCycle,
  getAverageCycleLength,
  getCurrentCycleDay,
  getPhaseForDay,
} from '../utils/cycleCalculations';
import { computePredictions } from '../utils/cyclePredictions';
import { format } from 'date-fns';

export interface CycleState {
  cycleDay: number;
  phase: CyclePhase;
  cycleLength: number;
  periodLength: number;
  lastPeriodStart: string;
  cycles: FloData['cycles'];
  predictions: FloPredictions | null;
  computedPredictions: (FloPredictions & { confidence: number }) | null;
  isLoading: boolean;
  refreshCycle: () => void;
  savePredictions: (p: FloPredictions) => Promise<void>;
  clearManualPredictions: () => Promise<void>;
  confirmPeriodStart: (date: string) => Promise<void>;
}

export function useCycleData(): CycleState {
  const [floData, setFloData] = useState<FloData>(DEFAULT_DATA);
  const [manualPredictions, setManualPredictions] = useState<FloPredictions | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const stored = await storageGet<FloData>(STORAGE_KEYS.FLO_DATA);
      if (stored?.cycles?.length) setFloData(stored);
      const storedPreds = await storageGet<FloPredictions>(STORAGE_KEYS.FLO_PREDICTIONS);
      if (storedPreds && !storedPreds.isComputed) setManualPredictions(storedPreds);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const savePredictions = useCallback(async (p: FloPredictions) => {
    const manual = { ...p, isComputed: false };
    setManualPredictions(manual);
    await storageSet(STORAGE_KEYS.FLO_PREDICTIONS, manual);
  }, []);

  const clearManualPredictions = useCallback(async () => {
    setManualPredictions(null);
    await storageSet(STORAGE_KEYS.FLO_PREDICTIONS, null);
  }, []);

  const confirmPeriodStart = useCallback(async (date: string) => {
    const avgLength = getAverageCycleLength(floData.cycles);
    const lastPeriodLen = getMostRecentCycle(floData.cycles)?.period_length ?? 5;
    const newCycle: import('../../../types').Cycle = {
      start_date: date,
      end_date: date,
      cycle_length: avgLength,
      period_length: lastPeriodLen,
    };
    const updated: FloData = { cycles: [...floData.cycles, newCycle] };
    setFloData(updated);
    await storageSet(STORAGE_KEYS.FLO_DATA, updated);
  }, [floData]);

  const computedPredictions = useMemo(
    () => computePredictions(floData.cycles),
    [floData.cycles],
  );

  const mostRecent = getMostRecentCycle(floData.cycles);
  const cycleLength = getAverageCycleLength(floData.cycles);
  const lastPeriodStart = mostRecent?.start_date ?? format(new Date(), 'yyyy-MM-dd');
  const cycleDay = getCurrentCycleDay(lastPeriodStart);
  const phase = getPhaseForDay(Math.min(cycleDay, cycleLength), cycleLength);

  // Manual predictions take precedence; fall back to computed
  const predictions = manualPredictions ?? computedPredictions;

  return {
    cycleDay: Math.min(cycleDay, cycleLength),
    phase,
    cycleLength,
    periodLength: mostRecent?.period_length ?? 5,
    lastPeriodStart,
    cycles: floData.cycles,
    predictions,
    computedPredictions,
    isLoading,
    refreshCycle: loadData,
    savePredictions,
    clearManualPredictions,
    confirmPeriodStart,
  };
}
