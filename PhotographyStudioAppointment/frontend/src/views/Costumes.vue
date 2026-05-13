<template>
  <div class="page-container">
    <div class="filter-bar">
      <el-select v-model="filter.category" placeholder="分类" clearable style="width: 150px" @change="fetchList">
        <el-option label="婚纱" value="wedding" />
        <el-option label="礼服" value="formal" />
        <el-option label="休闲" value="casual" />
        <el-option label="其他" value="other" />
      </el-select>
      <el-select v-model="filter.gender" placeholder="性别" clearable style="width: 120px" @change="fetchList">
        <el-option label="男" value="male" />
        <el-option label="女" value="female" />
        <el-option label="通用" value="unisex" />
        <el-option label="儿童" value="child" />
      </el-select>
      <el-select v-model="filter.status" placeholder="状态" clearable style="width: 120px" @change="fetchList">
        <el-option label="可用" value="available" />
        <el-option label="在用" value="in_use" />
        <el-option label="维修中" value="maintenance" />
        <el-option label="已报废" value="retired" />
      </el-select>
      <el-button type="primary" @click="fetchList">
        <el-icon><Search /></el-icon>
        搜索
      </el-button>
      <el-button type="success" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增服装
      </el-button>
    </div>

    <div class="table-container">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="name" label="服装名称" width="200" />
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ getCategoryText(row.category) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            {{ getGenderText(row.gender) }}
          </template>
        </el-table-column>
        <el-table-column prop="size" label="尺码" width="80" />
        <el-table-column prop="color" label="颜色" width="100" />
        <el-table-column prop="purchaseDate" label="购入日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.purchaseDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="rentalPrice" label="租金" width="100">
          <template #default="{ row }">
            ¥{{ row.rentalPrice }}/天
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchList"
        @current-change="fetchList"
      />
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="服装名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入服装名称" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
            <el-option label="婚纱" value="wedding" />
            <el-option label="礼服" value="formal" />
            <el-option label="休闲" value="casual" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="form.gender" placeholder="请选择性别" style="width: 100%">
            <el-option label="男" value="male" />
            <el-option label="女" value="female" />
            <el-option label="通用" value="unisex" />
            <el-option label="儿童" value="child" />
          </el-select>
        </el-form-item>
        <el-form-item label="尺码" prop="size">
          <el-input v-model="form.size" placeholder="如 S/M/L/XL" />
        </el-form-item>
        <el-form-item label="颜色" prop="color">
          <el-input v-model="form.color" placeholder="请输入颜色" />
        </el-form-item>
        <el-form-item label="购入日期" prop="purchaseDate">
          <el-date-picker v-model="form.purchaseDate" type="date" placeholder="选择日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="购入价格" prop="price">
          <el-input-number v-model="form.price" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="出租价格" prop="rentalPrice">
          <el-input-number v-model="form.rentalPrice" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="可用" value="available" />
            <el-option label="在用" value="in_use" />
            <el-option label="维修中" value="maintenance" />
            <el-option label="已报废" value="retired" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { getCostumes, createCostume, updateCostume, deleteCostume } from '@/api'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const formRef = ref(null)
const isEdit = ref(false)

const filter = reactive({
  category: '',
  gender: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const tableData = ref([])

const form = reactive({
  id: null,
  name: '',
  category: 'wedding',
  gender: 'female',
  size: '',
  color: '',
  purchaseDate: null,
  price: 0,
  rentalPrice: 0,
  status: 'available',
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入服装名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }]
}

const dialogTitle = computed(() => isEdit.value ? '编辑服装' : '新增服装')

const formatDate = (date) => date ? dayjs(date).format('YYYY-MM-DD') : '-'

const getCategoryText = (cat) => {
  const map = { wedding: '婚纱', formal: '礼服', casual: '休闲', other: '其他' }
  return map[cat] || cat
}

const getGenderText = (gender) => {
  const map = { male: '男', female: '女', unisex: '通用', child: '儿童' }
  return map[gender] || gender
}

const getStatusText = (status) => {
  const map = { available: '可用', in_use: '在用', maintenance: '维修中', retired: '已报废' }
  return map[status] || status
}

const getStatusTag = (status) => {
  const map = { available: 'success', in_use: 'primary', maintenance: 'warning', retired: 'danger' }
  return map[status] || 'info'
}

const fetchList = async () => {
  loading.value = true
  try {
    const data = await getCostumes({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filter
    })
    tableData.value = data.list
    pagination.total = data.total
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  Object.assign(form, {
    id: null,
    name: '',
    category: 'wedding',
    gender: 'female',
    size: '',
    color: '',
    purchaseDate: null,
    price: 0,
    rentalPrice: 0,
    status: 'available',
    description: ''
  })
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该服装吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteCostume(row.id)
      ElMessage.success('删除成功')
      fetchList()
    } catch (error) {
      console.error(error)
    }
  }).catch(() => {})
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitLoading.value = true
    if (isEdit.value) {
      await updateCostume(form.id, form)
      ElMessage.success('更新成功')
    } else {
      await createCostume(form)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchList()
  } catch (error) {
    console.error(error)
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  fetchList()
})
</script>
