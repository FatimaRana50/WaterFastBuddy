// BMI and TDEE (Mifflin-St Jeor) calculation utilities
import { BmiCategory, BmiResult, ActivityLevel, Gender } from '../types';

export function calculateBmi(weightKg: number, heightCm: number): BmiResult {
  const heightM = heightCm / 100;
  const value = parseFloat((weightKg / (heightM * heightM)).toFixed(1));
  let category: BmiCategory;
  if (value < 18.5) category = 'underweight';
  else if (value < 25) category = 'normal';
  else if (value < 30) category = 'overweight';
  else category = 'obese';
  return { value, category };
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// Mifflin-St Jeor equation — client can supply alternate formula later
export function calculateTDEE(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender,
  activityLevel: ActivityLevel,
): number {
  const bmr =
    gender === 'male'
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

export function goalWeightForBmi(bmiTarget: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return parseFloat((bmiTarget * heightM * heightM).toFixed(1));
}
