import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { format, subDays, parseISO } from 'date-fns';
import { useCycle } from '../../cycle/context/CycleContext';
import { useSymptomLog } from '../hooks/useSymptomLog';
import { SymptomLogger } from '../components/SymptomLogger';
import { PhaseGradient } from '../../../components/PhaseGradient';
import { Colors, Typography, Radius, PhaseThemes } from '../../../constants/theme';

export function TrackScreen() {
  const cycle = useCycle();
  const { logs, saveLog, getLogForDate } = useSymptomLog();
  const [viewDate, setViewDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleSaveLog = async (log: import('../../../types').SymptomLog) => {
    await saveLog(log);
    const isActualFlow = log.periodFlow === 'light' || log.periodFlow === 'medium' || log.periodFlow === 'heavy';
    if (isActualFlow && cycle.phase !== 'menstrual') {
      await cycle.confirmPeriodStart(log.date);
    }
  };

  const today = format(new Date(), 'yyyy-MM-dd');
  const past7 = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd'));

  const existingLog = getLogForDate(viewDate);
  const phaseColour = PhaseThemes[cycle.phase].primary;

  return (
    <PhaseGradient phase={cycle.phase} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Track</Text>
              <Text style={styles.subtitle}>
                Day {cycle.cycleDay} • {PhaseThemes[cycle.phase].label} Phase
              </Text>
            </View>
            <Text style={styles.dateLabel}>{format(parseISO(viewDate), 'EEE, d MMM')}</Text>
          </View>

          {/* Date chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateStrip}>
            {past7.map((date) => {
              const hasLog = !!getLogForDate(date);
              const isToday = date === today;
              const isSelected = date === viewDate;
              return (
                <TouchableOpacity
                  key={date}
                  onPress={() => setViewDate(date)}
                  style={[
                    styles.dateChip,
                    isSelected && { backgroundColor: phaseColour, borderColor: phaseColour },
                    hasLog && !isSelected && styles.dateChipLogged,
                  ]}
                >
                  <Text style={[styles.dateDayName, isSelected && styles.dateTextSelected]}>
                    {format(parseISO(date), 'EEE')}
                  </Text>
                  <Text style={[styles.dateDayNum, isSelected && styles.dateTextSelected]}>
                    {format(parseISO(date), 'd')}
                  </Text>
                  {hasLog && !isSelected && (
                    <View style={[styles.logDot, { backgroundColor: phaseColour }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Symptom logger */}
          <View style={styles.loggerSection}>
            <Text style={styles.sectionTitle}>
              {viewDate === today ? "How are you feeling today?" : `Log for ${format(parseISO(viewDate), 'd MMM')}`}
            </Text>
            <SymptomLogger
              existingLog={existingLog}
              cycleDay={cycle.cycleDay}
              phase={cycle.phase}
              onSave={handleSaveLog}
            />
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </PhaseGradient>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: 20, paddingTop: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20 },
  title: { ...Typography.heading1 },
  subtitle: { ...Typography.body, fontSize: 14, marginTop: 2 },
  dateLabel: { ...Typography.caption, fontSize: 14 },
  dateStrip: { paddingHorizontal: 16, gap: 8 },
  dateChip: { alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white, minWidth: 54 },
  dateChipLogged: { borderColor: Colors.pastelPink + '80', backgroundColor: Colors.pastelPink + '15' },
  dateDayName: { fontSize: 11, fontWeight: '500', color: Colors.textMuted },
  dateDayNum: { fontSize: 17, fontWeight: '700', color: Colors.textDark, marginTop: 2 },
  dateTextSelected: { color: Colors.white },
  logDot: { width: 6, height: 6, borderRadius: 3, marginTop: 3 },
  loggerSection: { gap: 12 },
  sectionTitle: { ...Typography.heading3, paddingHorizontal: 20 },
});
