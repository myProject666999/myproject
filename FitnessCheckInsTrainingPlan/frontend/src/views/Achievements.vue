<template>
  <div class="page-container">
    <div class="bg-gradient-to-br from-yellow-400 to-orange-500 text-white p-6 pb-12 rounded-b-3xl">
      <h1 class="text-2xl font-bold mb-1">我的成就</h1>
      <p class="text-yellow-100 text-sm">已解锁 {{ unlockedCount }} / {{ achievements.length }}</p>
    </div>

    <div class="px-4 -mt-8">
      <div class="card animate-slide-up">
        <div class="grid grid-cols-3 gap-4">
          <div
            v-for="achievement in achievements"
            :key="achievement.id"
            class="flex flex-col items-center p-4 rounded-xl transition-all"
            :class="achievement.unlocked ? 'bg-gradient-to-br from-yellow-50 to-orange-50' : 'bg-gray-50 opacity-60'"
          >
            <div
              class="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-2"
              :class="achievement.unlocked ? 'bg-gradient-to-br from-yellow-400 to-orange-400' : 'bg-gray-200'"
            >
              {{ achievement.unlocked ? achievement.badge : '🔒' }}
            </div>
            <h3 class="font-semibold text-sm text-center">{{ achievement.name }}</h3>
            <p class="text-xs text-gray-500 text-center mt-1">{{ achievement.description }}</p>
            <span
              v-if="achievement.unlocked && achievement.unlockedAt"
              class="text-xs text-primary-500 mt-2"
            >
              {{ achievement.unlockedAt }} 解锁
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="px-4 mt-6">
      <div class="card">
        <h3 class="font-bold mb-4">统计数据</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">总打卡次数</span>
            <span class="font-bold text-lg">{{ stats.totalCheckIns }} 次</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">当前连续打卡</span>
            <span class="font-bold text-lg text-primary-500">{{ stats.currentStreak }} 天</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">最长连续打卡</span>
            <span class="font-bold text-lg text-accent-500">{{ stats.longestStreak }} 天</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">累计举重</span>
            <span class="font-bold text-lg">{{ formatWeight(stats.totalWeightLifted) }} kg</span>
          </div>
        </div>
      </div>
    </div>

    <div class="px-4 mt-6">
      <div class="card">
        <h3 class="font-bold mb-4">下一个成就</h3>
        <div v-if="nextAchievement" class="flex items-center">
          <div class="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center text-2xl mr-4">
            🔒
          </div>
          <div class="flex-1">
            <h4 class="font-semibold">{{ nextAchievement.name }}</h4>
            <p class="text-sm text-gray-500">{{ nextAchievement.description }}</p>
            <div class="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all"
                :style="{ width: getProgress(nextAchievement) + '%' }"
              ></div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-4 text-gray-500">
          🎉 恭喜！你已解锁所有成就！
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { achievementApi, statsApi } from '../api'

const achievements = ref([])
const stats = ref({
  totalCheckIns: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalWeightLifted: 0
})

const unlockedCount = computed(() => {
  return achievements.value.filter(a => a.unlocked).length
})

const nextAchievement = computed(() => {
  return achievements.value.find(a => !a.unlocked)
})

const formatWeight = (weight) => {
  if (weight >= 10000) {
    return (weight / 1000).toFixed(1) + 'k'
  }
  return Math.round(weight).toLocaleString()
}

const getProgress = (achievement) => {
  const targetMap = {
    1: 1,
    2: 7,
    3: 30,
    4: 100,
    5: 1000,
    6: 10000
  }
  const target = targetMap[achievement.id] || 1
  
  if (achievement.id <= 4) {
    return Math.min(100, (stats.value.totalCheckIns / target) * 100)
  } else {
    return Math.min(100, (stats.value.totalWeightLifted / target) * 100)
  }
}

const loadData = async () => {
  try {
    const [achRes, statsRes] = await Promise.all([
      achievementApi.getAll(),
      statsApi.get()
    ])
    achievements.value = achRes.data
    stats.value = statsRes.data
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadData()
})
</script>
