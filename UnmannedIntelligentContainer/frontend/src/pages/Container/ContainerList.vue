<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search, Edit, Trash2, RefreshCw } from 'lucide-vue-next'
import StatusTag from '@/components/StatusTag.vue'
import {
  getContainerList,
  createContainer,
  updateContainer,
  deleteContainer
} from '@/api/container'
import type { Container, ContainerQuery, ContainerCreate, ContainerUpdate } from '@/types'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const currentId = ref<number | null>(null)

const queryParams = reactive<ContainerQuery>({
  page: 1,
  page_size: 10,
  keyword: '',
  area: '',
  status: undefined
})

const tableData = ref<Container[]>([])
const total = ref(0)

const formRef = ref<FormInstance>()
const formData = reactive<ContainerCreate>({
  container_no: '',
  name: '',
  address: '',
  longitude: 0,
  latitude: 0,
  area: '',
  status: 1,
  capacity: 0
})

const rules: FormRules = {
  container_no: [{ required: true, message: '请输入货柜编号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入货柜名称', trigger: 'blur' }],
  address: [{ required: true, message: '请输入货柜地址', trigger: 'blur' }],
  longitude: [{ required: true, message: '请输入经度', trigger: 'blur' }],
  latitude: [{ required: true, message: '请输入纬度', trigger: 'blur' }],
  area: [{ required: true, message: '请输入所属区域', trigger: 'blur' }]
}

const statusOptions = [
  { value: 1, label: '正常' },
  { value: 0, label: '停用' }
]

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getContainerList(queryParams)
    tableData.value = res.list
    total.value = res.total
  } catch (error) {
    console.error('Failed to fetch container list:', error)
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
  dialogTitle.value = '新增货柜'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: Container) => {
  isEdit.value = true
  dialogTitle.value = '编辑货柜'
  currentId.value = row.id
  Object.assign(formData, {
    container_no: row.container_no,
    name: row.name,
    address: row.address,
    longitude: row.longitude,
    latitude: row.latitude,
    area: row.area,
    status: row.status,
    capacity: row.capacity
  })
  dialogVisible.value = true
}

const handleDelete = (row: Container) => {
  ElMessageBox.confirm(`确定要删除货柜"${row.name}"吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        await deleteContainer(row.id)
        ElMessage.success('删除成功')
        fetchData()
      } catch (error) {
        console.error('Failed to delete container:', error)
      }
    })
    .catch(() => {})
}

const resetForm = () => {
  currentId.value = null
  formData.container_no = ''
  formData.name = ''
  formData.address = ''
  formData.longitude = 0
  formData.latitude = 0
  formData.area = ''
  formData.status = 1
  formData.capacity = 0
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value && currentId.value) {
          const updateData: ContainerUpdate = {
            name: formData.name,
            address: formData.address,
            longitude: formData.longitude,
            latitude: formData.latitude,
            area: formData.area,
            status: formData.status,
            capacity: formData.capacity
          }
          await updateContainer(currentId.value, updateData)
          ElMessage.success('更新成功')
        } else {
          await createContainer(formData)
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
  return status === 1 ? '正常' : '停用'
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="p-6">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">货柜管理</h2>
      <p class="text-gray-600 dark:text-gray-400 mt-1">管理智能货柜的基本信息</p>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
      <el-form :inline="true" :model="queryParams" class="flex flex-wrap gap-4">
        <el-form-item label="关键词">
          <el-input
            v-model="queryParams.keyword"
            placeholder="货柜编号/名称/地址"
            class="w-64"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <Search class="w-4 h-4 text-gray-400" />
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="区域">
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
          新增货柜
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
        <el-table-column prop="container_no" label="货柜编号" min-width="120" />
        <el-table-column prop="name" label="货柜名称" min-width="120" />
        <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="area" label="区域" min-width="100" />
        <el-table-column label="坐标" min-width="180">
          <template #default="{ row }">
            {{ row.longitude }}, {{ row.latitude }}
          </template>
        </el-table-column>
        <el-table-column prop="capacity" label="容量" min-width="80" />
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
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
        class="mt-4"
      >
        <el-form-item label="货柜编号" prop="container_no">
          <el-input
            v-model="formData.container_no"
            placeholder="请输入货柜编号"
            :disabled="isEdit"
          />
        </el-form-item>
        <el-form-item label="货柜名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入货柜名称" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="formData.address" placeholder="请输入货柜地址" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="经度" prop="longitude">
              <el-input-number
                v-model="formData.longitude"
                :precision="6"
                :step="0.000001"
                :min="-180"
                :max="180"
                class="w-full"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="纬度" prop="latitude">
              <el-input-number
                v-model="formData.latitude"
                :precision="6"
                :step="0.000001"
                :min="-90"
                :max="90"
                class="w-full"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="区域" prop="area">
              <el-input v-model="formData.area" placeholder="请输入所属区域" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="容量" prop="capacity">
              <el-input-number
                v-model="formData.capacity"
                :min="0"
                class="w-full"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="0">停用</el-radio>
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
