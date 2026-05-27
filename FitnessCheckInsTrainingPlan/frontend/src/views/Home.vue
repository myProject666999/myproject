<template>
  <div class="page-container">
    <div class="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-6 pb-12 rounded-b-3xl">
      <h1 class="text-2xl font-bold mb-1">健身打卡</h1>
      <p class="text-primary-100 text-sm">{{ todayStr }}</p>
    </div>

    <div class="px-4 -mt-8">
      <div class="card animate-slide-up">
        <div class="flex justify-between items-center mb-4">
          <h2 class="font-bold text-lg">今日状态</h2>
          <span
            class="px-3 py-1 rounded-full text-sm"
            :class="todayCheckedIn ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'"
          >
            {{ todayCheckedIn ? '已打卡 ✓' : '未打卡' }}
          </span>
        </div>
        <div class="grid grid-cols-3 gap-4 text-center">
          <div class="bg-gray-50 rounded-xl p-3">
            <div class="text-2xl font-bold text-primary-500">{{ stats.currentStreak }}</div>
            <div class="text-xs text-gray-500">连续打卡</div>
          </div>
          <div class="bg-gray-50 rounded-xl p-3">
            <div class="text-2xl font-bold text-accent-500">{{ stats.totalCheckIns }}</div>
            <div class="text-xs text-gray-500">累计打卡</div>
          </div>
          <div class="bg-gray-50 rounded-xl p-3">
            <div class="text-2xl font-bold text-blue-500">{{ stats.longestStreak }}</div>
            <div class="text-xs text-gray-500">最长连续</div>
          </div>
        </div>
        <router-link
          to="/today"
          class="btn-primary w-full text-center block mt-4"
        >
          {{ todayCheckedIn ? '查看今日训练' : '开始今日训练' }}
        </router-link>
      </div>
    </div>

    <div class="px-4 mt-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="font-bold text-lg">我的成就</h2>
        <router-link to="/achievements" class="text-primary-500 text-sm">查看全部</router-link>
      </div>
      <div class="flex gap-3 overflow-x-auto pb-2">
        <div
          v-for="achievement in unlockedAchievements"
          :key="achievement.id"
          class="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl flex flex-col items-center justify-center text-white"
        >
          <span class="text-2xl">{{ achievement.badge }}</span>
          <span class="text-xs mt-1">{{ achievement.name }}</span>
        </div>
        <div
          v-if="unlockedAchievements.length === 0"
          class="w-full bg-gray-50 rounded-xl p-6 text-center text-gray-400"
        >
          还没有成就，开始训练解锁吧！
        </div>
      </div>
    </div>

    <div class="px-4 mt-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="font-bold text-lg">训练计划</h2>
        <router-link to="/plans" class="text-primary-500 text-sm">管理</router-link>
      </div>
      <div class="space-y-3">
        <router-link
          v-for="plan in plans"
          :key="plan.id"
          :to="`/plan/edit/${plan.id}`"
          class="card flex items-center justify-between hover:shadow-md transition-shadow"
        >
          <div>
            <h3 class="font-semibold">{{ plan.name }}</h3>
            <p class="text-sm text-gray-500">{{ plan.exercises.length }} 个动作</p>
          </div>
          <span class="text-gray-400">›</span>
        </router-link>
        <router-link
          to="/plan/edit"
          class="card border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-primary-300 hover:text-primary-500 transition-colors"
        >
          <span class="mr-2">+</span>
          <span>新建训练计划</span>
        </router-link>
      </div>
    </div>

    <div class="px-4 mt-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="font-bold text-lg">快捷入口</h2>
      </div>
      <div class="grid grid-cols-4 gap-3">
        <router-link to="/exercises" class="flex flex-col items-center">
          <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl mb-1">
            💪
          </div>
          <span class="text-xs text-gray-600">动作库</span>
        </router-link>
        <router-link to="/today" class="flex flex-col items-center">
          <div class="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-2xl mb-1">
            ✅
          </div>
          <span class="text-xs text-gray-600">打卡</span>
        </router-link>
        <router-link to="/stats" class="flex flex-col items-center">
          <div class="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-2xl mb-1">
            📈
          </div>
          <span class="text-xs text-gray-600">曲线</span>
        </router-link>
        <router-link to="/achievements" class="flex flex-col items-center">
          <div class="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-2xl mb-1">
            🏆
          </div>
          <span class="text-xs text-gray-600">成就</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { statsApi, achievementApi, planApi, checkInApi } from '../api'

const stats = ref({
  totalCheckIns: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalWeightLifted: 0
})

const achievements = ref([])
const plans = ref([])
const todayCheckedIn = ref(false)

const todayStr = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 星期${'日一二三四五六'[now.getDay()]}`
})

const unlockedAchievements = computed(() => {
  return achievements.value.filter(a => a.unlocked).slice(0, 5)
})

const loadData = async () => {
  try {
    const [statsRes, achievementsRes, plansRes, todayRes] = await Promise.all([
      statsApi.get().catch(() => ({ data: null })),
      achievementApi.getAll().catch(() => ({ data: [] })),
      planApi.getAll().catch(() => ({ data: [] })),
      checkInApi.getToday().catch(() => ({ data: null }))
    ])
    const data = statsRes.data || {}
    stats.value = {
      totalCheckIns: Number(data.totalCheckIns) || 0,
      currentStreak: Number(data.currentStreak) || 0,
      longestStreak: Number(data.longestStreak) || 0,
      totalWeightLifted: Number(data.totalWeightLifted) || 0
    }
    achievements.value = achievementsRes.data || []
    plans.value = plansRes.data || []
    todayCheckedIn.value = !!todayRes.data
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadData()
})
</script>
