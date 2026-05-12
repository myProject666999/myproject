<template>
  <div>
    <div class="page-header flex-between">
      <h2>纠纷处理</h2>
    </div>

    <el-card>
      <el-table :data="disputes" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="order_id" label="订单ID" width="100" />
        <el-table-column prop="type" label="类型">
          <template #default="{ row }">
            <el-tag>{{ getTypeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="150" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 'pending' ? 'warning' : row.status === 'resolved' ? 'success' : 'danger'">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" v-if="isAdmin">
          <template #default="{ row }">
            <el-button type="primary" link @click="openHandleDialog(row)" v-if="row.status === 'pending'">
              处理
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="disputes.length === 0 && !loading" description="暂无纠纷记录" />
    </el-card>

    <el-dialog v-model="handleVisible" title="处理纠纷" width="500px">
      <el-descriptions :column="1" border class="mb-20">
        <el-descriptions-item label="订单ID">{{ currentDispute?.order_id }}</el-descriptions-item>
        <el-descriptions-item label="类型">{{ getTypeText(currentDispute?.type) }}</el-descriptions-item>
        <el-descriptions-item label="标题">{{ currentDispute?.title }}</el-descriptions-item>
        <el-descriptions-item label="描述">{{ currentDispute?.description }}</el-descriptions-item>
      </el-descriptions>

      <el-form :model="handleForm" label-width="80px">
        <el-form-item label="处理结果">
          <el-select v-model="handleForm.status" placeholder="请选择" style="width: 100%">
            <el-option label="已解决" value="resolved" />
            <el-option label="已驳回" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理意见">
          <el-input
            v-model="handleForm.handle_result"
            type="textarea"
            :rows="3"
            placeholder="请输入处理意见"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="handleVisible = false">取消</el-button>
        <el-button type="primary" @click="submitHandle">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getDisputes, handleDispute } from '@/api'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const isAdmin = computed(() => userStore.role === 'admin')

const disputes = ref([])
const loading = ref(false)
const handleVisible = ref(false)
const currentDispute = ref(null)

const handleForm = reactive({
  status: 'resolved',
  handle_result: ''
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getDisputes()
    disputes.value = res.data
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const getTypeText = (type) => {
  const map = { service: '服务质量', price: '费用问题', time: '时间问题', other: '其他' }
  return map[type] || type
}

const getStatusText = (status) => {
  const map = { pending: '待处理', resolved: '已解决', rejected: '已驳回' }
  return map[status] || status
}

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

const openHandleDialog = (dispute) => {
  currentDispute.value = dispute
  handleForm.status = 'resolved'
  handleForm.handle_result = ''
  handleVisible.value = true
}

const submitHandle = async () => {
  try {
    await handleDispute(currentDispute.value.id, handleForm)
    ElMessage.success('处理成功')
    handleVisible.value = false
    loadData()
  } catch (error) {
    console.error(error)
  }
}

onMounted(loadData)
</script>
