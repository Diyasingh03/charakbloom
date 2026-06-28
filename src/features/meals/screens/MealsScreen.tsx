import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, ScrollView } from 'react-native';
import { useCycle } from '../../cycle/context/CycleContext';
import { useGemini } from '../../../ai/context/GeminiContext';
import { MealCard } from '../components/MealCard';
import { PhasePills } from '../../../components/PhasePills';
import { PhaseGradient } from '../../../components/PhaseGradient';
import { AIStatusBadge } from '../../../components/AIStatusBadge';
import { meals as staticMeals } from '../data/meals';
import { Colors, Typography } from '../../../constants/theme';
import { CyclePhase, AIMeal, MealType } from '../../../types';

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export function MealsScreen() {
  const cycle = useCycle();
  const gemini = useGemini();
  const [filter, setFilter] = useState<CyclePhase | 'all'>(cycle.phase);

  const filteredStatic = filter === 'all'
    ? staticMeals
    : staticMeals.filter((m) => m.phases.includes(filter as CyclePhase));

  const aiMeals = gemini.dailyContent?.meals;

  return (
    <PhaseGradient phase={cycle.phase} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Meals</Text>
          <AIStatusBadge isUsingFallback={gemini.isUsingFallback} isRegenerating={gemini.isRegenerating} error={gemini.error} />
        </View>

        <FlatList
          ListHeaderComponent={
            <>
              {/* AI Daily Plan */}
              {aiMeals && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Today's AI Plan</Text>
                  {MEAL_TYPES.map((type) => {
                    const meal = aiMeals[type] as AIMeal;
                    return meal ? (
                      <MealCard
                        key={type}
                        meal={{ ...meal, type } as any}
                        isAI
                      />
                    ) : null;
                  })}
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Explore Recipes</Text>
                <PhasePills selected={filter} onSelect={setFilter} includeAll />
                <Text style={styles.filterSubtitle}>
                  {filter === 'all' ? 'All PCOS-friendly meals' : `Meals for ${filter} phase`} ({filteredStatic.length})
                </Text>
              </View>
            </>
          }
          data={filteredStatic}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MealCard meal={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={<View style={{ height: 40 }} />}
        />
      </SafeAreaView>
    </PhaseGradient>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { ...Typography.heading1 },
  section: { gap: 12, marginBottom: 8 },
  sectionTitle: { ...Typography.heading3, paddingHorizontal: 20 },
  filterSubtitle: { ...Typography.caption, paddingHorizontal: 20, marginTop: -4 },
  listContent: { gap: 0, paddingTop: 8 },
});
