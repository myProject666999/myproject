<template>
  <div class="page-container">
    <div class="page-header">
      <span class="page-title">版权授权</span>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新增授权
      </el-button>
    </div>

    <div class="table-container">
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="authorization_no" label="授权编号" width="180" />
        <el-table-column prop="drama_id" label="剧集ID" width="100" />
        <el-table-column prop="stakeholder_id" label="权益方ID" width="120" />
        <el-table-column prop="authorization_type" label="授权类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ getTypeText(row.authorization_type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="territory" label="授权地区" width="120" />
        <el-table-column prop="start_date" label="开始日期" width="120" />
        <el-table-column prop="end_date" label="结束日期" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="loadData"
      @current-change="loadData"
      style="margin-top: 20px; justify-content: flex-end"
    />

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑授权' : '新增授权'" width="600px">
      <el-form :model="form" ref="formRef" label-width="100px">
        <el-form-item label="剧集ID">
          <el-input-number v-model="form.drama_id" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="权益方ID">
          <el-input-number v-model="form.stakeholder_id" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="授权类型">
          <el-select v-model="form.authorization_type" style="width: 100%">
            <el-option label="独家" value="exclusive" />
            <el-option label="非独家" value="non_exclusive" />
            <el-option label="转授权" value="sublicense" />
          </el-select>
        </el-form-item>
        <el-form-item label="授权地区">
          <el-input v-model="form.territory" placeholder="请输入授权地区" />
        </el-form-item>
        <el-form-item label="开始日期">
          <el-date-picker
            v-model="form.start_date"
            type="date"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束日期">
          <el-date-picker
            v-model="form.end_date"
            type="date"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="有效" value="active" />
            <el-option label="已过期" value="expired" />
            <el-option label="已终止" value="terminated" />
          </el-select>
        </el-form-item>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getCopyrightList, createCopyright, updateCopyright, deleteCopyright } from '@/api/copyright'

const loading = ref(false)
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const dialogVisible = ref(false)
const formRef = ref(null)
const isEdit = ref(false)
const editId = ref(null)

const form = reactive({
  drama_id: 1,
  stakeholder_id: 1,
  authorization_type: 'non_exclusive',
  territory: '',
  start_date: '',
  end_date: '',
  status: 'active'
})

const getTypeText = (type) => {
  const map = {
    exclusive: '独家',
    non_exclusive: '非独家',
    sublicense: '转授权'
  }
  return map[type] || type
}

const getStatusType = (status) => {
  const map = {
    active: 'success',
    expired: 'info',
    terminated: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    active: '有效',
    expired: '已过期',
    terminated: '已终止'
  }
  return map[status] || status
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getCopyrightList({
      page: currentPage.value,
      page_size: pageSize.value
    })
    if (res) {
      tableData.value = res.list || []
      total.value = res.total || 0
    }
  } catch (error) {
    console.error('加载数据失败', error)
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  isEdit.value = false
  editId.value = null
  Object.assign(form, {
    drama_id: 1,
    stakeholder_id: 1,
    authorization_type: 'non_exclusive',
    territory: '',
    start_date: '',
    end_date: '',
    status: 'active'
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, {
    drama_id: row.drama_id,
    stakeholder_id: row.stakeholder_id,
    authorization_type: row.authorization_type,
    territory: row.territory,
    start_date: row.start_date,
    end_date: row.end_date,
    status: row.status
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      await updateCopyright(editId.value, form)
      ElMessage.success('更新成功')
    } else {
      await createCopyright(form)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('提交失败', error)
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这条授权记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteCopyright(row.id)
      ElMessage.success('删除成功')
      loadData()
    } catch (error) {
      console.error('删除失败', error)
    }
  }).catch(() => {})
}

onMounted(() => {
  loadData()
})
</script>
