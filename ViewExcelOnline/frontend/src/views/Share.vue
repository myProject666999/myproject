<template>
  <div class="viewer-container">
    <div class="header">
      <div class="header-left">
        <h1 class="filename">{{ filename }}</h1>
        <el-tag type="info" size="small">共享文件</el-tag>
        <el-tag size="small">{{ currentSheet }}</el-tag>
      </div>
      <div class="header-right">
        <el-button @click="showFormula = !showFormula" :type="showFormula ? 'primary' : 'default'" size="small">
          {{ showFormula ? '隐藏公式' : '显示公式' }}
        </el-button>
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

    <el-empty v-if="error" :description="errorMessage" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const route = useRoute()

const token = computed(() => route.params.token)
const filename = ref('')
const sheets = ref([])
const currentSheet = ref('')
const rows = ref([])
const loading = ref(false)
const showFormula = ref(false)
const error = ref(false)
const errorMessage = ref('')

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
  error.value = false
  try {
    const response = await axios.get(`/api/share/${token.value}`, {
      params: { sheet: currentSheet.value }
    })
    filename.value = response.data.filename
    sheets.value = response.data.sheets
    currentSheet.value = response.data.sheet
    rows.value = response.data.rows
  } catch (err) {
    error.value = true
    errorMessage.value = err.response?.data?.error || '分享链接不存在或已过期'
  } finally {
    loading.value = false
  }
}

const changeSheet = () => {
  loadSheetData()
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
</style>
