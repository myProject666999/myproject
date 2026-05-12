
<template>
  <div class="page-container">
    <el-form :inline="true" :model="queryForm" class="search-form">
      <el-form-item label="会员姓名">
        <el-input v-model="queryForm.keyword" placeholder="请输入姓名/手机号" clearable style="width: 200px;" />
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

    <el-table :data="tableData" stripe class="table-container" v-loading="loading">
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
        <template #default="{ row }">¥{{ row.balance || 0 }}</template>
      </el-table-column>
      <el-table-column prop="points" label="积分" width="80" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
            {{ row.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleView(row)">查看</el-button>
          <el-button type="success" link @click="handleEdit(row)">编辑</el-button>
          <el-button type="warning" link @click="handleRecharge(row)">充值</el-button>
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑会员' : '新增会员'" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="会员编号" prop="memberNo">
              <el-input v-model="form.memberNo" placeholder="自动生成可修改" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="会员姓名" prop="memberName">
              <el-input v-model="form.memberName" placeholder="请输入姓名" />
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
            <el-form-item label="性别">
              <el-radio-group v-model="form.gender">
                <el-radio :value="1">男</el-radio>
                <el-radio :value="0">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="生日">
              <el-date-picker v-model="form.birthday" type="date" placeholder="选择生日" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="会员等级" prop="level">
              <el-select v-model="form.level" placeholder="请选择" style="width: 100%;">
                <el-option label="普通会员" value="普通会员" />
                <el-option label="银卡会员" value="银卡会员" />
                <el-option label="金卡会员" value="金卡会员" />
                <el-option label="钻石会员" value="钻石会员" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="rechargeDialogVisible" title="会员充值" width="400px">
      <el-form :model="rechargeForm" :rules="rechargeRules" ref="rechargeFormRef" label-width="100px">
        <el-form-item label="会员姓名">
          <el-tag>{{ rechargeForm.memberName }}</el-tag>
        </el-form-item>
        <el-form-item label="当前余额">
          <el-tag type="success">¥{{ rechargeForm.balance || 0 }}</el-tag>
        </el-form-item>
        <el-form-item label="充值金额" prop="amount">
          <el-input-number v-model="rechargeForm.amount" :min="0" :precision="2" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rechargeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleRechargeSubmit">确认充值</el-button>
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
const rechargeDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const rechargeFormRef = ref(null)

const queryForm = reactive({
  keyword: '',
  level: ''
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const tableData = ref([])

const form = reactive({
  id: null,
  memberNo: '',
  memberName: '',
  phone: '',
  gender: 1,
  birthday: null,
  level: '普通会员',
  balance: 0,
  points: 0,
  remark: '',
  status: 1
})

const rechargeForm = reactive({
  id: null,
  memberName: '',
  balance: 0,
  amount: 0
})

const rules = {
  memberName: [{ required: true, message: '请输入会员姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  level: [{ required: true, message: '请选择会员等级', trigger: 'change' }]
}

const rechargeRules = {
  amount: [{ required: true, message: '请输入充值金额', trigger: 'blur' }]
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

const getList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current,
      size: pagination.size
    }
    if (queryForm.keyword) params.keyword = queryForm.keyword
    if (queryForm.level) params.level = queryForm.level
    
    const res = await request.get('/member/page', { params })
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
  queryForm.level = ''
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
    memberNo: '',
    memberName: '',
    phone: '',
    gender: 1,
    birthday: null,
    level: '普通会员',
    balance: 0,
    points: 0,
    remark: '',
    status: 1
  })
  dialogVisible.value = true
}

const handleView = (row) => {
  ElMessage.info(`查看会员: ${row.memberName}`)
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

const handleRecharge = (row) => {
  Object.assign(rechargeForm, {
    id: row.id,
    memberName: row.memberName,
    balance: row.balance,
    amount: 0
  })
  rechargeDialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除会员"${row.memberName}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await request.delete(`/member/${row.id}`)
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
      await request.put('/member', form)
      ElMessage.success('更新成功')
    } else {
      await request.post('/member', form)
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

const handleRechargeSubmit = async () => {
  try {
    await rechargeFormRef.value.validate()
    await request.post('/member/recharge', {
      memberId: rechargeForm.id,
      amount: rechargeForm.amount
    })
    ElMessage.success('充值成功')
    rechargeDialogVisible.value = false
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
