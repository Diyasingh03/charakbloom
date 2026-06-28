import { useState, useEffect, useCallback, useRef } from 'react';
import { DailyAIContent, CyclePhase, FloPredictions, GroceryItem, UserConstraints } from '../../types';
import { storageGet, storageSet, storageRemove, STORAGE_KEYS } from '../../lib/storage';
import { generateDailyContent } from '../services/geminiService';

interface GeminiDailyParams {
  phase: CyclePhase;
  cycleDay: number;
  cycleLength: number;
  inStockItems: GroceryItem[];
  predictions?: FloPredictions | null;
  constraints?: UserConstraints;
  ready: boolean;
}

export interface GeminiDailyState {
  dailyContent: DailyAIContent | null;
  isLoading: boolean;
  isRegenerating: boolean;
  isUsingFallback: boolean;
  error: 'rate_limited' | null;
  regenerate: () => Promise<void>;
}

export function useGeminiDaily(params: GeminiDailyParams): GeminiDailyState {
  const [dailyContent, setDailyContent] = useState<DailyAIContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [error, setError] = useState<'rate_limited' | null>(null);

  // Always-current ref so regenerate() sends the latest pantry/constraints
  // even when phase/cycleDay haven't changed (which would normally re-create fetchContent).
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const today = new Date().toISOString().split('T')[0];

  const fetchContent = useCallback(async (force = false) => {
    if (!paramsRef.current.ready) return;
    setIsLoading(true);

    try {
      if (!force) {
        const cached = await storageGet<DailyAIContent>(STORAGE_KEYS.DAILY_AI);
        if (cached?.date === today) {
          setDailyContent(cached);
          setIsUsingFallback(false);
          setIsLoading(false);
          return;
        }
      }

      const result = await generateDailyContent({
        phase: paramsRef.current.phase,
        cycleDay: paramsRef.current.cycleDay,
        cycleLength: paramsRef.current.cycleLength,
        inStockItems: paramsRef.current.inStockItems,
        predictions: paramsRef.current.predictions,
        constraints: paramsRef.current.constraints,
      });

      if (result) {
        await storageSet(STORAGE_KEYS.DAILY_AI, result);
        setDailyContent(result);
        setIsUsingFallback(false);
        setError(null);
      } else {
        setDailyContent(null);
        setIsUsingFallback(true);
        setError(null);
      }
    } catch (e: unknown) {
      setDailyContent(null);
      setIsUsingFallback(true);
      setError(e instanceof Error && e.message === 'rate_limited' ? 'rate_limited' : null);
    } finally {
      setIsLoading(false);
    }
  }, [today]); // paramsRef.current always has latest values; today triggers a new call at midnight

  useEffect(() => {
    fetchContent(false);
  }, [fetchContent, params.ready]);

  const regenerate = async () => {
    setIsRegenerating(true);
    await storageRemove(STORAGE_KEYS.DAILY_AI);
    await fetchContent(true);
    setIsRegenerating(false);
  };

  return { dailyContent, isLoading, isRegenerating, isUsingFallback, error, regenerate };
}
