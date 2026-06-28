import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { SymptomLog, SymptomKey, PeriodFlow, CyclePhase } from '../../../types';
import { Colors, Typography, Radius, PhaseThemes } from '../../../constants/theme';
import { Card } from '../../../components/Card';
import { format } from 'date-fns';

const FLOW_OPTIONS: Array<{ key: PeriodFlow; label: string }> = [
  { key: 'spotting', label: 'Spotting' },
  { key: 'light', label: 'Light' },
  { key: 'medium', label: 'Medium' },
  { key: 'heavy', label: 'Heavy' },
];

const SYMPTOMS: Array<{ key: SymptomKey; label: string; emoji: string }> = [
  { key: 'bloating', label: 'Bloating', emoji: '🤢' },
  { key: 'fatigue', label: 'Fatigue', emoji: '😴' },
  { key: 'acne', label: 'Acne', emoji: '✨' },
  { key: 'mood', label: 'Mood', emoji: '🌀' },
  { key: 'hairChanges', label: 'Hair Changes', emoji: '💇' },
  { key: 'cravings', label: 'Cravings', emoji: '🍰' },
  { key: 'cramps', label: 'Cramps', emoji: '🌊' },
  { key: 'brainFog', label: 'Brain Fog', emoji: '🌫️' },
];

interface Props {
  existingLog: SymptomLog | null;
  cycleDay: number;
  phase: CyclePhase;
  onSave: (log: SymptomLog) => Promise<void>;
}

export function SymptomLogger({ existingLog, cycleDay, phase, onSave }: Props) {
  const [periodFlow, setPeriodFlow] = useState<PeriodFlow | null>(existingLog?.periodFlow ?? null);
  const [ratings, setRatings] = useState<Partial<Record<SymptomKey, number>>>(
    existingLog?.symptoms ?? {}
  );
  const [notes, setNotes] = useState(existingLog?.notes ?? '');
  const [saved, setSaved] = useState(false);

  const checkScale = useSharedValue(0);
  const phaseColour = PhaseThemes[phase].primary;

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const handleSave = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const log: SymptomLog = {
      id: today,
      date: today,
      cycleDay,
      phase,
      periodFlow: periodFlow ?? undefined,
      symptoms: ratings,
      notes: notes.trim() || undefined,
    };
    await onSave(log);
    setSaved(true);
    checkScale.value = withSequence(withSpring(1.2), withTiming(1));
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <View style={styles.container}>
      {/* Period flow */}
      <View style={styles.periodSection}>
        <View style={styles.periodHeader}>
          <Text style={styles.symptomEmoji}>🩸</Text>
          <Text style={styles.symptomLabel}>Period flow</Text>
        </View>
        <View style={styles.flowRow}>
          <TouchableOpacity
            onPress={() => setPeriodFlow(null)}
            style={[styles.flowChip, periodFlow === null && { backgroundColor: phaseColour, borderColor: phaseColour }]}
          >
            <Text style={[styles.flowChipText, periodFlow === null && styles.flowChipTextSelected]}>None</Text>
          </TouchableOpacity>
          {FLOW_OPTIONS.map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              onPress={() => setPeriodFlow(key)}
              style={[styles.flowChip, periodFlow === key && { backgroundColor: phaseColour, borderColor: phaseColour }]}
            >
              <Text style={[styles.flowChipText, periodFlow === key && styles.flowChipTextSelected]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {SYMPTOMS.map(({ key, label, emoji }) => (
        <View key={key} style={styles.symptomRow}>
          <Text style={styles.symptomEmoji}>{emoji}</Text>
          <Text style={styles.symptomLabel}>{label}</Text>
          <View style={styles.dots}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity
                key={n}
                onPress={() => setRatings((prev) => ({ ...prev, [key]: n }))}
                style={[
                  styles.dot,
                  (ratings[key] ?? 0) >= n && { backgroundColor: phaseColour },
                  (ratings[key] ?? 0) >= n && { borderColor: phaseColour },
                ]}
              />
            ))}
          </View>
        </View>
      ))}

      <TextInput
        style={styles.notesInput}
        value={notes}
        onChangeText={setNotes}
        placeholder="Any notes for today..."
        placeholderTextColor={Colors.textMuted}
        multiline
        numberOfLines={3}
      />

      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: phaseColour }]}
        onPress={handleSave}
        activeOpacity={0.8}
      >
        {saved ? (
          <Animated.Text style={[styles.saveBtnText, checkStyle]}>✓ Saved!</Animated.Text>
        ) : (
          <Text style={styles.saveBtnText}>Save today's log</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, gap: 4 },
  periodSection: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 10 },
  periodHeader: { flexDirection: 'row', alignItems: 'center' },
  flowRow: { flexDirection: 'row', gap: 8 },
  flowChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.sm, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white },
  flowChipText: { fontSize: 13, fontWeight: '500', color: Colors.textDark },
  flowChipTextSelected: { color: Colors.white },
  symptomRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  symptomEmoji: { fontSize: 18, width: 28 },
  symptomLabel: { ...Typography.label, flex: 1, fontSize: 14 },
  dots: { flexDirection: 'row', gap: 7 },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white },
  notesInput: { marginTop: 16, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, padding: 12, fontSize: 14, color: Colors.textDark, minHeight: 80, textAlignVertical: 'top' },
  saveBtn: { marginTop: 16, paddingVertical: 14, borderRadius: Radius.md, alignItems: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '600', color: Colors.white },
});
