// Core domain types for WaterFastBuddy

export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type ClimateType = 'hot' | 'temperate' | 'cold';
export type Theme = 'light' | 'dark';
export type Language = 'en' | 'es' | 'fr' | 'hi' | 'zh';

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  climateType: ClimateType;
  goalWeightKg: number;
  onboardingComplete: boolean;
  createdAt: string;
}

export interface FastRecord {
  id: string;
  startTime: string;        // ISO timestamp
  endTime: string;          // ISO timestamp
  targetHours: number;
  actualHours: number;
  completed: boolean;       // true = reached target
  notes?: string;
}

export interface WeightEntry {
  id: string;
  date: string;             // YYYY-MM-DD
  weightKg: number;
}

export interface SavedFast {
  id: string;
  name: string;
  targetHours: number;
  description?: string;
  isPreset: boolean;        // client-supplied presets vs user custom
}

export interface AppSettings {
  theme: Theme;
  language: Language;
  trialStartDate: string;   // ISO timestamp of first install
  subscriptionActive: boolean;
}

export interface ActiveFast {
  id: string;
  startTime: string;
  targetHours: number;
}

// BMI helpers
export type BmiCategory = 'underweight' | 'normal' | 'overweight' | 'obese';

export interface BmiResult {
  value: number;
  category: BmiCategory;
}
