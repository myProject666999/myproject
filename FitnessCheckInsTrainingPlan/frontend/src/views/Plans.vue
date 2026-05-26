<template>
  <div class="page-container">
    <div class="bg-white border-b border-gray-100 p-4">
      <h1 class="text-lg font-bold">训练计划</h1>
    </div>

    <div class="p-4">
      <div class="space-y-3">
        <router-link
          v-for="plan in plans"
          :key="plan.id"
          :to="`/plan/edit/${plan.id}`"
          class="card block hover:shadow-md transition-shadow"
        >
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-semibold text-lg">{{ plan.name }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ plan.exercises.length }} 个动作</p>
            </div>
            <span class="text-gray-400">›</span>
          </div>
          <div class="flex flex-wrap gap-2 mt-3">
            <span
              v-for="ex in plan.exercises.slice(0, 3)"
              :key="ex.id"
              class="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600"
            >
              {{ ex.exercise }}
            </span>
            <span
              v-if="plan.exercises.length > 3"
              class="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600"
            >
              +{{ plan.exercises.length - 3 }}
            </span>
          </div>
        </router-link>

        <router-link
          to="/plan/edit"
          class="card border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-primary-300 hover:text-primary-500 transition-colors"
        >
          <span class="mr-2 text-xl">+</span>
          <span>新建训练计划</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { planApi } from '../api'

const plans = ref([])

const loadData = async () => {
  try {
    const res = await planApi.getAll()
    plans.value = res.data
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadData()
})
</script>
