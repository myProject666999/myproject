<template>
  <div class="viewer-container">
    <div class="header">
      <div class="header-left">
        <h1 class="filename">{{ filename }}</h1>
        <el-tag type="info" size="small">{{ currentSheet }}</el-tag>
      </div>
      <div class="header-right">
        <el-button @click="goBack" size="small">返回</el-button>
        <el-button @click="showFormula = !showFormula" :type="showFormula ? 'primary' : 'default'" size="small">
          {{ showFormula ? '隐藏公式' : '显示公式' }}
        </el-button>
        <el-button @click="exportCSV" type="success" size="small">导出CSV</el-button>
        <el-button @click="createShare" type="warning" size="small">分享</el-button>
      </div>
    </div>

    <div class="sheet-tabs">
      <el-radio-group v-model="currentSheet" @change="changeSheet">
        <el-radio-button v-for="sheet in sheets" :key="sheet" :label="sheet">
          {{ sheet }}
        </el-radio-button>
      </el-radio-group>
    </div>

    <div class="table-container">
      <div v-loading="loading" class="loading-wrapper">
        <el-table
          :data="tableData"
          border
          size="small"
          style="width: 100%"
          :header-cell-style="{ background: '#f5f7fa', fontWeight: 'bold' }"
        >
          <el-table-column
            v-for="(col, index) in columns"
            :key="index"
            :prop="String(index)"
            :label="getColumnName(index)"
            min-width="120"
            show-overflow-tooltip
          >
            <template #default="scope">
              <div class="cell-content">
                <span class="cell-value">{{ scope.row[index]?.value || '' }}</span>
                <span v-if="showFormula && scope.row[index]?.formula" class="cell-formula">
                  ={{ scope.row[index].formula }}
                </span>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <el-dialog v-model="shareDialogVisible" title="分享链接" width="500px">
      <div v-if="shareLink" class="share-content">
        <p>分享链接 (有效期 {{ shareDays }} 天):</p>
        <el-input v-model="shareLink" readonly>
          <template #append>
            <el-button @click="copyShareLink">复制</el-button>
          </template>
        </el-input>
      </div>
      <template #footer>
        <el-button @click="shareDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const fileId = computed(() => route.params.id)
const filename = ref('')
const sheets = ref([])
const currentSheet = ref('')
const rows = ref([])
const loading = ref(false)
const showFormula = ref(false)
const shareDialogVisible = ref(false)
const shareLink = ref('')
const shareDays = ref(7)

const columns = computed(() => {
  let maxCol = 0
  rows.value.forEach(row => {
    if (row.length > maxCol) maxCol = row.length
  })
  return Array.from({ length: Math.max(maxCol, 10) }, (_, i) => i)
})

const tableData = computed(() => {
  return rows.value.map(row => {
    const obj = {}
    row.forEach((cell, index) => {
      obj[index] = cell
    })
    return obj
  })
})

const getColumnName = (index) => {
  let name = ''
  let n = index
  while (n >= 0) {
    name = String.fromCharCode(65 + (n % 26)) + name
    n = Math.floor(n / 26) - 1
  }
  return name
}

const loadSheetData = async () => {
  loading.value = true
  try {
    const response = await axios.get(`/api/excel/${fileId.value}/sheet`, {
      params: { sheet: currentSheet.value }
    })
    filename.value = response.data.filename
    sheets.value = response.data.sheets
    currentSheet.value = response.data.sheet
    rows.value = response.data.rows
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const changeSheet = () => {
  loadSheetData()
}

const goBack = () => {
  router.push('/')
}

const exportCSV = () => {
  window.open(`/api/excel/${fileId.value}/export?sheet=${currentSheet.value}`, '_blank')
  ElMessage.success('开始导出CSV')
}

const createShare = async () => {
  try {
    const response = await axios.post(`/api/excel/${fileId.value}/share?days=${shareDays.value}`)
    shareLink.value = window.location.origin + '/share/' + response.data.share_token
    shareDialogVisible.value = true
  } catch (error) {
    ElMessage.error('创建分享链接失败')
  }
}

const copyShareLink = () => {
  navigator.clipboard.writeText(shareLink.value)
  ElMessage.success('已复制到剪贴板')
}

onMounted(() => {
  loadSheetData()
})
</script>

<style scoped>
.viewer-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.header {
  background: white;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filename {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.header-right {
  display: flex;
  gap: 8px;
}

.sheet-tabs {
  background: white;
  padding: 12px 24px;
  border-bottom: 1px solid #e4e7ed;
}

.table-container {
  padding: 20px;
  overflow-x: auto;
}

.loading-wrapper {
  background: white;
  border-radius: 8px;
  padding: 20px;
  min-height: 400px;
}

.cell-content {
  display: flex;
  flex-direction: column;
}

.cell-value {
  color: #333;
  font-size: 14px;
}

.cell-formula {
  color: #409eff;
  font-size: 12px;
  font-family: monospace;
  margin-top: 4px;
}

.share-content p {
  margin-bottom: 12px;
  color: #666;
}
</style>
