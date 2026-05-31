import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Issue } from '@/types/models'

export interface IssueFilters {
  status?: string
  level?: string
  keyword?: string
  startDate?: string
  endDate?: string
}

export const useIssueStore = defineStore('issue', () => {
  const currentIssue = ref<Issue | null>(null)
  const issueList = ref<Issue[]>([])
  const filters = ref<IssueFilters>({})

  function setCurrentIssue(issue: Issue | null) {
    currentIssue.value = issue
  }

  function setIssueList(list: Issue[]) {
    issueList.value = list
  }

  function setFilters(newFilters: IssueFilters) {
    filters.value = { ...filters.value, ...newFilters }
  }

  return {
    currentIssue,
    issueList,
    filters,
    setCurrentIssue,
    setIssueList,
    setFilters
  }
})
