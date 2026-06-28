import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { useCycle } from '../../cycle/context/CycleContext';
import { useGemini } from '../../../ai/context/GeminiContext';
import { WorkoutCard } from '../components/WorkoutCard';
import { WorkoutDetailModal } from '../components/WorkoutDetailModal';
import { PhasePills } from '../../../components/PhasePills';
import { PhaseGradient } from '../../../components/PhaseGradient';
import { AIStatusBadge } from '../../../components/AIStatusBadge';
import { workouts as staticWorkouts } from '../data/workouts';
import { Colors, Typography } from '../../../constants/theme';
import { Workout, AIWorkout, CyclePhase } from '../../../types';

type WorkoutData = Workout | (AIWorkout & { phase?: CyclePhase });

export function WorkoutsScreen() {
  const cycle = useCycle();
  const gemini = useGemini();
  const [selectedPhase, setSelectedPhase] = useState<CyclePhase | 'all'>(cycle.phase);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutData | null>(null);

  const phaseFilter = selectedPhase === 'all' ? cycle.phase : selectedPhase as CyclePhase;
  const filteredWorkouts = staticWorkouts.filter((w) => w.phase === phaseFilter);

  return (
    <PhaseGradient phase={cycle.phase} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          ListHeaderComponent={
            <>
              <View style={styles.header}>
                <Text style={styles.title}>Move</Text>
                <AIStatusBadge isUsingFallback={gemini.isUsingFallback} isRegenerating={gemini.isRegenerating} error={gemini.error} />
              </View>

              {/* AI Featured Workout */}
              {gemini.dailyContent?.workout && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Today's Pick</Text>
                  <WorkoutCard
                    workout={gemini.dailyContent.workout as any}
                    onPress={() => setSelectedWorkout(gemini.dailyContent!.workout as any)}
                    featured
                    isAI
                  />
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>All Workouts</Text>
                <PhasePills selected={selectedPhase} onSelect={setSelectedPhase} includeAll={false} />
              </View>
            </>
          }
          data={filteredWorkouts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <WorkoutCard
              workout={item}
              onPress={() => setSelectedWorkout(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={<View style={{ height: 40 }} />}
        />
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { ...Typography.heading1 },
  section: { gap: 10, marginBottom: 4 },
  sectionTitle: { ...Typography.heading3, paddingHorizontal: 20 },
  listContent: { gap: 0, paddingTop: 8 },
});
