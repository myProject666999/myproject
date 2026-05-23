<template>
  <div class="monitor-page">
    <div class="card monitor-header">
      <div class="header-top">
        <div>
          <h1 class="page-title">定时监测</h1>
          <p class="page-desc">创建定时监测任务，定期自动测试网站加载速度</p>
        </div>
        <button class="btn btn-primary" @click="showCreate = true">+ 新建任务</button>
      </div>
    </div>

    <div class="card table-section">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>URL</th>
            <th>区域</th>
            <th>间隔</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in tasks" :key="task.id">
            <td>#{{ task.id }}</td>
            <td class="url-cell" :title="task.url">{{ task.url }}</td>
            <td>{{ task.regionName }}</td>
            <td>{{ task.interval }} 分钟</td>
            <td>
              <span v-if="task.enabled" class="tag tag-green">运行中</span>
              <span v-else class="tag tag-gray">已暂停</span>
            </td>
            <td>{{ formatTime(task.createdAt) }}</td>
            <td>
              <button class="btn btn-secondary btn-sm" @click="toggleTask(task)">
                {{ task.enabled ? '暂停' : '启用' }}
              </button>
              <button class="btn btn-secondary btn-sm" @click="viewResults(task)">结果</button>
              <button class="btn btn-danger btn-sm" @click="deleteTask(task)">删除</button>
            </td>
          </tr>
          <tr v-if="tasks.length === 0">
            <td colspan="7" class="empty-cell">暂无监测任务，点击"新建任务"创建一个</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showCreate" class="modal-overlay" @click="showCreate = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>新建监测任务</h3>
          <button class="modal-close" @click="showCreate = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>URL</label>
            <input v-model="newTask.url" class="input-field" placeholder="https://www.example.com" />
          </div>
          <div class="form-group">
            <label>测试区域</label>
            <select v-model="newTask.region" class="input-field">
              <option v-for="r in regions" :key="r.code" :value="r.code">{{ r.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>测试间隔（分钟）</label>
            <input v-model.number="newTask.interval" type="number" min="1" class="input-field" placeholder="30" />
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" v-model="newTask.enabled" style="margin-right: 8px" />
              创建后立即启用
            </label>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="showCreate = false">取消</button>
            <button class="btn btn-primary" :disabled="creating" @click="handleCreate">
              <span v-if="creating" class="loading"></span>
              <span v-else>创建</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showResults" class="modal-overlay" @click="showResults = false">
      <div class="modal modal-large" @click.stop>
        <div class="modal-header">
          <h3>监测结果 - {{ selectedTask?.url }}</h3>
          <button class="modal-close" @click="showResults = false">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="taskResults.length > 0">
            <div class="stats-row">
              <div class="stat-item">
                <div class="stat-label">平均 TTFB</div>
                <div class="stat-value">{{ avgTTFB }} ms</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">平均 DOM</div>
                <div class="stat-value">{{ avgDOM }} ms</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">总测试次数</div>
                <div class="stat-value">{{ taskResults.length }}</div>
              </div>
            </div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>时间</th>
                  <th>DNS</th>
                  <th>TCP</th>
                  <th>TTFB</th>
                  <th>DOM</th>
                  <th>总计</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in taskResults" :key="r.id">
                  <td>{{ formatTime(r.createdAt) }}</td>
                  <td>{{ r.dnsLookup }}ms</td>
                  <td>{{ r.tcpConnect }}ms</td>
                  <td class="highlight-cell">{{ r.ttfb }}ms</td>
                  <td class="highlight-cell">{{ r.domReady }}ms</td>
                  <td class="total-cell">{{ r.totalTime }}ms</td>
                  <td>
                    <span v-if="r.error" class="tag tag-red">失败</span>
                    <span v-else class="tag tag-green">{{ r.statusCode }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="empty-state">
            暂无监测结果
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  getRegions,
  getMonitorTasks,
  createMonitorTask,
  updateMonitorTask,
  deleteMonitorTask,
  getMonitorResults
} from '../api/index.js'

const tasks = ref([])
const regions = ref([])
const showCreate = ref(false)
const showResults = ref(false)
const selectedTask = ref(null)
const taskResults = ref([])
const creating = ref(false)

const newTask = ref({
  url: '',
  region: 'cn-north',
  interval: 30,
  enabled: true
})

onMounted(async () => {
  try {
    const [regionsRes, tasksRes] = await Promise.all([getRegions(), getMonitorTasks()])
    regions.value = regionsRes.data.regions
    tasks.value = tasksRes.data.tasks
  } catch (e) {
    console.error(e)
  }
})

const avgTTFB = computed(() => {
  if (taskResults.value.length === 0) return 0
  return Math.round(taskResults.value.reduce((s, r) => s + r.ttfb, 0) / taskResults.value.length)
})

const avgDOM = computed(() => {
  if (taskResults.value.length === 0) return 0
  return Math.round(taskResults.value.reduce((s, r) => s + r.domReady, 0) / taskResults.value.length)
})

const handleCreate = async () => {
  if (!newTask.value.url.trim()) {
    alert('请输入 URL')
    return
  }
  creating.value = true
  try {
    const res = await createMonitorTask(newTask.value)
    tasks.value.unshift(res.data.task)
    showCreate.value = false
    newTask.value = { url: '', region: 'cn-north', interval: 30, enabled: true }
  } catch (e) {
    alert('创建失败：' + (e.response?.data?.error || e.message))
  } finally {
    creating.value = false
  }
}

const toggleTask = async (task) => {
  try {
    await updateMonitorTask(task.id, { enabled: !task.enabled })
    task.enabled = !task.enabled
  } catch (e) {
    alert('操作失败：' + (e.response?.data?.error || e.message))
  }
}

const deleteTask = async (task) => {
  if (!confirm(`确定删除监测任务 #${task.id} 吗？`)) return
  try {
    await deleteMonitorTask(task.id)
    tasks.value = tasks.value.filter(t => t.id !== task.id)
  } catch (e) {
    alert('删除失败：' + (e.response?.data?.error || e.message))
  }
}

const viewResults = async (task) => {
  selectedTask.value = task
  showResults.value = true
  taskResults.value = []
  try {
    const res = await getMonitorResults(task.id)
    taskResults.value = res.data.results
  } catch (e) {
    console.error(e)
  }
}

const formatTime = (t) => {
  if (!t) return ''
  return new Date(t).toLocaleString('zh-CN')
}
</script>

<style scoped>
.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.page-desc {
  color: #6b7280;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-section {
  padding: 24px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table th {
  text-align: left;
  padding: 12px 10px;
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

.data-table td {
  padding: 12px 10px;
  border-bottom: 1px solid #f3f4f6;
  color: #4b5563;
}

.data-table tr:hover {
  background: #f9fafb;
}

.url-cell {
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.highlight-cell {
  color: #667eea;
  font-weight: 600;
}

.total-cell {
  font-weight: 700;
  color: #1f2937;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
  margin-right: 4px;
}

.empty-cell {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-large {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 700;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #9ca3af;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.stat-item {
  flex: 1;
  background: #f9fafb;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #667eea;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
}
</style>
