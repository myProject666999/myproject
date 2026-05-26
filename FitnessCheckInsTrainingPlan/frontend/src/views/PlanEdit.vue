<template>
  <div class="page-container">
    <div class="bg-white border-b border-gray-100 p-4 flex items-center">
      <button @click="$router.back()" class="text-gray-500 mr-4">← 取消</button>
      <h1 class="text-lg font-bold flex-1">{{ isEdit ? '编辑计划' : '新建计划' }}</h1>
      <button @click="savePlan" :disabled="saving" class="text-primary-500 font-medium">
        {{ saving ? '保存中...' : '保存' }}
      </button>
    </div>

    <div class="p-4">
      <div class="card mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">计划名称</label>
        <input
          v-model="planName"
          type="text"
          class="input-field"
          placeholder="例如：胸部训练日"
        />
      </div>

      <div class="card mb-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-semibold">训练动作</h3>
          <button
            @click="showExercisePicker = true"
            class="text-primary-500 text-sm"
          >
            + 添加动作
          </button>
        </div>

        <div v-if="exercises.length === 0" class="text-center py-8 text-gray-400">
          还没有添加动作
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="(ex, index) in exercises"
            :key="index"
            class="bg-gray-50 rounded-xl p-3"
          >
            <div class="flex justify-between items-center mb-2">
              <span class="font-medium">{{ ex.exercise }}</span>
              <button @click="removeExercise(index)" class="text-red-500 text-sm">删除</button>
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
      </div>

      <button
        v-if="isEdit"
        @click="deletePlan"
        class="w-full py-3 text-red-500 bg-red-50 rounded-xl"
      >
        删除此计划
      </button>
    </div>

    <div v-if="showExercisePicker" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div class="bg-white w-full rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-lg">选择动作</h3>
          <button @click="showExercisePicker = false" class="text-gray-400 text-2xl">&times;</button>
        </div>
        
        <div class="flex gap-2 mb-4 overflow-x-auto pb-2">
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
        
        <div class="space-y-2">
          <div
            v-for="ex in filteredExercises"
            :key="ex.id"
            @click="addExercise(ex)"
            class="p-3 border rounded-lg flex justify-between items-center cursor-pointer hover:border-primary-500"
          >
            <span>{{ ex.name }}</span>
            <span class="text-sm text-gray-400">{{ ex.category }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { planApi, exerciseApi } from '../api'

const route = useRoute()
const router = useRouter()

const planId = route.params.id
const isEdit = computed(() => !!planId)

const planName = ref('')
const exercises = ref([])
const allExercises = ref([])
const selectedCategory = ref('全部')
const showExercisePicker = ref(false)
const saving = ref(false)

const categories = computed(() => {
  const cats = ['全部', ...new Set(allExercises.value.map(e => e.category))]
  return cats
})

const filteredExercises = computed(() => {
  if (selectedCategory.value === '全部') return allExercises.value
  return allExercises.value.filter(e => e.category === selectedCategory.value)
})

const addExercise = (ex) => {
  exercises.value.push({
    exercise: ex.name,
    sets: 3,
    reps: 10,
    weight: 0
  })
  showExercisePicker.value = false
}

const removeExercise = (index) => {
  exercises.value.splice(index, 1)
}

const savePlan = async () => {
  if (!planName.value.trim()) {
    alert('请输入计划名称')
    return
  }
  if (exercises.value.length === 0) {
    alert('请至少添加一个动作')
    return
  }

  saving.value = true
  try {
    const data = {
      name: planName.value,
      exercises: exercises.value
    }
    if (isEdit.value) {
      await planApi.update(planId, data)
    } else {
      await planApi.create(data)
    }
    router.back()
  } catch (e) {
    alert('保存失败，请重试')
  }
  saving.value = false
}

const deletePlan = async () => {
  if (confirm('确定要删除这个训练计划吗？')) {
    try {
      await planApi.delete(planId)
      router.back()
    } catch (e) {
      alert('删除失败，请重试')
    }
  }
}

const loadData = async () => {
  try {
    const exRes = await exerciseApi.getAll()
    allExercises.value = exRes.data

    if (isEdit.value) {
      const plansRes = await planApi.getAll()
      const plan = plansRes.data.find(p => p.id == planId)
      if (plan) {
        planName.value = plan.name
        exercises.value = plan.exercises.map(e => ({
          exercise: e.exercise,
          sets: e.sets,
          reps: e.reps,
          weight: e.weight
        }))
      }
    }
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadData()
})
</script>
