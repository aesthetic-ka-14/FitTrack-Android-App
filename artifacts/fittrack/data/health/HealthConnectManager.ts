import { Linking, Platform } from 'react-native';
import type { Permission } from 'react-native-health-connect';

export type HealthConnectStatus = 'connected' | 'unavailable' | 'needs-permission' | 'unsupported' | 'error';
export interface HealthMetric { id: string; metricType: string; value: number; unit: string; timestamp: string; source: string; }
export interface HealthSummary { status: HealthConnectStatus; steps: number | null; heartRate: number | null; restingHeartRate: number | null; sleepMinutes: number | null; exerciseMinutes: number | null; calories: number | null; distanceMeters: number | null; hrv: number | null; lastSyncedAt: string | null; }

const READ_PERMISSIONS: Permission[] = [
  { accessType: 'read', recordType: 'Steps' }, { accessType: 'read', recordType: 'HeartRate' },
  { accessType: 'read', recordType: 'RestingHeartRate' }, { accessType: 'read', recordType: 'SleepSession' },
  { accessType: 'read', recordType: 'ExerciseSession' }, { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
  { accessType: 'read', recordType: 'Distance' }, { accessType: 'read', recordType: 'HeartRateVariabilityRmssd' },
];
function nativeModule() { if (Platform.OS !== 'android') return null; return require('react-native-health-connect') as typeof import('react-native-health-connect'); }
function range() { const end = new Date(); const start = new Date(end); start.setHours(0, 0, 0, 0); return { startTime: start.toISOString(), endTime: end.toISOString() }; }
function valueOf(record: unknown, path: string[]): number | null { let current: unknown = record; for (const key of path) { if (!current || typeof current !== 'object') return null; current = (current as Record<string, unknown>)[key]; } return typeof current === 'number' ? current : null; }

export class HealthConnectManager {
  async getStatus(): Promise<HealthConnectStatus> { const healthConnect = nativeModule(); if (!healthConnect) return 'unsupported'; try { const sdk = await healthConnect.getSdkStatus(); if (sdk !== healthConnect.SdkAvailabilityStatus.SDK_AVAILABLE) return 'unavailable'; return (await healthConnect.initialize()) ? 'needs-permission' : 'error'; } catch { return 'error'; } }
  async requestReadPermissions(): Promise<{ status: HealthConnectStatus; granted: number }> { const healthConnect = nativeModule(); if (!healthConnect) return { status: 'unsupported', granted: 0 }; try { const sdk = await healthConnect.getSdkStatus(); if (sdk !== healthConnect.SdkAvailabilityStatus.SDK_AVAILABLE) return { status: 'unavailable', granted: 0 }; await healthConnect.initialize(); const granted = await healthConnect.requestPermission(READ_PERMISSIONS); return { status: granted.length === READ_PERMISSIONS.length ? 'connected' : granted.length > 0 ? 'needs-permission' : 'needs-permission', granted: granted.length }; } catch { return { status: 'error', granted: 0 }; } }
  async openHealthConnectSettings(): Promise<void> { if (Platform.OS === 'android') await Linking.openURL('package:com.google.android.apps.healthdata'); }
  async readToday(): Promise<HealthSummary> { const healthConnect = nativeModule(); const empty: HealthSummary = { status: 'unsupported', steps: null, heartRate: null, restingHeartRate: null, sleepMinutes: null, exerciseMinutes: null, calories: null, distanceMeters: null, hrv: null, lastSyncedAt: null }; if (!healthConnect) return empty; try { const sdk = await healthConnect.getSdkStatus(); if (sdk !== healthConnect.SdkAvailabilityStatus.SDK_AVAILABLE) return { ...empty, status: 'unavailable' }; await healthConnect.initialize(); const r = range(); const [steps, heart, resting, sleep, exercise, calories, distance, hrv] = await Promise.all([
      healthConnect.readRecords('Steps', { timeRangeFilter: { operator: 'between', ...r } }), healthConnect.readRecords('HeartRate', { timeRangeFilter: { operator: 'between', ...r } }), healthConnect.readRecords('RestingHeartRate', { timeRangeFilter: { operator: 'between', ...r } }), healthConnect.readRecords('SleepSession', { timeRangeFilter: { operator: 'between', ...r } }), healthConnect.readRecords('ExerciseSession', { timeRangeFilter: { operator: 'between', ...r } }), healthConnect.readRecords('ActiveCaloriesBurned', { timeRangeFilter: { operator: 'between', ...r } }), healthConnect.readRecords('Distance', { timeRangeFilter: { operator: 'between', ...r } }), healthConnect.readRecords('HeartRateVariabilityRmssd', { timeRangeFilter: { operator: 'between', ...r } }),
    ]);
    const latestSample = (records: unknown[]) => records.flatMap((record) => { const samples = valueOf(record, ['samples']); return Array.isArray(samples) ? samples : []; }).map((sample) => valueOf(sample, ['beatsPerMinute']) ?? valueOf(sample, ['heartRateVariabilityMillis'])).filter((v): v is number => v !== null).at(-1) ?? null;
    const duration = (records: unknown[]) => records.reduce<number>((total, record) => { const start = valueOf(record, ['startTime']); const end = valueOf(record, ['endTime']); return total + (start && end ? Math.max(0, (new Date(String(end)).getTime() - new Date(String(start)).getTime()) / 60000) : 0); }, 0);
    const totalValue = (records: unknown[], path: string[]) => records.reduce<number>((total, record) => total + (valueOf(record, path) ?? 0), 0) || null;
    return { status: 'connected', steps: totalValue(steps.records, ['count']), heartRate: latestSample(heart.records), restingHeartRate: latestSample(resting.records), sleepMinutes: duration(sleep.records) || null, exerciseMinutes: duration(exercise.records) || null, calories: totalValue(calories.records, ['energy', 'inKilocalories']), distanceMeters: totalValue(distance.records, ['distance', 'inMeters']), hrv: latestSample(hrv.records), lastSyncedAt: new Date().toISOString() };
  } catch { return { ...empty, status: 'error' }; } }
}
export const healthConnectManager = new HealthConnectManager();
