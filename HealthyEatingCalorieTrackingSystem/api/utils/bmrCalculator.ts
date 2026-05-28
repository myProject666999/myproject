const activityMultipliers: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const calculateBMR = (
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female',
  formula: 'mifflin_st_jeor' | 'harris_benedict' = 'mifflin_st_jeor'
): number => {
  if (formula === 'mifflin_st_jeor') {
    const base = 10 * weight + 6.25 * height - 5 * age;
    return gender === 'male' ? base + 5 : base - 161;
  } else {
    if (gender === 'male') {
      return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
    } else {
      return 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
    }
  }
};

export const calculateTDEE = (
  bmr: number,
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
): number => {
  const multiplier = activityMultipliers[activityLevel] || 1.2;
  return bmr * multiplier;
};

export const calculateCalorieGoal = (
  tdee: number,
  goalType: 'lose_weight' | 'maintain' | 'gain_weight'
): number => {
  switch (goalType) {
    case 'lose_weight':
      return Math.round(tdee - 400);
    case 'gain_weight':
      return Math.round(tdee + 400);
    case 'maintain':
    default:
      return Math.round(tdee);
  }
};

export const getActivityMultiplier = (
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
): number => {
  return activityMultipliers[activityLevel] || 1.2;
};
