<template>
  <div class="container">
    <div class="card">
      <h3 class="section-title">📜 分析历史</h3>

      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>正在加载历史记录...</p>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-if="!loading && !error">
        <div v-if="history.length > 0" class="history-list">
          <div 
            v-for="item in history" 
            :key="item.id" 
            class="history-item"
            @click="viewReport(item.id)"
          >
            <div>
              <div class="history-url">{{ item.url }}</div>
              <div class="history-date">{{ formatDate(item.created_at) }}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
              <div class="history-score">{{ item.score }}</div>
              <button class="delete-btn" @click.stop="deleteItem(item.id)">删除</button>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <h3>暂无历史记录</h3>
          <p>开始分析您的第一个URL吧！</p>
        </div>

        <div v-if="total > pageSize" class="pagination">
          <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
            上一页
          </button>
          <button 
            v-for="page in totalPages" 
            :key="page"
            @click="changePage(page)"
            :class="{ active: page === currentPage }"
          >
            {{ page }}
          </button>
          <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getHistory, deleteAnalysis } from '../api'

const router = useRouter()
const loading = ref(true)
const error = ref('')
const history = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

const loadHistory = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await getHistory(currentPage.value, pageSize.value)
    history.value = response.data.data
    total.value = response.data.total
  } catch (err) {
    error.value = err.response?.data?.error || '加载历史记录失败'
  } finally {
    loading.value = false
  }
}

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  loadHistory()
}

const viewReport = (id) => {
  router.push(`/report/${id}`)
}

const deleteItem = async (id) => {
  if (!confirm('确定要删除这条记录吗？')) return
  try {
    await deleteAnalysis(id)
    loadHistory()
  } catch (err) {
    alert('删除失败')
  }
}

onMounted(() => {
  loadHistory()
})
</script>
