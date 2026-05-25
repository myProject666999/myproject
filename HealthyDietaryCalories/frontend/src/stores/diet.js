import { defineStore } from 'pinia'
import { dailyApi, mealApi } from '../api'

export const useDietStore = defineStore('diet', {
  state: () => ({
    currentDate: new Date().toISOString().split('T')[0],
    dailySummary: null,
    dailyGoal: null,
    meals: [],
    loading: false
  }),

  actions: {
    async fetchDailySummary() {
      this.loading = true
      try {
        this.dailySummary = await dailyApi.getSummary(this.currentDate)
      } catch (e) {
        console.error('获取每日摘要失败:', e)
      } finally {
        this.loading = false
      }
    },

    async fetchDailyGoal() {
      try {
        this.dailyGoal = await dailyApi.getGoal(this.currentDate)
      } catch (e) {
        console.error('获取每日目标失败:', e)
      }
    },

    async fetchMeals() {
      try {
        this.meals = await mealApi.getByDate(this.currentDate)
      } catch (e) {
        console.error('获取餐食记录失败:', e)
      }
    },

    async addMealItem(mealId, item) {
      try {
        await mealApi.addItem(mealId, item)
        await this.fetchDailySummary()
        await this.fetchMeals()
      } catch (e) {
        console.error('添加食物失败:', e)
        throw e
      }
    },

    async updateMealItem(itemId, item) {
      try {
        await mealApi.updateItem(itemId, item)
        await this.fetchDailySummary()
        await this.fetchMeals()
      } catch (e) {
        console.error('更新食物失败:', e)
        throw e
      }
    },

    async deleteMealItem(itemId) {
      try {
        await mealApi.deleteItem(itemId)
        await this.fetchDailySummary()
        await this.fetchMeals()
      } catch (e) {
        console.error('删除食物失败:', e)
        throw e
      }
    },

    async createMeal(mealData) {
      try {
        const result = await mealApi.create(mealData)
        await this.fetchDailySummary()
        await this.fetchMeals()
        return result
      } catch (e) {
        console.error('创建餐食失败:', e)
        throw e
      }
    },

    async setGoal(goalData) {
      try {
        await dailyApi.setGoal(goalData)
        await this.fetchDailyGoal()
      } catch (e) {
        console.error('设置目标失败:', e)
        throw e
      }
    },

    setDate(date) {
      this.currentDate = date
      this.fetchDailySummary()
      this.fetchDailyGoal()
      this.fetchMeals()
    }
  }
})
