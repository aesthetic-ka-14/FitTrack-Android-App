import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

export function SectionLabel({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  return <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>{children}</Text>;
}

export function MetricCard({ icon, label, value, unit, detail, tone = 'neutral' }: { icon: keyof typeof Feather.glyphMap; label: string; value: string; unit?: string; detail?: string; tone?: 'neutral' | 'lime' | 'dark' }) {
  const colors = useColors();
  const palette = tone === 'lime' ? { bg: colors.accent, fg: colors.accentForeground, muted: '#50622D' } : tone === 'dark' ? { bg: colors.primary, fg: colors.primaryForeground, muted: '#A5B6AB' } : { bg: colors.card, fg: colors.cardForeground, muted: colors.mutedForeground };
  return <View style={[styles.metricCard, { backgroundColor: palette.bg, borderColor: colors.border }]}>
    <View style={styles.metricTop}><Feather name={icon} size={16} color={palette.fg} /><Text style={[styles.metricLabel, { color: palette.muted }]}>{label}</Text></View>
    <Text style={[styles.metricValue, { color: palette.fg }]}>{value}<Text style={styles.metricUnit}>{unit}</Text></Text>
    {detail ? <Text style={[styles.metricDetail, { color: palette.muted }]}>{detail}</Text> : null}
  </View>;
}

export function PillButton({ icon, label, onPress, filled = false }: { icon: keyof typeof Feather.glyphMap; label: string; onPress?: () => void; filled?: boolean }) {
  const colors = useColors();
  return <Pressable testID={label.toLowerCase().replaceAll(' ', '-')} onPress={onPress} style={({ pressed }) => [styles.pill, { backgroundColor: filled ? colors.accent : colors.secondary, opacity: pressed ? 0.78 : 1 }]}><Feather name={icon} size={16} color={filled ? colors.accentForeground : colors.secondaryForeground} /><Text style={[styles.pillText, { color: filled ? colors.accentForeground : colors.secondaryForeground }]}>{label}</Text></Pressable>;
}

export const styles = StyleSheet.create({
  sectionLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase' },
  metricCard: { width: '48.5%', borderRadius: 18, padding: 16, borderWidth: 1, minHeight: 126, justifyContent: 'space-between' },
  metricTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metricLabel: { fontSize: 12, fontWeight: '600' },
  metricValue: { fontSize: 27, fontWeight: '700', letterSpacing: -1 },
  metricUnit: { fontSize: 13, fontWeight: '600', letterSpacing: 0 },
  metricDetail: { fontSize: 12, fontWeight: '500' },
  pill: { height: 48, borderRadius: 24, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  pillText: { fontSize: 14, fontWeight: '700' },
});