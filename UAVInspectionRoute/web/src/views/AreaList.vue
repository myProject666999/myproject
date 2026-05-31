<template>
  <div class="page-container">
    <div class="table-toolbar">
      <el-input v-model="searchName" placeholder="搜索区域名称" style="width: 240px" clearable @clear="loadList" @keyup.enter="loadList">
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-button type="primary" @click="openDialog()"><el-icon><Plus /></el-icon>新增区域</el-button>
    </div>

    <el-table :data="tableData" v-loading="loading" border stripe>
      <el-table-column prop="name" label="区域名称" min-width="140" />
      <el-table-column prop="type" label="区域类型" width="120">
        <template #default="{ row }">
          <el-tag :type="typeTagMap[row.type] || 'info'">{{ typeLabelMap[row.type] || row.type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
      <el-table-column prop="createdAt" label="创建时间" width="170" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="openDialog(row)">编辑</el-button>
          <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="total > 0"
      style="margin-top: 16px; justify-content: flex-end"
      :current-page="page"
      :page-size="pageSize"
      :total="total"
      layout="total, prev, pager, next"
      @current-change="loadList"
    />

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑区域' : '新增区域'" width="520px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入区域名称" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择区域类型" style="width: 100%">
            <el-option label="电力线路" value="power_line" />
            <el-option label="光伏电站" value="solar_plant" />
            <el-option label="风电场" value="wind_farm" />
            <el-option label="油气管道" value="oil_gas" />
            <el-option label="桥梁" value="bridge" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAreaList, createArea, updateArea, deleteArea } from '../api/area'

const typeTagMap = {
  power_line: 'danger',
  solar_plant: 'warning',
  wind_farm: 'success',
  oil_gas: '',
  bridge: 'info',
  other: 'info'
}
const typeLabelMap = {
  power_line: '电力线路',
  solar_plant: '光伏电站',
  wind_farm: '风电场',
  oil_gas: '油气管道',
  bridge: '桥梁',
  other: '其他'
}

const loading = ref(false)
const submitting = ref(false)
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const searchName = ref('')
const dialogVisible = ref(false)
const editingId = ref(null)
const formRef = ref(null)

const form = reactive({ name: '', type: '', description: '' })
const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }]
}

async function loadList() {
  loading.value = true
  try {
    const res = await getAreaList({ page: page.value, pageSize: pageSize.value, name: searchName.value })
    tableData.value = res.data.list || []
    total.value = res.data.total || 0
  } finally {
    loading.value = false
  }
}

function openDialog(row) {
  editingId.value = row?.id || null
  if (row) {
    Object.assign(form, { name: row.name, type: row.type, description: row.description })
  } else {
    Object.assign(form, { name: '', type: '', description: '' })
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    if (editingId.value) {
      await updateArea(editingId.value, { ...form })
      ElMessage.success('更新成功')
    } else {
      await createArea({ ...form })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadList()
  } finally {
    submitting.value = false
  }
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确定删除区域「${row.name}」？`, '提示', { type: 'warning' })
  await deleteArea(row.id)
  ElMessage.success('删除成功')
  loadList()
}

onMounted(() => loadList())
</script>
