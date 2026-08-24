import { Linking, Platform } from 'react-native';
import type { Permission, RecordType } from 'react-native-health-connect';

export type HealthConnectStatus = 'connected' | 'unavailable' | 'needs-permission' | 'unsupported' | 'error';
export type HealthMetricType = 'steps' | 'heartRate' | 'restingHeartRate' | 'sleep' | 'exercise' | 'calories' | 'distance' | 'hrv';

export interface HealthMetric {
  id: string;
  metricType: HealthMetricType;
  value: number;
  unit: string;
  timestamp: string;
  source: string;
}

const READ_PERMISSIONS: Permission[] = [
  { accessType: 'read', recordType: 'Steps' },
  { accessType: 'read', recordType: 'HeartRate' },
  { accessType: 'read', recordType: 'RestingHeartRate' },
  { accessType: 'read', recordType: 'SleepSession' },
  { accessType: 'read', recordType: 'ExerciseSession' },
  { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
  { accessType: 'read', recordType: 'Distance' },
  { accessType: 'read', recordType: 'HeartRateVariabilityRmssd' },
];

function nativeModule() {
  if (Platform.OS !== 'android') return null;
  return require('react-native-health-connect') as typeof import('react-native-health-connect');
}

export class HealthConnectManager {
  async getStatus(): Promise<HealthConnectStatus> {
    const healthConnect = nativeModule();
    if (!healthConnect) return 'unsupported';
    try {
      const sdkStatus = await healthConnect.getSdkStatus();
      if (sdkStatus !== healthConnect.SdkAvailabilityStatus.SDK_AVAILABLE) return 'unavailable';
      const initialized = await healthConnect.initialize();
      return initialized ? 'needs-permission' : 'error';
    } catch {
      return 'error';
    }
  }

  async requestReadPermissions(): Promise<{ status: HealthConnectStatus; granted: number }> {
    const healthConnect = nativeModule();
    if (!healthConnect) return { status: 'unsupported', granted: 0 };
    try {
      const sdkStatus = await healthConnect.getSdkStatus();
      if (sdkStatus !== healthConnect.SdkAvailabilityStatus.SDK_AVAILABLE) return { status: 'unavailable', granted: 0 };
      await healthConnect.initialize();
      const granted = await healthConnect.requestPermission(READ_PERMISSIONS);
      return { status: granted.length > 0 ? 'connected' : 'needs-permission', granted: granted.length };
    } catch {
      return { status: 'error', granted: 0 };
    }
  }

  async openHealthConnectSettings(): Promise<void> {
    if (Platform.OS === 'android') await Linking.openURL('package:com.google.android.apps.healthdata');
  }

  async readSteps(startTime: Date, endTime: Date): Promise<HealthMetric[]> {
    const healthConnect = nativeModule();
    if (!healthConnect) return [];
    const response = await healthConnect.readRecords('Steps', { timeRangeFilter: { operator: 'between', startTime: startTime.toISOString(), endTime: endTime.toISOString() } });
    return response.records.map((record) => ({
      id: record.metadata?.id ?? record.endTime,
      metricType: 'steps',
      value: record.count,
      unit: 'count',
      timestamp: record.endTime,
      source: record.metadata?.dataOrigin ?? 'Health Connect',
    }));
  }

  get requestedRecordTypes(): RecordType[] { return READ_PERMISSIONS.map((permission) => permission.recordType); }
}

export const healthConnectManager = new HealthConnectManager();