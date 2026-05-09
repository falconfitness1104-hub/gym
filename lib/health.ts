import { Platform } from 'react-native';
import HealthKit, { HKQuantityTypeIdentifier, HKStatisticsOptions } from '@kingstinct/react-native-healthkit';
import { initialize, requestPermission, readRecords } from 'react-native-health-connect';
import { supabase } from './supabase';

export const syncHealthData = async (userId: string) => {
  if (Platform.OS === 'web') return;

  try {
    if (Platform.OS === 'ios') {
      await syncAppleHealth(userId);
    } else if (Platform.OS === 'android') {
      await syncAndroidHealth(userId);
    }
  } catch (error) {
    console.error('Health sync failed:', error);
  }
};

const syncAndroidHealth = async (userId: string) => {
  try {
    const isInitialized = await initialize();
    if (!isInitialized) return;

    // Request Permissions
    await requestPermission([
      { accessType: 'read', recordType: 'Steps' },
      { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
    ]);

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Fetch Steps
    const stepsRecords = await readRecords('Steps', {
      timeRangeFilter: {
        operator: 'between',
        startTime: startOfDay.toISOString(),
        endTime: now.toISOString(),
      },
    });

    // Fetch Calories
    const caloriesRecords = await readRecords('ActiveCaloriesBurned', {
      timeRangeFilter: {
        operator: 'between',
        startTime: startOfDay.toISOString(),
        endTime: now.toISOString(),
      },
    });

    const totalSteps = stepsRecords.records.reduce((sum, r) => sum + (r.count || 0), 0);
    const totalCalories = caloriesRecords.records.reduce((sum, r) => sum + (r.energy?.inKilocalories || 0), 0);

    // Sync to Supabase
    const { error } = await supabase.from('health_metrics').upsert({
      user_id: userId,
      date: startOfDay.toISOString().split('T')[0],
      steps: Math.round(totalSteps),
      calories_burned: Math.round(totalCalories),
      source: 'google_health',
      updated_at: new Date(),
    }, {
      onConflict: 'user_id,date'
    });

    if (error) throw error;
  } catch (e) {
    console.error('Android Health Sync Error:', e);
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
