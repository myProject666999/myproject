import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { InspectionTask } from '@/types/models'

export interface TaskFilters {
  status?: string
  keyword?: string
  startDate?: string
  endDate?: string
}

export const useTaskStore = defineStore('task', () => {
  const currentTask = ref<InspectionTask | null>(null)
  const taskList = ref<InspectionTask[]>([])
  const filters = ref<TaskFilters>({})

  function setCurrentTask(task: InspectionTask | null) {
    currentTask.value = task
  }

  function setTaskList(list: InspectionTask[]) {
    taskList.value = list
  }

  function setFilters(newFilters: TaskFilters) {
    filters.value = { ...filters.value, ...newFilters }
  }

  return {
    currentTask,
    taskList,
    filters,
    setCurrentTask,
    setTaskList,
    setFilters
  }
})
