<template>
  <div class="borrows-page">
    <div class="page-header">
      <h2 class="page-title">领用管理</h2>
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon>
        新增领用
      </el-button>
    </div>

    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" clearable>
            <el-option label="领用中" value="BORROWED" />
            <el-option label="已归还" value="RETURNED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadBorrows">搜索</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="borrows" v-loading="loading">
        <el-table-column prop="asset_code" label="资产编号" width="120" />
        <el-table-column prop="asset_name" label="资产名称" min-width="150" />
        <el-table-column prop="user_name" label="领用人" width="100" />
        <el-table-column prop="department_name" label="领用部门" width="120" />
        <el-table-column prop="borrow_date" label="领用日期" width="120" />
        <el-table-column prop="expected_return_date" label="预计归还" width="120" />
        <el-table-column prop="actual_return_date" label="实际归还" width="120" />
        <el-table-column prop="purpose" label="用途" min-width="150" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'BORROWED' ? 'primary' : 'success'">
              {{ row.status === 'BORROWED' ? '领用中' : '已归还' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="row.status === 'BORROWED'"
              type="success" 
              link 
              @click="openReturnDialog(row)"
            >
              归还
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
        @size-change="loadBorrows"
        @current-change="loadBorrows"
      />
    </el-card>

    <el-dialog v-model="addDialogVisible" title="新增领用" width="600px">
      <el-form :model="borrowForm" :rules="rules" ref="borrowFormRef" label-width="100px">
        <el-form-item label="选择资产" prop="asset_id">
          <el-select v-model="borrowForm.asset_id" style="width: 100%" filterable>
            <el-option 
              v-for="asset in idleAssets" 
              :key="asset.id" 
              :label="`${asset.asset_code} - ${asset.name}`" 
              :value="asset.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="领用人" prop="user_id">
          <el-select v-model="borrowForm.user_id" style="width: 100%">
            <el-option v-for="user in users" :key="user.id" :label="user.name" :value="user.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="领用部门" prop="department_id">
          <el-select v-model="borrowForm.department_id" style="width: 100%">
            <el-option v-for="dept in departments" :key="dept.id" :label="dept.name" :value="dept.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="领用日期" prop="borrow_date">
          <el-date-picker v-model="borrowForm.borrow_date" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="预计归还" prop="expected_return_date">
          <el-date-picker v-model="borrowForm.expected_return_date" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="领用用途" prop="purpose">
          <el-input v-model="borrowForm.purpose" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="borrowForm.remarks" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBorrow">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="returnDialogVisible" title="归还资产" width="500px">
      <el-form :model="returnForm" :rules="returnRules" ref="returnFormRef" label-width="100px">
        <el-form-item label="资产">
          <span>{{ currentBorrow?.asset_name }}</span>
        </el-form-item>
        <el-form-item label="领用人">
          <span>{{ currentBorrow?.user_name }}</span>
        </el-form-item>
        <el-form-item label="实际归还日期" prop="actual_return_date">
          <el-date-picker v-model="returnForm.actual_return_date" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="returnForm.remarks" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="returnDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReturn">确认归还</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { borrows as borrowsApi, assets as assetsApi, users as usersApi, departments as departmentsApi } from '../api'

const loading = ref(false)
const borrows = ref([])
const idleAssets = ref([])
const users = ref([])
const departments = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const filterForm = reactive({
  status: ''
})

const addDialogVisible = ref(false)
const borrowFormRef = ref(null)
const borrowForm = reactive({
  asset_id: '',
  user_id: '',
  department_id: '',
  borrow_date: '',
  expected_return_date: '',
  purpose: '',
  remarks: ''
})

const rules = {
  asset_id: [{ required: true, message: '请选择资产', trigger: 'change' }],
  user_id: [{ required: true, message: '请选择领用人', trigger: 'change' }],
  department_id: [{ required: true, message: '请选择领用部门', trigger: 'change' }],
  borrow_date: [{ required: true, message: '请选择领用日期', trigger: 'change' }],
  purpose: [{ required: true, message: '请输入领用用途', trigger: 'blur' }]
}

const returnDialogVisible = ref(false)
const returnFormRef = ref(null)
const currentBorrow = ref(null)
const returnForm = reactive({
  actual_return_date: '',
  remarks: ''
})

const returnRules = {
  actual_return_date: [{ required: true, message: '请选择归还日期', trigger: 'change' }]
}

const loadBorrows = async () => {
  loading.value = true
  try {
    const res = await borrowsApi.getList({
      page: page.value,
      pageSize: pageSize.value,
      status: filterForm.status
    })
    if (res.code === 200) {
      borrows.value = res.data
      total.value = res.total
    }
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const loadIdleAssets = async () => {
  try {
    const res = await assetsApi.getList({ page: 1, pageSize: 1000, status: 'IDLE' })
    if (res.code === 200) {
      idleAssets.value = res.data
    }
  } catch (error) {
    console.error('加载空闲资产失败', error)
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

const loadDepartments = async () => {
  try {
    const res = await departmentsApi.getList()
    if (res.code === 200) {
      departments.value = res.data
    }
  } catch (error) {
    console.error('加载部门失败', error)
  }
}

const resetFilter = () => {
  filterForm.status = ''
  page.value = 1
  loadBorrows()
}

const openAddDialog = () => {
  Object.keys(borrowForm).forEach(key => borrowForm[key] = '')
  loadIdleAssets()
  addDialogVisible.value = true
}

const submitBorrow = async () => {
  if (!borrowFormRef.value) return
  await borrowFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await borrowsApi.create(borrowForm)
        if (res.code === 200) {
          ElMessage.success('领用成功')
          addDialogVisible.value = false
          loadBorrows()
        }
      } catch (error) {
        ElMessage.error(error.message || '领用失败')
      }
    }
  })
}

const openReturnDialog = (row) => {
  currentBorrow.value = row
  returnForm.actual_return_date = ''
  returnForm.remarks = ''
  returnDialogVisible.value = true
}

const submitReturn = async () => {
  if (!returnFormRef.value) return
  await returnFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await borrowsApi.return(currentBorrow.value.id, returnForm)
        if (res.code === 200) {
          ElMessage.success('归还成功')
          returnDialogVisible.value = false
          loadBorrows()
        }
      } catch (error) {
        ElMessage.error(error.message || '归还失败')
      }
    }
  })
}

onMounted(() => {
  loadBorrows()
  loadUsers()
  loadDepartments()
})
</script>

<style scoped>
.borrows-page {
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

.filter-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}
</style>
