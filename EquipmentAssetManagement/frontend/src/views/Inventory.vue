<template>
  <div class="inventory-page">
    <div class="page-header">
      <h2 class="page-title">盘点管理</h2>
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon>
        新增盘点
      </el-button>
    </div>

    <el-card class="table-card">
      <el-table :data="inventoryList" v-loading="loading">
        <el-table-column prop="check_code" label="盘点单号" width="140" />
        <el-table-column prop="name" label="盘点名称" min-width="180" />
        <el-table-column prop="check_date" label="盘点日期" width="120" />
        <el-table-column prop="operator_name" label="操作人" width="100" />
        <el-table-column prop="total_count" label="应盘数量" width="100" align="center" />
        <el-table-column prop="checked_count" label="已盘数量" width="100" align="center" />
        <el-table-column prop="normal_count" label="正常数量" width="100" align="center" />
        <el-table-column prop="abnormal_count" label="异常数量" width="100" align="center" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewDetail(row)">
              <el-icon><View /></el-icon>
              详情
            </el-button>
            <el-button 
              v-if="row.status === 'DRAFT'"
              type="success" 
              link 
              @click="startCheck(row)"
            >
              <el-icon><VideoPlay /></el-icon>
              开始
            </el-button>
            <el-button 
              v-if="row.status === 'PROCESSING'"
              type="warning" 
              link 
              @click="completeCheck(row)"
            >
              <el-icon><CircleCheck /></el-icon>
              完成
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="pagination"
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadInventory"
        @current-change="loadInventory"
      />
    </el-card>

    <el-dialog v-model="addDialogVisible" title="新增盘点" width="500px">
      <el-form :model="inventoryForm" :rules="rules" ref="inventoryFormRef" label-width="100px">
        <el-form-item label="盘点名称" prop="name">
          <el-input v-model="inventoryForm.name" />
        </el-form-item>
        <el-form-item label="盘点日期" prop="check_date">
          <el-date-picker v-model="inventoryForm.check_date" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="操作人" prop="operator_id">
          <el-select v-model="inventoryForm.operator_id" style="width: 100%">
            <el-option v-for="user in users" :key="user.id" :label="user.name" :value="user.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="inventoryForm.remarks" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitInventory">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { inventory as inventoryApi, users as usersApi } from '../api'

const router = useRouter()
const loading = ref(false)
const inventoryList = ref([])
const users = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const getStatusType = (status) => {
  const types = {
    DRAFT: 'info',
    PROCESSING: 'warning',
    COMPLETED: 'success'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    DRAFT: '草稿',
    PROCESSING: '进行中',
    COMPLETED: '已完成'
  }
  return texts[status] || status
}

const loadInventory = async () => {
  loading.value = true
  try {
    const res = await inventoryApi.getList({
      page: page.value,
      pageSize: pageSize.value
    })
    if (res.code === 200) {
      inventoryList.value = res.data
      total.value = res.total
    }
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const loadUsers = async () => {
  try {
    const res = await usersApi.getList()
    if (res.code === 200) {
      users.value = res.data
    }
  } catch (error) {
    console.error('加载用户失败', error)
  }
}

const addDialogVisible = ref(false)
const inventoryFormRef = ref(null)
const inventoryForm = reactive({
  name: '',
  check_date: '',
  operator_id: '',
  remarks: ''
})

const rules = {
  name: [{ required: true, message: '请输入盘点名称', trigger: 'blur' }],
  check_date: [{ required: true, message: '请选择盘点日期', trigger: 'change' }],
  operator_id: [{ required: true, message: '请选择操作人', trigger: 'change' }]
}

const openAddDialog = () => {
  Object.keys(inventoryForm).forEach(key => inventoryForm[key] = '')
  addDialogVisible.value = true
}

const submitInventory = async () => {
  if (!inventoryFormRef.value) return
  await inventoryFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await inventoryApi.create(inventoryForm)
        if (res.code === 200) {
          ElMessage.success('创建成功')
          addDialogVisible.value = false
          loadInventory()
        }
      } catch (error) {
        ElMessage.error(error.message || '创建失败')
      }
    }
  })
}

const viewDetail = (row) => {
  router.push(`/inventory/${row.id}`)
}

const startCheck = (row) => {
  ElMessageBox.confirm('确定要开始盘点吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await inventoryApi.start(row.id)
      if (res.code === 200) {
        ElMessage.success('盘点已开始')
        loadInventory()
      }
    } catch (error) {
      ElMessage.error('操作失败')
    }
  }).catch(() => {})
}

const completeCheck = (row) => {
  ElMessageBox.confirm('确定要完成盘点吗？完成后将不能再修改盘点结果。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await inventoryApi.complete(row.id)
      if (res.code === 200) {
        ElMessage.success('盘点已完成')
        loadInventory()
      }
    } catch (error) {
      ElMessage.error('操作失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  loadInventory()
  loadUsers()
})
</script>

<style scoped>
.inventory-page {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.table-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}
</style>
