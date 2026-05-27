<template>
  <div class="page-container">
    <div class="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-6 pb-12 rounded-b-3xl">
      <h1 class="text-2xl font-bold mb-1">今日训练</h1>
      <p class="text-primary-100 text-sm">{{ todayStr }}</p>
    </div>

    <div class="px-4 -mt-8">
      <div class="card animate-slide-up">
        <div v-if="!todayCheckIn" class="text-center py-6">
          <div class="text-5xl mb-4">💪</div>
          <h2 class="text-xl font-bold mb-2">选择训练计划</h2>
          <p class="text-gray-500 mb-6">选择一个计划开始今日训练</p>
          
          <div class="space-y-3">
            <div
              v-for="plan in plans"
              :key="plan.id"
              @click="startTraining(plan)"
              class="p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <h3 class="font-semibold">{{ plan.name }}</h3>
              <p class="text-sm text-gray-500">{{ plan.exercises.length }} 个动作</p>
            </div>
          </div>

          <button
            @click="openCustomExercise"
            class="btn-secondary w-full mt-4"
          >
            自定义训练
          </button>
        </div>

        <div v-else-if="!isCheckedIn" class="py-2">
          <h2 class="font-bold text-lg mb-4">{{ currentPlanName }}</h2>
          
          <div class="space-y-3 mb-6">
            <div
              v-for="(ex, index) in todayExercises"
              :key="index"
              class="p-4 bg-gray-50 rounded-xl"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium">{{ ex.exercise }}</span>
                <input
                  type="checkbox"
                  v-model="ex.completed"
                  class="w-5 h-5 accent-primary-500"
                />
              </div>
              <div class="grid grid-cols-3 gap-2">
                <div>
                  <label class="text-xs text-gray-500">组数</label>
                  <input
                    v-model.number="ex.sets"
                    type="number"
                    class="w-full px-2 py-1 border rounded-lg text-center"
                  />
                </div>
                <div>
                  <label class="text-xs text-gray-500">次数</label>
                  <input
                    v-model.number="ex.reps"
                    type="number"
                    class="w-full px-2 py-1 border rounded-lg text-center"
                  />
                </div>
                <div>
                  <label class="text-xs text-gray-500">重量(kg)</label>
                  <input
                    v-model.number="ex.weight"
                    type="number"
                    step="0.5"
                    class="w-full px-2 py-1 border rounded-lg text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">训练备注</label>
            <textarea
              v-model="checkInNote"
              class="input-field"
              rows="2"
              placeholder="记录今天的训练感受..."
            ></textarea>
          </div>

          <button
            @click="submitCheckIn"
            :disabled="submitting"
            class="btn-primary w-full"
          >
            {{ submitting ? '提交中...' : '完成打卡 ✓' }}
          </button>
        </div>

        <div v-else class="text-center py-8">
          <div class="text-5xl mb-4">🎉</div>
          <h2 class="text-xl font-bold mb-2">今日已完成打卡！</h2>
          <p class="text-gray-500 mb-6">继续保持，你真棒！</p>
          
          <div class="bg-gray-50 rounded-xl p-4 text-left">
            <h3 class="font-semibold mb-3">训练内容</h3>
            <div class="space-y-2">
              <div
                v-for="(ex, index) in todayCheckIn.exercises"
                :key="index"
                class="flex justify-between text-sm"
              >
                <span>{{ ex.exercise }}</span>
                <span class="text-gray-500">{{ ex.sets }}组 × {{ ex.reps }}次 × {{ ex.weight }}kg</span>
              </div>
            </div>
            <div v-if="todayCheckIn.note" class="mt-3 pt-3 border-t text-sm text-gray-500">
              备注：{{ todayCheckIn.note }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showCustomExercise" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col justify-end">
      <div class="bg-white rounded-t-2xl max-h-[85vh] flex flex-col">
        <div class="flex justify-between items-center p-4 pb-2 border-b flex-shrink-0">
          <h3 class="font-bold text-lg">选择动作</h3>
          <button @click="showCustomExercise = false" class="text-gray-400 text-2xl">&times;</button>
        </div>
        
        <div class="flex gap-2 px-4 py-3 overflow-x-auto flex-shrink-0">
          <button
            v-for="cat in categories"
            :key="cat"
            @click="selectedCategory = cat"
            class="px-4 py-2 rounded-full text-sm whitespace-nowrap"
            :class="selectedCategory === cat ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'"
          >
            {{ cat }}
          </button>
        </div>
        
        <div class="px-4 space-y-2 overflow-y-auto flex-1">
          <div
            v-for="ex in filteredExercises"
            :key="ex.id"
            @click="addExercise(ex)"
            class="p-3 border rounded-lg flex justify-between items-center cursor-pointer hover:border-primary-500 active:bg-primary-50"
          >
            <span>{{ ex.name }}</span>
            <span class="text-sm text-gray-400">{{ ex.category }}</span>
          </div>
        </div>

        <div v-if="todayExercises.length > 0" class="border-t p-4 flex-shrink-0 bg-white">
          <h4 class="font-medium mb-2">已选动作 ({{ todayExercises.length }})</h4>
          <div class="space-y-2 mb-3 max-h-24 overflow-y-auto">
            <div
              v-for="(ex, index) in todayExercises"
              :key="index"
              class="flex justify-between items-center p-2 bg-gray-50 rounded-lg"
            >
              <span>{{ ex.exercise }}</span>
              <button @click="removeExercise(index)" class="text-red-500 text-sm">删除</button>
            </div>
          </div>
          <button @click="confirmCustomTraining" class="btn-primary w-full">
            开始训练
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { checkInApi, planApi, exerciseApi } from '../api'
import { useRouter } from 'vue-router'

const router = useRouter()
const todayCheckIn = ref(null)
const todayExercises = ref([])
const currentPlanName = ref('')
const isCheckedIn = ref(false)
const checkInNote = ref('')
const submitting = ref(false)
const plans = ref([])
const exercises = ref([])
const showCustomExercise = ref(false)
const selectedCategory = ref('全部')

const categories = computed(() => {
  const cats = ['全部', ...new Set(exercises.value.map(e => e.category))]
  return cats
})

const filteredExercises = computed(() => {
  if (selectedCategory.value === '全部') return exercises.value
  return exercises.value.filter(e => e.category === selectedCategory.value)
})

const todayStr = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`
})

const startTraining = (plan) => {
  currentPlanName.value = plan.name
  todayExercises.value = plan.exercises.map(ex => ({
    exercise: ex.exercise,
    sets: ex.sets,
    reps: ex.reps,
    weight: ex.weight,
    completed: false
  }))
  todayCheckIn.value = {}
}

const addExercise = (ex) => {
  todayExercises.value.push({
    exercise: ex.name,
    sets: 3,
    reps: 10,
    weight: 0,
    completed: false
  })
}

const removeExercise = (index) => {
  todayExercises.value.splice(index, 1)
}

const openCustomExercise = () => {
  todayExercises.value = []
  todayCheckIn.value = {}
  showCustomExercise.value = true
}

const confirmCustomTraining = () => {
  currentPlanName.value = '自定义训练'
  showCustomExercise.value = false
}

const submitCheckIn = async () => {
  submitting.value = true
  try {
    await checkInApi.create({
      date: '',
      completed: true,
      note: checkInNote.value,
      exercises: todayExercises.value
    })
    isCheckedIn.value = true
    todayCheckIn.value = {
      exercises: todayExercises.value,
      note: checkInNote.value
    }
  } catch (e) {
    alert('打卡失败，请重试')
  }
  submitting.value = false
}

const loadData = async () => {
  try {
    const [todayRes, plansRes, exRes] = await Promise.all([
      checkInApi.getToday().catch(() => ({ data: null })),
      planApi.getAll().catch(() => ({ data: [] })),
      exerciseApi.getAll().catch(() => ({ data: [] }))
    ])
    if (todayRes.data) {
      todayCheckIn.value = todayRes.data
      todayExercises.value = todayRes.data.exercises || []
      isCheckedIn.value = true
    }
    plans.value = plansRes.data || []
    exercises.value = exRes.data || []
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadData()
})
</script>
