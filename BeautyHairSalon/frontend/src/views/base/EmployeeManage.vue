
<template>
  <div class="page-container">
    <el-form :inline="true" :model="queryForm" class="search-form">
      <el-form-item label="员工姓名">
        <el-input v-model="queryForm.keyword" placeholder="请输入姓名/编号/电话" clearable style="width: 180px;" />
      </el-form-item>
      <el-form-item label="职位">
        <el-select v-model="queryForm.position" placeholder="请选择" clearable style="width: 130px;">
          <el-option label="店长" value="店长" />
          <el-option label="技师" value="技师" />
          <el-option label="收银员" value="收银员" />
          <el-option label="助理" value="助理" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryForm.status" placeholder="请选择" clearable style="width: 100px;">
          <el-option label="在职" :value="1" />
          <el-option label="离职" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
        <el-button type="success" icon="Plus" @click="handleAdd">新增员工</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" stripe class="table-container" v-loading="loading">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="employeeNo" label="员工编号" width="120" />
      <el-table-column prop="employeeName" label="姓名" width="100" />
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column prop="position" label="职位" width="100" />
      <el-table-column prop="storeName" label="门店" width="120" />
      <el-table-column prop="isTechnician" label="是否技师" width="90">
        <template #default="{ row }">
          <el-tag :type="row.isTechnician === 1 ? 'success' : 'info'" size="small">
            {{ row.isTechnician === 1 ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="level" label="技师级别" width="100" />
      <el-table-column prop="commissionRate" label="提成比例" width="100">
        <template #default="{ row }">{{ row.commissionRate }}%</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
            {{ row.status === 1 ? '在职' : '离职' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.size"
      :total="pagination.total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      class="pagination-container"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑员工' : '新增员工'" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="员工编号" prop="employeeNo">
              <el-input v-model="form.employeeNo" placeholder="自动生成可修改" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="员工姓名" prop="employeeName">
              <el-input v-model="form.employeeName" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职位" prop="position">
              <el-select v-model="form.position" placeholder="请选择" style="width: 100%;">
                <el-option label="店长" value="店长" />
                <el-option label="技师" value="技师" />
                <el-option label="收银员" value="收银员" />
                <el-option label="助理" value="助理" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="是否技师">
              <el-switch v-model="form.isTechnician" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio :value="1">在职</el-radio>
                <el-radio :value="0">离职</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="form.isTechnician === 1">
          <el-col :span="12">
            <el-form-item label="技师级别">
              <el-input v-model="form.level" placeholder="如：高级技师" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="提成比例">
              <el-input-number v-model="form.commissionRate" :min="0" :max="100" :precision="1" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import request from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const queryForm = reactive({
  keyword: '',
  position: '',
  status: ''
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const tableData = ref([])

const form = reactive({
  id: null,
  employeeNo: '',
  employeeName: '',
  phone: '',
  position: '技师',
  isTechnician: 1,
  level: '',
  commissionRate: 30,
  status: 1
})

const rules = {
  employeeName: [{ required: true, message: '请输入员工姓名', trigger: 'blur' }]
}

const getList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current,
      size: pagination.size
    }
    if (queryForm.keyword) params.keyword = queryForm.keyword
    if (queryForm.position) params.position = queryForm.position
    if (queryForm.status !== '') params.status = queryForm.status
    
    const res = await request.get('/employee/page', { params })
    tableData.value = res.data.records || []
    pagination.total = res.data.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  getList()
}

const handleReset = () => {
  queryForm.keyword = ''
  queryForm.position = ''
  queryForm.status = ''
  pagination.current = 1
  getList()
}

const handlePageChange = (page) => {
  pagination.current = page
  getList()
}

const handleSizeChange = (size) => {
  pagination.size = size
  pagination.current = 1
  getList()
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(form, {
    id: null,
    employeeNo: '',
    employeeName: '',
    phone: '',
    position: '技师',
    isTechnician: 1,
    level: '',
    commissionRate: 30,
    status: 1
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该员工吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await request.delete(`/employee/${row.id}`)
    ElMessage.success('删除成功')
    getList()
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
    }
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    if (isEdit.value) {
      await request.put('/employee', form)
      ElMessage.success('更新成功')
    } else {
      await request.post('/employee', form)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    getList()
  } catch (e) {
    if (e !== false) {
      console.error(e)
    }
  }
}

onMounted(() => {
  getList()
})
</script>
