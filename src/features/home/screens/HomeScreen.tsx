import React from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { useCycle } from '../../cycle/context/CycleContext';
import { useGemini } from '../../../ai/context/GeminiContext';
import { CyclePhaseCard } from '../../cycle/components/CyclePhaseCard';
import { MealCard } from '../../meals/components/MealCard';
import { WorkoutCard } from '../../workouts/components/WorkoutCard';
import { WorkoutDetailModal } from '../../workouts/components/WorkoutDetailModal';
import { QuickSymptomRow } from '../components/QuickSymptomRow';
import { AIStatusBadge } from '../../../components/AIStatusBadge';
import { PhaseGradient } from '../../../components/PhaseGradient';
import { ConstraintsModal } from '../../../components/ConstraintsModal';
import { meals as staticMeals } from '../../meals/data/meals';
import { workouts as staticWorkouts } from '../../workouts/data/workouts';
import { Colors, Typography, Spacing } from '../../../constants/theme';
import { Workout, AIWorkout, CyclePhase } from '../../../types';
import { useState } from 'react';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function HomeScreen() {
  const cycle = useCycle();
  const gemini = useGemini();
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | (AIWorkout & { phase?: CyclePhase }) | null>(null);
  const [constraintsVisible, setConstraintsVisible] = useState(false);

  // Fallback meal and workout from static data
  const phaseStaticMeals = staticMeals.filter((m) => m.phases.includes(cycle.phase) && m.type === 'breakfast');
  const fallbackMeal = phaseStaticMeals[cycle.cycleDay % Math.max(phaseStaticMeals.length, 1)];
  const phaseStaticWorkouts = staticWorkouts.filter((w) => w.phase === cycle.phase);
  const fallbackWorkout = phaseStaticWorkouts[cycle.cycleDay % Math.max(phaseStaticWorkouts.length, 1)];

  const displayMeal = gemini.dailyContent?.meals.breakfast ?? fallbackMeal;
  const displayWorkout = gemini.dailyContent?.workout ?? fallbackWorkout;
  const displayInsight = gemini.dailyContent?.insight;

  if (cycle.isLoading) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.pastelPink} />
      </SafeAreaView>
    );
  }

  return (
    <PhaseGradient phase={cycle.phase} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}, Diya 🌸</Text>
              <Text style={styles.dateLabel}>{format(new Date(), 'EEEE, d MMMM')}</Text>
            </View>
            <View style={styles.headerRight}>
              <AIStatusBadge
                isUsingFallback={gemini.isUsingFallback}
                isRegenerating={gemini.isRegenerating}
                error={gemini.error}
              />
              <TouchableOpacity
                onPress={() => setConstraintsVisible(true)}
                style={styles.infoBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.infoBtnText}>⚙️</Text>
              </TouchableOpacity>
            </View>
          </View>
          <ConstraintsModal
            visible={constraintsVisible}
            onClose={() => setConstraintsVisible(false)}
            constraints={gemini.constraints}
            onSave={gemini.saveConstraints}
            onRegenerate={gemini.regenerate}
          />

          {/* AI motivational message */}
          {gemini.dailyContent?.motivationalMessage && (
            <View style={styles.motRow}>
              <Text style={styles.motText}>"{gemini.dailyContent.motivationalMessage}"</Text>
            </View>
          )}

          {/* Cycle phase card */}
          <CyclePhaseCard
            phase={cycle.phase}
            cycleDay={cycle.cycleDay}
            cycleLength={cycle.cycleLength}
            insight={displayInsight}
          />

          {/* Today's Nourishment */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Nourishment</Text>
            {displayMeal && (
              <MealCard
                meal={{ ...displayMeal, emoji: (displayMeal as any).emoji ?? '🍳' } as any}
                isAI={!!gemini.dailyContent}
              />
            )}
          </View>

          {/* Today's Movement */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Movement</Text>
            {displayWorkout && (
              <WorkoutCard
                workout={displayWorkout as any}
                onPress={() => setSelectedWorkout(displayWorkout as any)}
                featured
                isAI={!!gemini.dailyContent}
              />
            )}
          </View>

          {/* Phase tip */}
          {gemini.dailyContent?.phaseTip && (
            <View style={styles.tipCard}>
              <Text style={styles.tipEmoji}>💡</Text>
              <Text style={styles.tipText}>{gemini.dailyContent.phaseTip}</Text>
            </View>
          )}

          {/* Quick symptom check-in */}
          <View style={styles.section}>
            <QuickSymptomRow phase={cycle.phase} />
          </View>

          <View style={styles.bottomPad} />
        </ScrollView>
      </SafeAreaView>

      <WorkoutDetailModal
        workout={selectedWorkout}
        visible={!!selectedWorkout}
        onClose={() => setSelectedWorkout(null)}
      />
    </PhaseGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white },
  scroll: { gap: 20, paddingTop: 16, paddingBottom: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingBottom: 4 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoBtn: { padding: 4 },
  infoBtnText: { fontSize: 18 },
  greeting: { ...Typography.heading1, fontSize: 22 },
  dateLabel: { ...Typography.body, fontSize: 14, marginTop: 2 },
  motRow: { paddingHorizontal: 20 },
  motText: { ...Typography.body, fontStyle: 'italic', fontSize: 14, color: Colors.textMuted },
  section: { gap: 10 },
  sectionTitle: { ...Typography.heading3, paddingHorizontal: 20 },
  tipCard: { marginHorizontal: 16, flexDirection: 'row', gap: 10, backgroundColor: Colors.pastelYellow + '60', padding: 14, borderRadius: 16, alignItems: 'flex-start' },
  tipEmoji: { fontSize: 18, marginTop: 1 },
  tipText: { ...Typography.body, fontSize: 14, flex: 1, color: Colors.textDark },
  bottomPad: { height: 20 },
});
