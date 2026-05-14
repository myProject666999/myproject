<template>
  <div class="members-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>会员管理</span>
          <el-button type="primary" @click="openDialog">
            <el-icon><Plus /></el-icon>
            新增会员
          </el-button>
        </div>
      </template>

      <el-table :data="members" style="width: 100%" stripe v-loading="loading">
        <el-table-column prop="member_no" label="会员编号" width="140" />
        <el-table-column prop="real_name" label="姓名" width="100" />
        <el-table-column prop="phone" label="电话" width="130" />
        <el-table-column prop="balance" label="储值余额(元)" width="120">
          <template #default="{ row }">
            <span class="balance">¥{{ row.balance }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="remaining_hours" label="剩余时长(小时)" width="130">
          <template #default="{ row }">
            {{ row.remaining_hours || 0 }}h
          </template>
        </el-table-column>
        <el-table-column prop="join_date" label="入会日期" width="110" />
        <el-table-column prop="expire_date" label="到期日期" width="110">
          <template #default="{ row }">
            <el-tag v-if="row.expire_date" :type="isExpired(row.expire_date) ? 'danger' : 'success'">
              {{ row.expire_date }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openDialog(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <template v-if="!isEdit">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="用户名" prop="username">
                <el-input v-model="form.username" placeholder="请输入登录用户名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="初始密码">
                <el-input v-model="form.password" placeholder="留空使用默认密码" show-password />
              </el-form-item>
            </el-col>
          </el-row>
        </template>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="会员编号" prop="member_no">
              <el-input v-model="form.member_no" placeholder="请输入会员编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="real_name">
              <el-input v-model="form.real_name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="储值余额" prop="balance">
              <el-input-number v-model="form.balance" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="剩余时长" prop="remaining_hours">
              <el-input-number v-model="form.remaining_hours" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入会日期" prop="join_date">
              <el-date-picker
                v-model="form.join_date"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="到期日期">
          <el-date-picker
            v-model="form.expire_date"
            type="date"
            placeholder="选择日期（可选）"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../utils/request'

const members = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const formRef = ref(null)
const isEdit = ref(false)
const submitting = ref(false)

const today = new Date().toISOString().split('T')[0]

const form = reactive({
  id: null,
  username: '',
  password: '',
  real_name: '',
  phone: '',
  member_no: '',
  balance: 0,
  remaining_hours: 0,
  join_date: today,
  expire_date: null
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  real_name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入电话', trigger: 'blur' }],
  member_no: [{ required: true, message: '请输入会员编号', trigger: 'blur' }],
  join_date: [{ required: true, message: '请选择入会日期', trigger: 'change' }]
}

const editRules = {
  real_name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入电话', trigger: 'blur' }],
  member_no: [{ required: true, message: '请输入会员编号', trigger: 'blur' }],
  join_date: [{ required: true, message: '请选择入会日期', trigger: 'change' }]
}

const dialogTitle = computed(() => isEdit.value ? '编辑会员' : '新增会员')

const isExpired = (date) => {
  if (!date) return false
  return new Date(date) < new Date(today)
}

const loadMembers = async () => {
  loading.value = true
  try {
    const res = await request.get('/members')
    members.value = res.data || []
  } catch (error) {
    ElMessage.error('加载会员列表失败')
  } finally {
    loading.value = false
  }
}

const openDialog = (row = null) => {
  if (row) {
    isEdit.value = true
    Object.assign(form, {
      id: row.id,
      username: '',
      password: '',
      real_name: row.real_name,
      phone: row.phone,
      member_no: row.member_no,
      balance: Number(row.balance),
      remaining_hours: Number(row.remaining_hours),
      join_date: row.join_date,
      expire_date: row.expire_date
    })
  } else {
    isEdit.value = false
    Object.assign(form, {
      id: null,
      username: '',
      password: '',
      real_name: '',
      phone: '',
      member_no: 'M' + Date.now().toString().slice(-6),
      balance: 0,
      remaining_hours: 0,
      join_date: today,
      expire_date: null
    })
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  try {
    const currentRules = isEdit.value ? editRules : rules
    await formRef.value.validate(currentRules)
    submitting.value = true
    
    if (isEdit.value) {
      await request.put(`/members/${form.id}`, form)
      ElMessage.success('编辑成功')
    } else {
      await request.post('/members', form)
      ElMessage.success('新增成功')
    }
    
    dialogVisible.value = false
    loadMembers()
  } catch (error) {
    if (error !== false) {
      ElMessage.error('提交失败')
    }
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该会员吗？此操作将同时删除关联的用户账户。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await request.delete(`/members/${row.id}`)
    ElMessage.success('删除成功')
    loadMembers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadMembers()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.balance {
  color: #67c23a;
  font-weight: 500;
}
</style>
