<template>
  <div class="page-container">
    <div class="bg-white border-b border-gray-100 p-4">
      <h1 class="text-lg font-bold">动作库</h1>
    </div>

    <div class="p-4">
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
          class="card flex items-center"
        >
          <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-2xl mr-4">
            {{ getCategoryIcon(ex.category) }}
          </div>
          <div class="flex-1">
            <h3 class="font-semibold">{{ ex.name }}</h3>
            <p class="text-sm text-gray-500">{{ ex.category }}</p>
          </div>
        </div>
      </div>

      <div class="mt-6">
        <button
          @click="showAddExercise = true"
          class="btn-primary w-full"
        >
          + 添加新动作
        </button>
      </div>
    </div>

    <div v-if="showAddExercise" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-sm rounded-2xl p-6">
        <h3 class="font-bold text-lg mb-4">添加新动作</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">动作名称</label>
            <input v-model="newExercise.name" type="text" class="input-field" placeholder="例如：哑铃卧推" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">所属部位</label>
            <select v-model="newExercise.category" class="input-field">
              <option value="">请选择</option>
              <option v-for="cat in categoryOptions" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <textarea v-model="newExercise.description" class="input-field" rows="2" placeholder="可选"></textarea>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button @click="showAddExercise = false" class="btn-secondary flex-1">取消</button>
          <button @click="saveExercise" :disabled="saving" class="btn-primary flex-1">
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { exerciseApi } from '../api'

const categoryOptions = ['胸部', '背部', '肩部', '手臂', '腿部', '核心', '有氧']
const exercises = ref([])
const selectedCategory = ref('全部')
const showAddExercise = ref(false)
const saving = ref(false)
const newExercise = ref({
  name: '',
  category: '',
  description: ''
})

const categories = computed(() => {
  return ['全部', ...categoryOptions]
})

const filteredExercises = computed(() => {
  if (selectedCategory.value === '全部') return exercises.value
  return exercises.value.filter(e => e.category === selectedCategory.value)
})

const getCategoryIcon = (category) => {
  const icons = {
    '胸部': '💪',
    '背部': '🦾',
    '肩部': '🏋️',
    '手臂': '💪',
    '腿部': '🦵',
    '核心': '🔥',
    '有氧': '🏃'
  }
  return icons[category] || '💪'
}

const saveExercise = async () => {
  if (!newExercise.value.name.trim()) {
    alert('请输入动作名称')
    return
  }
  if (!newExercise.value.category) {
    alert('请选择所属部位')
    return
  }
  saving.value = true
  try {
    await exerciseApi.create(newExercise.value)
    showAddExercise.value = false
    newExercise.value = { name: '', category: '', description: '' }
    loadExercises()
  } catch (e) {
    alert('保存失败')
  }
  saving.value = false
}

const loadExercises = async () => {
  try {
    const res = await exerciseApi.getAll()
    exercises.value = res.data
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadExercises()
})
</script>
