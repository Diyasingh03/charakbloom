// ─── Cycle & Phases ────────────────────────────────────────────────────────
export type CyclePhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

export interface CycleDay {
  date: string;
  cycleDay: number;
  phase: CyclePhase;
}

export interface Cycle {
  start_date: string;
  end_date: string;
  cycle_length: number;
  period_length: number;
  ovulation?: string;
}

export interface FloData {
  cycles: Cycle[];
}

export interface FloPredictions {
  ovulationDate: string;
  nextCycleStart: string;
  lastUpdated: string;
  confidence?: number;
  isComputed?: boolean;
}

// ─── Meals ─────────────────────────────────────────────────────────────────
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Meal {
  id: string;
  name: string;
  type: MealType;
  phases: CyclePhase[];
  ingredients: string[];
  pcosNote: string;
  prepTime: number;
  glycemicLoad: 'low' | 'medium';
  imageEmoji: string;
  emoji: string;
  cookMethod: 'stovetop' | 'microwave' | 'no-cook';
}

// ─── Workouts ──────────────────────────────────────────────────────────────
export type WorkoutIntensity = 'gentle' | 'moderate' | 'high' | 'peak';

export interface WorkoutStep {
  order: number;
  instruction: string;
  duration: string;
}

export interface Workout {
  id: string;
  name: string;
  phase: CyclePhase;
  intensity: WorkoutIntensity;
  durationMinutes: number;
  type: string;
  description: string;
  steps: WorkoutStep[];
  benefits: string;
  imageEmoji: string;
  emoji: string;
  equipment: string[];
}

// ─── Symptoms ──────────────────────────────────────────────────────────────
export type SymptomKey =
  | 'bloating'
  | 'fatigue'
  | 'acne'
  | 'mood'
  | 'hairChanges'
  | 'cravings'
  | 'cramps'
  | 'brainFog';

export type PeriodFlow = 'spotting' | 'light' | 'medium' | 'heavy';

export interface SymptomLog {
  id: string;
  date: string;
  cycleDay: number;
  phase: CyclePhase;
  periodFlow?: PeriodFlow;
  symptoms: Partial<Record<SymptomKey, number>>;
  notes?: string;
}

// ─── Grocery List ──────────────────────────────────────────────────────────
export type GroceryCategory = 'produce' | 'protein' | 'dairy' | 'pantry' | 'other';

export interface GroceryItem {
  id: string;
  name: string;
  category: GroceryCategory;
  quantity?: string;
  inStock: boolean;
  addedAt: string;
}

// ─── AI Content ────────────────────────────────────────────────────────────
export interface AIMeal {
  name: string;
  ingredients: string[];
  pcosNote: string;
  prepTime: number;
  emoji: string;
}

export interface AIWorkout {
  name: string;
  type: string;
  durationMinutes: number;
  intensity: WorkoutIntensity;
  equipment: string[];
  steps: WorkoutStep[];
  benefits: string;
  emoji: string;
}

export interface DailyAIContent {
  date: string;
  insight: string;
  motivationalMessage: string;
  phaseTip: string;
  workout: AIWorkout;
  meals: {
    breakfast: AIMeal;
    lunch: AIMeal;
    dinner: AIMeal;
    snack: AIMeal;
  };
}

// ─── User Constraints ──────────────────────────────────────────────────────
export interface UserConstraints {
  cookingAppliances: {
    stovetop: boolean;
    microwave: boolean;
    oven: boolean;
    airFryer: boolean;
  };
  equipment: string[];
  dietaryNotes: string;
}

// ─── UI Helpers ────────────────────────────────────────────────────────────
export interface PhaseTheme {
  primary: string;
  secondary: string;
  gradient: [string, string];
  label: string;
  emoji: string;
  insight: string;
}
