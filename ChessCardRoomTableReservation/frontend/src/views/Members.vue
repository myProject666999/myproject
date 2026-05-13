<template>
  <div>
    <el-card>
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span>会员管理</span>
          <el-button type="primary" @click="openAddDialog" :icon="Plus">添加会员</el-button>
        </div>
      </template>
      <el-table :data="members" border>
        <el-table-column prop="memberNo" label="会员编号" width="150" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="phone" label="手机号" width="150" />
        <el-table-column prop="discountRate" label="折扣">
          <template #default="{ row }">
            {{ (row.discountRate * 100).toFixed(0) }}折
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="余额">
          <template #default="{ row }">
            ¥{{ row.balance?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="points" label="积分" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" effect="dark">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="editMember(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteMember(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑会员' : '添加会员'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="会员编号">
          <el-input v-model="form.memberNo" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="折扣率">
          <el-input-number v-model="form.discountRate" :min="0.5" :max="1" :step="0.05" :precision="2" />
          <span style="margin-left: 10px">{{ (form.discountRate * 100).toFixed(0) }}折</span>
        </el-form-item>
        <el-form-item label="余额">
          <el-input-number v-model="form.balance" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="积分">
          <el-input-number v-model="form.points" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMembers, createMember, updateMember, deleteMember as apiDeleteMember } from '../api'
import { Plus } from '@element-plus/icons-vue'

const members = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref({
  id: null,
  memberNo: '',
  name: '',
  phone: '',
  discountRate: 1,
  balance: 0,
  points: 0,
  status: 1
})

async function loadMembers() {
  try {
    members.value = await getMembers()
  } catch (e) {
    console.error(e)
  }
}

function openAddDialog() {
  isEdit.value = false
  const now = new Date()
  const no = 'M' + now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + 
             String(now.getDate()).padStart(2, '0') + String(now.getSeconds()).padStart(2, '0')
  form.value = { id: null, memberNo: no, name: '', phone: '', discountRate: 1, balance: 0, points: 0, status: 1 }
  dialogVisible.value = true
}

function editMember(row) {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

async function submitForm() {
  try {
    if (isEdit.value) {
      await updateMember(form.value)
      ElMessage.success('修改成功')
    } else {
      await createMember(form.value)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    loadMembers()
  } catch (e) {
    console.error(e)
  }
}

function deleteMember(row) {
  ElMessageBox.confirm('确定删除该会员吗？', '提示', { type: 'warning' })
    .then(async () => {
      await apiDeleteMember(row.id)
      ElMessage.success('删除成功')
      loadMembers()
    })
    .catch(() => {})
}

onMounted(() => {
  loadMembers()
})
</script>
