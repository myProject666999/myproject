
<template>
  <div class="page-container">
    <el-form :inline="true" :model="queryForm" class="search-form">
      <el-form-item label="会员姓名">
        <el-input v-model="queryForm.memberName" placeholder="请输入会员姓名" clearable style="width: 200px;" />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="queryForm.phone" placeholder="请输入手机号" clearable style="width: 200px;" />
      </el-form-item>
      <el-form-item label="会员等级">
        <el-select v-model="queryForm.level" placeholder="请选择" clearable style="width: 150px;">
          <el-option label="普通会员" value="普通会员" />
          <el-option label="银卡会员" value="银卡会员" />
          <el-option label="金卡会员" value="金卡会员" />
          <el-option label="钻石会员" value="钻石会员" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
        <el-button type="success" icon="Plus" @click="handleAdd">新增会员</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" stripe class="table-container">
      <el-table-column prop="memberNo" label="会员编号" width="150" />
      <el-table-column prop="memberName" label="姓名" width="100" />
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column prop="gender" label="性别" width="60">
        <template #default="{ row }">
          {{ row.gender === 1 ? '男' : row.gender === 0 ? '女' : '未知' }}
        </template>
      </el-table-column>
      <el-table-column prop="birthday" label="生日" width="120" />
      <el-table-column prop="level" label="会员等级" width="100">
        <template #default="{ row }">
          <el-tag :type="getLevelTagType(row.level)">{{ row.level }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="balance" label="储值余额" width="100">
        <template #default="{ row }">
          ¥{{ row.balance || 0 }}
        </template>
      </el-table-column>
      <el-table-column prop="points" label="积分" width="80" />
      <el-table-column prop="registerDate" label="注册日期" width="120" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleView(row)">查看</el-button>
          <el-button type="success" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="warning" link @click="handleRecharge(row)">充值</el-button>
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
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { getMemberPage, deleteMember } from '@/api/member'
import { ElMessage, ElMessageBox } from 'element-plus'

const queryForm = reactive({
  memberName: '',
  phone: '',
  level: ''
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const tableData = ref([])
const loading = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current,
      size: pagination.size
    }
    if (queryForm.memberName) {
      params.keyword = queryForm.memberName
    }
    if (queryForm.phone && !queryForm.memberName) {
      params.keyword = queryForm.phone
    }
    if (queryForm.level) {
      params.level = queryForm.level
    }
    
    const res = await getMemberPage(params)
    if (res.code === 200 && res.data) {
      tableData.value = res.data.records || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const getLevelTagType = (level) => {
  const map = {
    '普通会员': 'info',
    '银卡会员': 'primary',
    '金卡会员': 'success',
    '钻石会员': 'warning'
  }
  return map[level] || 'info'
}

const handleSearch = () => {
  pagination.current = 1
  loadData()
}

const handleReset = () => {
  queryForm.memberName = ''
  queryForm.phone = ''
  queryForm.level = ''
  pagination.current = 1
  loadData()
}

const handleAdd = () => {
  ElMessage.info('新增会员功能')
}

const handleView = (row) => {
  ElMessage.info(`查看会员: ${row.memberName}`)
}

const handleEdit = (row) => {
  ElMessage.info(`编辑会员: ${row.memberName}`)
}

const handleRecharge = (row) => {
  ElMessage.info(`会员充值: ${row.memberName}`)
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除会员"${row.memberName}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res = await deleteMember(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

watch(() => pagination.current, () => loadData())
watch(() => pagination.size, () => {
  pagination.current = 1
  loadData()
})

onMounted(() => {
  loadData()
})
</script>
