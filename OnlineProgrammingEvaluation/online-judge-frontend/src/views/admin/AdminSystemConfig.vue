<template>
  <div class="page-container">
    <div class="page-header">
      <h2>系统设置</h2>
    </div>
    <div class="card">
      <el-table :data="configs" stripe>
        <el-table-column label="配置键" prop="configKey" width="250" />
        <el-table-column label="配置值">
          <template #default="scope">
            <el-input v-model="scope.row.configValue" @change="handleSave(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="描述" prop="description" />
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const configs = ref([])

const fetchData = async () => {
  const res = await request.get('/config/list')
  configs.value = res.data
}

const handleSave = async (row) => {
  try {
    await request.put('/config/update', row)
    ElMessage.success('保存成功')
  } catch (e) {
    // error handled
  }
}

onMounted(fetchData)
</script>
