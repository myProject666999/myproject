<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search, Edit, Trash2, RefreshCw } from 'lucide-vue-next'
import StatusTag from '@/components/StatusTag.vue'
import {
  getReplenisherList,
  createReplenisher,
  updateReplenisher,
  deleteReplenisher
} from '@/api/replenisher'
import type { Replenisher, ReplenisherQuery, ReplenisherCreate, ReplenisherUpdate } from '@/types'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const currentId = ref<number | null>(null)

const queryParams = reactive<ReplenisherQuery>({
  page: 1,
  page_size: 10,
  keyword: '',
  area: '',
  status: undefined
})

const tableData = ref<Replenisher[]>([])
const total = ref(0)

const formRef = ref<FormInstance>()
const formData = reactive<ReplenisherCreate>({
  employee_no: '',
  name: '',
  phone: '',
  area: '',
  status: 1
})

const rules: FormRules = {
  employee_no: [{ required: true, message: '请输入员工编号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

const statusOptions = [
  { value: 1, label: '在职' },
  { value: 0, label: '离职' }
]

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getReplenisherList(queryParams)
    tableData.value = res.list
    total.value = res.total
  } catch (error) {
    console.error('Failed to fetch replenisher list:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.keyword = ''
  queryParams.area = ''
  queryParams.status = undefined
  queryParams.page = 1
  fetchData()
}

const handleSizeChange = (size: number) => {
  queryParams.page_size = size
  queryParams.page = 1
  fetchData()
}

const handleCurrentChange = (page: number) => {
  queryParams.page = page
  fetchData()
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增补货员'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: Replenisher) => {
  isEdit.value = true
  dialogTitle.value = '编辑补货员'
  currentId.value = row.id
  Object.assign(formData, {
    employee_no: row.employee_no,
    name: row.name,
    phone: row.phone,
    area: row.area,
    status: row.status
  })
  dialogVisible.value = true
}

const handleDelete = (row: Replenisher) => {
  ElMessageBox.confirm(`确定要删除补货员"${row.name}"吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        await deleteReplenisher(row.id)
        ElMessage.success('删除成功')
        fetchData()
      } catch (error) {
        console.error('Failed to delete replenisher:', error)
      }
    })
    .catch(() => {})
}

const resetForm = () => {
  currentId.value = null
  formData.employee_no = ''
  formData.name = ''
  formData.phone = ''
  formData.area = ''
  formData.status = 1
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value && currentId.value) {
          const updateData: ReplenisherUpdate = {
            name: formData.name,
            phone: formData.phone,
            area: formData.area,
            status: formData.status
          }
          await updateReplenisher(currentId.value, updateData)
          ElMessage.success('更新成功')
        } else {
          await createReplenisher(formData)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        fetchData()
      } catch (error) {
        console.error('Failed to submit form:', error)
      }
    }
  })
}

const getStatusTag = (status: number) => {
  return status === 1 ? 'success' : 'danger'
}

const getStatusLabel = (status: number) => {
  return status === 1 ? '在职' : '离职'
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="p-6">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">补货员管理</h2>
      <p class="text-gray-600 dark:text-gray-400 mt-1">管理补货员的基本信息</p>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
      <el-form :inline="true" :model="queryParams" class="flex flex-wrap gap-4">
        <el-form-item label="关键词">
          <el-input
            v-model="queryParams.keyword"
            placeholder="员工编号/姓名/手机号"
            class="w-64"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <Search class="w-4 h-4 text-gray-400" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="负责区域">
          <el-input
            v-model="queryParams.area"
            placeholder="请输入区域"
            class="w-48"
            clearable
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="queryParams.status"
            placeholder="全部"
            class="w-32"
            clearable
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <Search class="w-4 h-4 mr-1" />
            搜索
          </el-button>
          <el-button @click="handleReset">
            <RefreshCw class="w-4 h-4 mr-1" />
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div class="flex justify-between items-center mb-4">
        <div class="text-gray-600 dark:text-gray-400">
          共 <span class="font-semibold text-gray-900 dark:text-white">{{ total }}</span> 条记录
        </div>
        <el-button type="primary" @click="handleAdd">
          <Plus class="w-4 h-4 mr-1" />
          新增补货员
        </el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        class="w-full"
        style="width: 100%"
      >
        <el-table-column prop="employee_no" label="员工编号" min-width="120" />
        <el-table-column prop="name" label="姓名" min-width="100" />
        <el-table-column prop="phone" label="手机号" min-width="130" />
        <el-table-column prop="area" label="负责区域" min-width="120" />
        <el-table-column label="状态" min-width="80">
          <template #default="{ row }">
            <StatusTag :status="getStatusTag(row.status)" :label="getStatusLabel(row.status)" />
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" min-width="160" />
        <el-table-column label="操作" min-width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">
              <Edit class="w-4 h-4 mr-1" />
              编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              <Trash2 class="w-4 h-4 mr-1" />
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.page_size"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
        class="mt-4"
      >
        <el-form-item label="员工编号" prop="employee_no">
          <el-input
            v-model="formData.employee_no"
            placeholder="请输入员工编号"
            :disabled="isEdit"
          />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="负责区域" prop="area">
          <el-input v-model="formData.area" placeholder="请输入负责区域" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">在职</el-radio>
            <el-radio :value="0">离职</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
