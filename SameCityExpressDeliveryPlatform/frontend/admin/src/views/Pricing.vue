<template>
  <div class="page-container">
    <div class="page-header">
      <h2>计费规则</h2>
      <el-button type="primary" @click="loadData">刷新</el-button>
    </div>

    <el-card>
      <el-table :data="rules" v-loading="loading" stripe>
        <el-table-column prop="name" label="规则名称" width="150" />
        <el-table-column prop="base_price" label="基础费用(¥)" width="120">
          <template #default="{ row }">
            <el-input-number
              v-model="row.base_price"
              :min="0"
              :precision="2"
              size="small"
              @change="saveRule(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="base_distance" label="基础距离(km)" width="120">
          <template #default="{ row }">
            <el-input-number
              v-model="row.base_distance"
              :min="0"
              :precision="1"
              size="small"
              @change="saveRule(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="distance_price" label="超出距离费(¥/km)" width="150">
          <template #default="{ row }">
            <el-input-number
              v-model="row.distance_price"
              :min="0"
              :precision="2"
              size="small"
              @change="saveRule(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="base_weight" label="基础重量(kg)" width="120">
          <template #default="{ row }">
            <el-input-number
              v-model="row.base_weight"
              :min="0"
              :precision="1"
              size="small"
              @change="saveRule(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="weight_price" label="超出重量费(¥/kg)" width="150">
          <template #default="{ row }">
            <el-input-number
              v-model="row.weight_price"
              :min="0"
              :precision="2"
              size="small"
              @change="saveRule(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="time_surcharge" label="时段附加费(¥)" width="130">
          <template #default="{ row }">
            <el-input-number
              v-model="row.time_surcharge"
              :min="0"
              :precision="2"
              size="small"
              @change="saveRule(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="生效时段" width="150">
          <template #default="{ row }">
            {{ row.start_time && row.end_time ? `${row.start_time} - ${row.end_time}` : '全天' }}
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="{ row }">
            <el-input-number
              v-model="row.priority"
              :min="0"
              size="small"
              @change="saveRule(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="is_enabled" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.is_enabled"
              @change="saveRule(row)"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/api/request'

const loading = ref(false)
const rules = ref<any[]>([])

async function loadData() {
  loading.value = true
  try {
    rules.value = await request.get('/admin/pricing')
  } catch (error) {
    console.error('加载计费规则失败', error)
  } finally {
    loading.value = false
  }
}

let saveTimeout: any = null

function saveRule(row: any) {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }

  saveTimeout = setTimeout(async () => {
    try {
      await request.put(`/admin/pricing/${row.id}`, {
        base_price: row.base_price,
        base_distance: row.base_distance,
        distance_price: row.distance_price,
        base_weight: row.base_weight,
        weight_price: row.weight_price,
        time_surcharge: row.time_surcharge,
        priority: row.priority,
        is_enabled: row.is_enabled
      })
      ElMessage.success('保存成功')
    } catch (error: any) {
      ElMessage.error(error.message || '保存失败')
    }
  }, 500)
}

onMounted(() => {
  loadData()
})
</script>
