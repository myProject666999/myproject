import { create } from 'zustand';
import dayjs from 'dayjs';
import * as mealsApi from '../api/meals';
import * as exercisesApi from '../api/exercises';
import * as foodsApi from '../api/foods';
import * as statsApi from '../api/stats';
import * as weightsApi from '../api/weights';
import type {
  MealRecord,
  ExerciseRecord,
  Food,
  ExerciseType,
  DailyStat,
  TrendData,
  WeightTrendData,
  AddMealRequest,
  UpdateMealRequest,
  AddExerciseRequest,
  UpdateExerciseRequest,
  AddWeightRequest,
  WeightRecord,
} from '../types';

interface DataState {
  todayMeals: MealRecord[];
  todayExercises: ExerciseRecord[];
  dailyStats: DailyStat | null;
  trendData: TrendData[];
  weightTrend: WeightTrendData[];
  weightRecords: WeightRecord[];
  foods: Food[];
  exerciseTypes: ExerciseType[];
  loading: boolean;
  error: string | null;

  fetchTodayData: (date?: string) => Promise<void>;
  fetchTrendData: (days?: number) => Promise<void>;
  fetchFoods: (keyword?: string, category?: string) => Promise<void>;
  fetchExerciseTypes: () => Promise<void>;
  fetchWeightRecords: () => Promise<void>;

  addMeal: (data: AddMealRequest) => Promise<void>;
  updateMeal: (id: number, data: UpdateMealRequest) => Promise<void>;
  deleteMeal: (id: number) => Promise<void>;

  addExercise: (data: AddExerciseRequest) => Promise<void>;
  updateExercise: (id: number, data: UpdateExerciseRequest) => Promise<void>;
  deleteExercise: (id: number) => Promise<void>;

  addWeight: (data: AddWeightRequest) => Promise<void>;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useDataStore = create<DataState>((set, get) => ({
  todayMeals: [],
  todayExercises: [],
  dailyStats: null,
  trendData: [],
  weightTrend: [],
  weightRecords: [],
  foods: [],
  exerciseTypes: [],
  loading: false,
  error: null,

  fetchTodayData: async (date?: string) => {
    const targetDate = date || dayjs().format('YYYY-MM-DD');
    set({ loading: true, error: null });
    try {
      const [mealsRes, exercisesRes, statsRes] = await Promise.all([
        mealsApi.getMeals({ date: targetDate }),
        exercisesApi.getExercises({ date: targetDate }),
        statsApi.getDailyStats({ date: targetDate }),
      ]);

      set({
        todayMeals: mealsRes.success && mealsRes.data ? mealsRes.data : [],
        todayExercises: exercisesRes.success && exercisesRes.data ? exercisesRes.data : [],
        dailyStats: statsRes.success && statsRes.data ? statsRes.data : null,
      });
    } catch (error: any) {
      set({ error: error.message || '获取今日数据失败' });
    } finally {
      set({ loading: false });
    }
  },

  fetchTrendData: async (days?: number) => {
    set({ loading: true, error: null });
    try {
      const response = await statsApi.getTrendStats({ days });
      if (response.success && response.data) {
        set({
          trendData: response.data.calorieTrend || [],
          weightTrend: response.data.weightTrend || [],
        });
      }
    } catch (error: any) {
      set({ error: error.message || '获取趋势数据失败' });
    } finally {
      set({ loading: false });
    }
  },

  fetchFoods: async (keyword?: string, category?: string) => {
    set({ loading: true, error: null });
    try {
      const response = await foodsApi.getFoods({ keyword, category });
      set({
        foods: response.success && response.data ? response.data : [],
      });
    } catch (error: any) {
      set({ error: error.message || '获取食物列表失败' });
    } finally {
      set({ loading: false });
    }
  },

  fetchExerciseTypes: async () => {
    set({ loading: true, error: null });
    try {
      const response = await exercisesApi.getExerciseTypes();
      set({
        exerciseTypes: response.success && response.data ? response.data : [],
      });
    } catch (error: any) {
      set({ error: error.message || '获取运动类型失败' });
    } finally {
      set({ loading: false });
    }
  },

  fetchWeightRecords: async () => {
    set({ loading: true, error: null });
    try {
      const response = await weightsApi.getWeights();
      set({
        weightRecords: response.success && response.data ? response.data : [],
      });
    } catch (error: any) {
      set({ error: error.message || '获取体重记录失败' });
    } finally {
      set({ loading: false });
    }
  },

  addMeal: async (data: AddMealRequest) => {
    set({ loading: true, error: null });
    try {
      const response = await mealsApi.addMeal(data);
      if (response.success && response.data) {
        set((state) => ({
          todayMeals: [...state.todayMeals, response.data!],
        }));
        const statsRes = await statsApi.getDailyStats({ date: data.record_date });
        if (statsRes.success && statsRes.data) {
          set({ dailyStats: statsRes.data });
        }
      }
    } catch (error: any) {
      set({ error: error.message || '添加饮食记录失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateMeal: async (id: number, data: UpdateMealRequest) => {
    set({ loading: true, error: null });
    try {
      const response = await mealsApi.updateMeal(id, data);
      if (response.success && response.data) {
        set((state) => ({
          todayMeals: state.todayMeals.map((meal) =>
            meal.id === id ? response.data! : meal
          ),
        }));
        const meal = get().todayMeals.find((m) => m.id === id);
        if (meal) {
          const statsRes = await statsApi.getDailyStats({ date: meal.record_date });
          if (statsRes.success && statsRes.data) {
            set({ dailyStats: statsRes.data });
          }
        }
      }
    } catch (error: any) {
      set({ error: error.message || '更新饮食记录失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteMeal: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const meal = get().todayMeals.find((m) => m.id === id);
      const recordDate = meal?.record_date;
      const response = await mealsApi.deleteMeal(id);
      if (response.success) {
        set((state) => ({
          todayMeals: state.todayMeals.filter((meal) => meal.id !== id),
        }));
        if (recordDate) {
          const statsRes = await statsApi.getDailyStats({ date: recordDate });
          if (statsRes.success && statsRes.data) {
            set({ dailyStats: statsRes.data });
          }
        }
      }
    } catch (error: any) {
      set({ error: error.message || '删除饮食记录失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  addExercise: async (data: AddExerciseRequest) => {
    set({ loading: true, error: null });
    try {
      const response = await exercisesApi.addExercise(data);
      if (response.success && response.data) {
        set((state) => ({
          todayExercises: [...state.todayExercises, response.data!],
        }));
        const statsRes = await statsApi.getDailyStats({ date: data.record_date });
        if (statsRes.success && statsRes.data) {
          set({ dailyStats: statsRes.data });
        }
      }
    } catch (error: any) {
      set({ error: error.message || '添加运动记录失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateExercise: async (id: number, data: UpdateExerciseRequest) => {
    set({ loading: true, error: null });
    try {
      const response = await exercisesApi.updateExercise(id, data);
      if (response.success && response.data) {
        set((state) => ({
          todayExercises: state.todayExercises.map((exercise) =>
            exercise.id === id ? response.data! : exercise
          ),
        }));
        const exercise = get().todayExercises.find((e) => e.id === id);
        if (exercise) {
          const statsRes = await statsApi.getDailyStats({ date: exercise.record_date });
          if (statsRes.success && statsRes.data) {
            set({ dailyStats: statsRes.data });
          }
        }
      }
    } catch (error: any) {
      set({ error: error.message || '更新运动记录失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteExercise: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const exercise = get().todayExercises.find((e) => e.id === id);
      const recordDate = exercise?.record_date;
      const response = await exercisesApi.deleteExercise(id);
      if (response.success) {
        set((state) => ({
          todayExercises: state.todayExercises.filter((exercise) => exercise.id !== id),
        }));
        if (recordDate) {
          const statsRes = await statsApi.getDailyStats({ date: recordDate });
          if (statsRes.success && statsRes.data) {
            set({ dailyStats: statsRes.data });
          }
        }
      }
    } catch (error: any) {
      set({ error: error.message || '删除运动记录失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  addWeight: async (data: AddWeightRequest) => {
    set({ loading: true, error: null });
    try {
      const response = await weightsApi.addWeight(data);
      if (response.success && response.data) {
        set((state) => ({
          weightRecords: [...state.weightRecords, response.data!],
        }));
      }
    } catch (error: any) {
      set({ error: error.message || '添加体重记录失败' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
