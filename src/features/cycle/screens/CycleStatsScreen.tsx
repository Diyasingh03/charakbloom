import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import Svg, { Rect, Line, Text as SvgText, G } from 'react-native-svg';
import { router } from 'expo-router';
import { format, parseISO } from 'date-fns';
import { useCycle } from '../context/CycleContext';
import { computeCycleStats, ChartCycle, OvulationPoint } from '../utils/cycleStats';
import { PhaseGradient } from '../../../components/PhaseGradient';
import { Colors, Typography, Radius, Spacing, PhaseThemes } from '../../../constants/theme';

// Each bar is a fixed width so charts scroll horizontally rather than squishing.
const BAR_W = 18;
const BAR_GAP = 5;
const AXIS_W = 30; // fixed left Y-axis column width

function barsContentWidth(n: number) {
  return n * (BAR_W + BAR_GAP) - BAR_GAP + 10; // 10px right padding
}

// ─── Bar chart colors ─────────────────────────────────────────────────────────
function barColor(length: number, inProgress: boolean): string {
  if (inProgress) return '#D8D0DC';
  if (length < 21) return '#F4A7BB';
  if (length > 35) return '#FFB97A';
  return Colors.pastelPurple;
}

// ─── Shared Y-axis SVG ────────────────────────────────────────────────────────
function YAxis({ ticks, toY, height }: { ticks: number[]; toY: (v: number) => number; height: number }) {
  return (
    <Svg width={AXIS_W} height={height}>
      {ticks.map((v) => (
        <SvgText key={v} x={AXIS_W - 4} y={toY(v) + 4} fontSize={9} fill={Colors.textMuted} textAnchor="end">
          {v}
        </SvgText>
      ))}
    </Svg>
  );
}

// ─── Cycle length bar chart ───────────────────────────────────────────────────
function CycleLengthChart({ cycles }: { cycles: ChartCycle[] }) {
  const TOP = 14;   // room above the tallest bar/label
  const BOTTOM = 22; // room below bars for month labels
  const PLOT_H = 90; // bar drawing area height
  const CHART_H = TOP + PLOT_H + BOTTOM;
  const n = cycles.length;
  const svgW = barsContentWidth(n);

  const allLengths = cycles.filter((c) => !c.inProgress).map((c) => c.cycleLength);
  const maxVal = Math.max(...allLengths, 40);
  const yMax = Math.ceil(maxVal / 10) * 10;
  // toY maps a data value to an SVG y-coordinate within [TOP, TOP+PLOT_H]
  const toY = (v: number) => TOP + PLOT_H - (v / yMax) * PLOT_H;
  const baseline = TOP + PLOT_H; // y-coordinate of the x-axis
  const yTicks = [0, 21, 35, yMax].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <View style={[styles.chartRow, { height: CHART_H }]}>
      <YAxis ticks={yTicks} toY={toY} height={CHART_H} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1, height: CHART_H }}>
        <Svg width={svgW} height={CHART_H}>
          {/* Normal range band */}
          <Rect x={0} y={toY(35)} width={svgW} height={toY(21) - toY(35)} fill={Colors.pastelPurple + '20'} />
          {/* Grid lines */}
          {yTicks.map((v) => (
            <Line key={v} x1={0} y1={toY(v)} x2={svgW} y2={toY(v)}
              stroke={v === 21 || v === 35 ? Colors.pastelPurple + '55' : Colors.border}
              strokeWidth={v === 21 || v === 35 ? 1.2 : 0.7}
              strokeDasharray={v === 21 || v === 35 ? '4,3' : undefined}
            />
          ))}
          {/* Bars + month labels */}
          {cycles.map((c, i) => {
            const x = i * (BAR_W + BAR_GAP);
            const bH = Math.max(2, (c.cycleLength / yMax) * PLOT_H);
            return (
              <G key={i}>
                <Rect x={x} y={baseline - bH} width={BAR_W} height={bH}
                  fill={barColor(c.cycleLength, c.inProgress)} rx={3} />
                <SvgText x={x + BAR_W / 2} y={CHART_H - 5} fontSize={8}
                  fill={Colors.textMuted} textAnchor="middle">
                  {c.label.split(' ')[0]}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      </ScrollView>
    </View>
  );
}

// ─── Period length bar chart ──────────────────────────────────────────────────
function PeriodLengthChart({ cycles }: { cycles: ChartCycle[] }) {
  const TOP = 14;
  const BOTTOM = 8;
  const PLOT_H = 60;
  const CHART_H = TOP + PLOT_H + BOTTOM;
  const n = cycles.length;
  const svgW = barsContentWidth(n);

  const maxVal = Math.max(...cycles.map((c) => c.periodLength), 7);
  const yMax = Math.ceil(maxVal / 2) * 2;
  const toY = (v: number) => TOP + PLOT_H - (v / yMax) * PLOT_H;
  const baseline = TOP + PLOT_H;
  const yTicks = [0, Math.round(yMax / 2), yMax];

  return (
    <View style={[styles.chartRow, { height: CHART_H }]}>
      <YAxis ticks={yTicks} toY={toY} height={CHART_H} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1, height: CHART_H }}>
        <Svg width={svgW} height={CHART_H}>
          {yTicks.map((v) => (
            <Line key={v} x1={0} y1={toY(v)} x2={svgW} y2={toY(v)}
              stroke={Colors.border} strokeWidth={0.7} />
          ))}
          {cycles.map((c, i) => {
            const x = i * (BAR_W + BAR_GAP);
            const bH = Math.max(2, (c.periodLength / yMax) * PLOT_H);
            return (
              <Rect key={i} x={x} y={baseline - bH} width={BAR_W} height={bH}
                fill={Colors.pastelPink} rx={3} />
            );
          })}
        </Svg>
      </ScrollView>
    </View>
  );
}

// ─── Ovulation day chart ──────────────────────────────────────────────────────
function OvulationChart({ points }: { points: OvulationPoint[] }) {
  const TOP = 14;
  const BOTTOM = 22; // room for labels
  const PLOT_H = 60;
  const CHART_H = TOP + PLOT_H + BOTTOM;
  const n = points.length;
  const svgW = barsContentWidth(n);

  const days = points.map((p) => p.ovulationDay);
  const minD = Math.max(0, Math.min(...days) - 2);
  const maxD = Math.max(...days) + 3;
  const toY = (v: number) => TOP + PLOT_H - ((v - minD) / (maxD - minD)) * PLOT_H;
  const baseline = TOP + PLOT_H;
  const yTicks = [minD, Math.round((minD + maxD) / 2), maxD];

  return (
    <View style={[styles.chartRow, { height: CHART_H }]}>
      <YAxis ticks={yTicks} toY={toY} height={CHART_H} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1, height: CHART_H }}>
        <Svg width={svgW} height={CHART_H}>
          {yTicks.map((v) => (
            <Line key={v} x1={0} y1={toY(v)} x2={svgW} y2={toY(v)}
              stroke={Colors.border} strokeWidth={0.7} />
          ))}
          {points.map((p, i) => {
            const x = i * (BAR_W + BAR_GAP) + BAR_W / 2;
            const bH = Math.max(2, ((p.ovulationDay - minD) / (maxD - minD)) * PLOT_H);
            return (
              <G key={i}>
                <Line x1={x} y1={baseline - bH} x2={x} y2={baseline}
                  stroke={Colors.pastelPeach} strokeWidth={BAR_W - 4} strokeLinecap="round" />
                <SvgText x={x} y={CHART_H - 5} fontSize={8}
                  fill={Colors.textMuted} textAnchor="middle">
                  {p.label}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      </ScrollView>
    </View>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, color ? { color } : {}]}>{value}</Text>
      {sub && <Text style={styles.statSub}>{sub}</Text>}
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export function CycleStatsScreen() {
  const { cycles, phase } = useCycle();
  const stats = computeCycleStats(cycles);

  return (
    <PhaseGradient phase={phase} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cycle Trends</Text>
          <View style={{ width: 44 }} />
        </View>

        {!stats ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Not enough data yet. Import at least 2 cycles.</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            {/* Hero */}
            <View style={styles.heroCard}>
              <Text style={styles.heroNumber}>{stats.total}</Text>
              <Text style={styles.heroLabel}>cycles tracked</Text>
              <Text style={styles.heroRange}>
                {format(parseISO(stats.firstDate), 'MMM yyyy')} — {format(parseISO(stats.lastDate), 'MMM yyyy')}
              </Text>
            </View>

            {/* Key metrics */}
            <View style={styles.statsGrid}>
              <StatCard
                label="Avg cycle"
                value={`${stats.avgLength}d`}
                sub={`±${stats.stdDev}d`}
                color={stats.avgLength > 35 ? '#F5A056' : Colors.pastelPurple}
              />
              <StatCard
                label="Avg period"
                value={`${stats.avgPeriodLength}d`}
                sub={`${stats.shortestPeriod}–${stats.longestPeriod}d`}
                color={Colors.pastelPink}
              />
              <StatCard
                label="Shortest"
                value={`${stats.shortestLength}d`}
                color={stats.shortestLength < 21 ? '#F4A7BB' : Colors.textDark}
              />
              <StatCard
                label="Longest"
                value={`${stats.longestLength}d`}
                color={stats.longestLength > 35 ? '#FFB97A' : Colors.textDark}
              />
            </View>

            {/* Regularity summary */}
            <View style={styles.card}>
              <View style={styles.regularityRow}>
                <View style={styles.regularityLeft}>
                  <Text style={styles.regularityPct}>{stats.pctRegular}%</Text>
                  <Text style={styles.regularityLabel}>regular cycles{'\n'}(21–35 days)</Text>
                </View>
                <View style={styles.regularityRight}>
                  <View style={styles.trendRow}>
                    <Text style={styles.trendIcon}>
                      {stats.trendDirection === 'shortening' ? '↘' : stats.trendDirection === 'lengthening' ? '↗' : '→'}
                    </Text>
                    <View>
                      <Text style={styles.trendLabel}>Length trend</Text>
                      <Text style={styles.trendValue}>
                        {stats.trendDirection === 'stable' ? 'Stable' :
                          stats.trendDirection === 'shortening' ? 'Getting shorter' : 'Getting longer'}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.trendRow, { marginTop: 10 }]}>
                    <Text style={styles.trendIcon}>
                      {stats.regularityChange === 'improving' ? '📉' : stats.regularityChange === 'worsening' ? '📈' : '〜'}
                    </Text>
                    <View>
                      <Text style={styles.trendLabel}>Regularity</Text>
                      <Text style={styles.trendValue}>
                        {stats.regularityChange === 'improving' ? 'More regular' :
                          stats.regularityChange === 'worsening' ? 'More variable' : 'Consistent'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Cycle length chart */}
            <View style={styles.card}>
              <Text style={styles.chartTitle}>Cycle Length History</Text>
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: Colors.pastelPurple }]} />
                  <Text style={styles.legendText}>21–35d (regular)</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#FFB97A' }]} />
                  <Text style={styles.legendText}>&gt;35d</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#F4A7BB' }]} />
                  <Text style={styles.legendText}>&lt;21d</Text>
                </View>
              </View>
              <CycleLengthChart cycles={stats.chartCycles} />
            </View>

            {/* Period length chart */}
            <View style={styles.card}>
              <Text style={styles.chartTitle}>Period Length History</Text>
              <PeriodLengthChart cycles={stats.chartCycles} />
            </View>

            {/* Ovulation timing */}
            {stats.ovulationPoints.length >= 3 && (
              <View style={styles.card}>
                <Text style={styles.chartTitle}>Ovulation Timing</Text>
                <Text style={styles.chartSub}>
                  Cycle day of ovulation · avg day {stats.avgOvulationDay}
                </Text>
                <OvulationChart points={stats.ovulationPoints} />
              </View>
            )}

            {/* Pattern insights */}
            <View style={styles.card}>
              <Text style={styles.chartTitle}>Pattern Insights</Text>
              <View style={styles.insightsGap}>
                {stats.avgLength > 35 && (
                  <InsightRow
                    color={PhaseThemes.ovulatory.primary}
                    text={`Your average cycle is ${stats.avgLength} days — longer than the typical range. Extended cycles are common with PCOS and often reflect a delayed ovulation window.`}
                  />
                )}
                {stats.stdDev >= 7 && (
                  <InsightRow
                    color={PhaseThemes.luteal.primary}
                    text={`Your cycle length varies by ±${stats.stdDev} days. High variability is a hallmark of PCOS — the prediction engine accounts for this when computing your estimates.`}
                  />
                )}
                {stats.stdDev < 5 && stats.complete >= 6 && (
                  <InsightRow
                    color={PhaseThemes.follicular.primary}
                    text={`Your recent cycles are fairly consistent (±${stats.stdDev}d). This regularity makes predictions more reliable.`}
                  />
                )}
                {stats.trendDirection !== 'stable' && (
                  <InsightRow
                    color={PhaseThemes.menstrual.primary}
                    text={`Your cycles have been ${stats.trendDirection === 'shortening' ? 'getting shorter' : 'getting longer'} recently. This could reflect hormonal shifts — worth mentioning to your doctor if the trend continues.`}
                  />
                )}
                {stats.withOvulation >= 5 && stats.avgOvulationDay !== null && (
                  <InsightRow
                    color={PhaseThemes.ovulatory.primary}
                    text={`Based on ${stats.withOvulation} tracked cycles, you tend to ovulate around cycle day ${stats.avgOvulationDay}. This is later than average for non-PCOS cycles (day 14).`}
                  />
                )}
                {stats.pctRegular >= 70 && (
                  <InsightRow
                    color={PhaseThemes.follicular.primary}
                    text={`${stats.pctRegular}% of your complete cycles fall within the 21–35 day range — a positive sign of hormonal regulation.`}
                  />
                )}
              </View>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </SafeAreaView>
    </PhaseGradient>
  );
}

function InsightRow({ color, text }: { color: string; text: string }) {
  return (
    <View style={styles.insightRow}>
      <View style={[styles.insightDot, { backgroundColor: color }]} />
      <Text style={styles.insightText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    backgroundColor: Colors.white + 'CC',
  },
  backArrow: { fontSize: 22, color: Colors.textDark, fontWeight: '300' },
  headerTitle: { ...Typography.heading2, fontSize: 20 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyText: { ...Typography.body, textAlign: 'center' },
  scroll: { gap: 14, paddingHorizontal: Spacing.lg, paddingBottom: 24 },
  heroCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heroNumber: { fontSize: 56, fontWeight: '800', color: Colors.textDark, letterSpacing: -2, lineHeight: 60 },
  heroLabel: { ...Typography.heading3, color: Colors.textMuted, marginTop: 2 },
  heroRange: { ...Typography.caption, marginTop: 6, color: Colors.textMuted },
  statsGrid: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 2,
  },
  statValue: { fontSize: 22, fontWeight: '700', color: Colors.textDark, letterSpacing: -0.5 },
  statSub: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },
  statLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  regularityRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  regularityLeft: { alignItems: 'center', minWidth: 72 },
  regularityPct: { fontSize: 40, fontWeight: '800', color: Colors.textDark, letterSpacing: -1, lineHeight: 44 },
  regularityLabel: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', lineHeight: 16 },
  regularityRight: { flex: 1 },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  trendIcon: { fontSize: 22 },
  trendLabel: { fontSize: 11, color: Colors.textMuted },
  trendValue: { fontSize: 14, fontWeight: '600', color: Colors.textDark },
  chartTitle: { ...Typography.heading3, fontSize: 15 },
  chartSub: { ...Typography.caption, marginTop: -4 },
  legendRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: Colors.textMuted },
  insightsGap: { gap: 12 },
  insightRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  insightDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5, flexShrink: 0 },
  insightText: { ...Typography.body, fontSize: 13, lineHeight: 19, flex: 1 },
  chartRow: { flexDirection: 'row', alignItems: 'flex-start' },
});
