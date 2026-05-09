import { Platform } from 'react-native';
import HealthKit, { HKQuantityTypeIdentifier, HKStatisticsOptions } from '@kingstinct/react-native-healthkit';
import { supabase } from './supabase';

export const syncHealthData = async (userId: string) => {
  if (Platform.OS === 'web') return;

  try {
    if (Platform.OS === 'ios') {
      await syncAppleHealth(userId);
    } else if (Platform.OS === 'android') {
      // Android Health Connect implementation would go here
      // For now we focus on the structure
    }
  } catch (error) {
    console.error('Health sync failed:', error);
  }
};

const syncAppleHealth = async (userId: string) => {
  const isAvailable = await HealthKit.isHealthDataAvailable();
  if (!isAvailable) return;

  // Request Permissions
  const permissions = [
    HKQuantityTypeIdentifier.stepCount,
    HKQuantityTypeIdentifier.activeEnergyBurned,
    HKQuantityTypeIdentifier.distanceWalkingRunning,
    HKQuantityTypeIdentifier.heartRate,
  ];

  await HealthKit.requestAuthorization(permissions, []);

  // Fetch Steps for today
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const steps = await HealthKit.getStatistics({
    type: HKQuantityTypeIdentifier.stepCount,
    startDate: startOfDay,
    endDate: now,
    options: [HKStatisticsOptions.cumulativeSum],
  });

  const calories = await HealthKit.getStatistics({
    type: HKQuantityTypeIdentifier.activeEnergyBurned,
    startDate: startOfDay,
    endDate: now,
    options: [HKStatisticsOptions.cumulativeSum],
  });

  const stepCount = steps.cumulativeSum?.quantity || 0;
  const caloriesBurned = calories.cumulativeSum?.quantity || 0;

  // Sync to Supabase
  const { error } = await supabase.from('health_metrics').upsert({
    user_id: userId,
    date: startOfDay.toISOString().split('T')[0],
    steps: Math.round(stepCount),
    calories_burned: Math.round(caloriesBurned),
    source: 'apple_health',
    updated_at: new Date(),
  }, {
    onConflict: 'user_id,date'
  });

  if (error) throw error;
};
