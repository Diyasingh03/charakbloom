import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useCycle } from '../context/CycleContext';
import { useGemini } from '../../../ai/context/GeminiContext';
import { CircularCycleView } from '../components/CircularCycleView';
import { CycleHistoryList } from '../components/CycleHistoryList';
import { FloPredictionsCard } from '../components/FloPredictionsCard';
import { ImportCycleModal } from '../components/ImportCycleModal';
import { PhaseGradient } from '../../../components/PhaseGradient';
import { Colors, Typography, PhaseThemes } from '../../../constants/theme';

const PHASE_TIPS: Record<string, string[]> = {
  menstrual: [
    'Iron-rich foods like spinach and eggs help replenish what your body loses during menstruation.',
    'Reduce vigorous exercise — your body is doing significant work internally.',
    'Heat on the lower abdomen (warm water bottle) reduces prostaglandin-driven cramping.',
    'Spearmint tea twice a day is clinically shown to lower free testosterone in PCOS.',
    'This phase is ideal for rest, journalling, and slowing down — not just physically.',
  ],
  follicular: [
    'Oestrogen rising means your brain is sharper — schedule demanding tasks now.',
    'Cruciferous vegetables like arugula contain DIM, which helps your liver process oestrogen.',
    'This is the best phase to start a new habit — willpower and motivation are naturally higher.',
    'Higher-intensity exercise is well-tolerated; your cortisol recovery is fastest right now.',
    'Fermented dairy (Greek yogurt) provides myo-inositol, the most evidence-based PCOS supplement.',
  ],
  ovulatory: [
    'Your pain threshold is highest at ovulation — ideal for harder workouts.',
    'Zinc-rich foods support ovulation; eggs and dairy are your best accessible sources.',
    'You may notice increased confidence and social energy — lean into it.',
    'Anti-inflammatory omega-3s (found in eggs) help support LH surge quality in PCOS.',
    'Ovulation in PCOS is less predictable — Flo predictions are estimates, not guarantees.',
  ],
  luteal: [
    'Magnesium deficiency amplifies PMS; milk, spinach, and yogurt are your best accessible sources.',
    'Progesterone slows digestion — smaller meals more frequently help with bloating.',
    'Cravings are hormonal, not a lack of willpower. Cheese and eggs make excellent low-GI snack bases.',
    'Sleep quality drops in late luteal — limit screens 1 hour before bed.',
    'Reduce exercise intensity in the last 5 days of luteal to avoid cortisol-PMS compounding.',
  ],
};

export function CycleScreen() {
  const cycle = useCycle();
  const gemini = useGemini();
  const [importVisible, setImportVisible] = useState(false);

  const tips = PHASE_TIPS[cycle.phase] ?? [];
  const phaseTheme = PhaseThemes[cycle.phase];

  return (
    <PhaseGradient phase={cycle.phase} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.screenTitle}>Your Cycle</Text>

          {/* SVG Wheel */}
          <View style={styles.wheelContainer}>
            <CircularCycleView
              cycleDay={cycle.cycleDay}
              cycleLength={cycle.cycleLength}
              phase={cycle.phase}
            />
          </View>

          {/* Phase legend */}
          <View style={styles.legend}>
            {(['menstrual', 'follicular', 'ovulatory', 'luteal'] as const).map((p) => (
              <View key={p} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: PhaseThemes[p].primary }]} />
                <Text style={[styles.legendText, p === cycle.phase && styles.legendTextActive]}>
                  {PhaseThemes[p].emoji} {PhaseThemes[p].label}
                </Text>
              </View>
            ))}
          </View>

          {/* Phase Tips */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>Phase tips for you</Text>
            {tips.map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <Text style={[styles.tipBullet, { color: phaseTheme.primary }]}>•</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

          {/* Flo Predictions */}
          <FloPredictionsCard
            predictions={cycle.predictions}
            computedPredictions={cycle.computedPredictions}
            onSave={cycle.savePredictions}
            onClear={cycle.clearManualPredictions}
            onRefreshPlan={gemini.regenerate}
            cycleCount={cycle.cycles.filter(c => c.cycle_length >= 15).length}
          />

          {/* Cycle History */}
          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Cycle History</Text>
              <View style={styles.historyActions}>
                <TouchableOpacity
                  style={styles.statsBtn}
                  onPress={() => router.push('/cycle-stats')}
                >
                  <Text style={styles.statsBtnText}>Trends</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.importBtn}
                  onPress={() => setImportVisible(true)}
                >
                  <Text style={styles.importBtnText}>+ Import</Text>
                </TouchableOpacity>
              </View>
            </View>
            <CycleHistoryList cycles={cycle.cycles} />
          </View>

          <ImportCycleModal
            visible={importVisible}
            onClose={() => setImportVisible(false)}
            onImported={() => {
              setImportVisible(false);
              cycle.refreshCycle();
            }}
          />

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </PhaseGradient>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: 24, paddingTop: 16, paddingBottom: 24 },
  screenTitle: { ...Typography.heading1, paddingHorizontal: 20 },
  wheelContainer: { alignItems: 'center', paddingVertical: 8 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 13, color: Colors.textMuted },
  legendTextActive: { fontWeight: '700', color: Colors.textDark },
  tipsCard: { marginHorizontal: 16, backgroundColor: Colors.white, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: Colors.border, gap: 10 },
  tipsTitle: { ...Typography.heading3, marginBottom: 4 },
  tipRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  tipBullet: { fontSize: 16, fontWeight: '700', marginTop: 1 },
  tipText: { ...Typography.body, fontSize: 14, flex: 1, lineHeight: 20 },
  historySection: {},
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 4 },
  historyTitle: { ...Typography.heading3 },
  historyActions: { flexDirection: 'row', gap: 8 },
  statsBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.pastelPurple },
  statsBtnText: { fontSize: 13, fontWeight: '600', color: Colors.textDark },
  importBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: Colors.pastelPurple },
  importBtnText: { fontSize: 13, fontWeight: '600', color: Colors.pastelPurple },
});
