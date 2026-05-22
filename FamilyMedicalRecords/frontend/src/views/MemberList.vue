<template>
  <div class="page-container">
    <div class="card-header">
      <span class="card-title">成员档案</span>
      <el-button type="primary" :icon="Plus" @click="showAddDialog = true">新增成员</el-button>
    </div>

    <el-card>
      <el-table :data="members" stripe>
        <el-table-column label="姓名" width="100">
          <template #default="{ row }">
            <el-avatar :size="36" style="margin-right:8px;vertical-align:middle;">
              {{ row.name?.charAt(0) }}
            </el-avatar>
            <span style="vertical-align:middle;">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="性别" width="80">
          <template #default="{ row }">
            {{ row.gender === 1 ? '男' : '女' }}
          </template>
        </el-table-column>
        <el-table-column prop="birthDate" label="出生日期" width="130" />
        <el-table-column prop="relation" label="关系" width="100" />
        <el-table-column prop="bloodType" label="血型" width="80" />
        <el-table-column label="身高/体重" width="140">
          <template #default="{ row }">
            {{ row.height ? row.height + 'cm' : '-' }} / {{ row.weight ? row.weight + 'kg' : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="goDetail(row)">查看详情</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="showAddDialog" :title="editingMember ? '编辑成员' : '新增成员'" width="560px">
      <el-form :model="form" label-width="90px" :rules="rules" ref="formRef">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio :value="1">男</el-radio>
            <el-radio :value="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="出生日期" prop="birthDate">
          <el-date-picker v-model="form.birthDate" type="date" value-format="YYYY-MM-DD" style="width:100%;" />
        </el-form-item>
        <el-form-item label="身份证号" prop="idCardNo">
          <el-input v-model="form.idCardNo" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="关系" prop="relation">
          <el-select v-model="form.relation" style="width:100%;">
            <el-option label="父亲" value="父亲" />
            <el-option label="母亲" value="母亲" />
            <el-option label="配偶" value="配偶" />
            <el-option label="儿子" value="儿子" />
            <el-option label="女儿" value="女儿" />
            <el-option label="兄弟" value="兄弟" />
            <el-option label="姐妹" value="姐妹" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="血型">
          <el-select v-model="form.bloodType" clearable style="width:100%;">
            <el-option label="A型" value="A型" />
            <el-option label="B型" value="B型" />
            <el-option label="AB型" value="AB型" />
            <el-option label="O型" value="O型" />
          </el-select>
        </el-form-item>
        <el-form-item label="身高(cm)">
          <el-input-number v-model="form.height" :min="0" :max="300" :precision="1" />
        </el-form-item>
        <el-form-item label="体重(kg)">
          <el-input-number v-model="form.weight" :min="0" :max="300" :precision="1" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.address" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { memberApi } from '../api'

const router = useRouter()
const members = ref([])
const showAddDialog = ref(false)
const editingMember = ref(null)
const formRef = ref(null)

const defaultForm = () => ({
  name: '', gender: 1, birthDate: '', idCardNo: '', phone: '',
  relation: '', bloodType: '', height: null, weight: null,
  address: '', remark: ''
})

const form = ref(defaultForm())

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  birthDate: [{ required: true, message: '请选择出生日期', trigger: 'change' }],
  relation: [{ required: true, message: '请选择关系', trigger: 'change' }]
}

const loadMembers = async () => {
  const res = await memberApi.list()
  members.value = res.data || []
}

const goDetail = row => router.push(`/members/${row.id}`)

const handleDelete = row => {
  ElMessageBox.confirm(`确定删除成员"${row.name}"吗？相关就诊记录也会被删除。`, '提示', {
    type: 'warning'
  }).then(async () => {
    await memberApi.delete(row.id)
    ElMessage.success('删除成功')
    loadMembers()
  }).catch(() => {})
}

const handleSubmit = async () => {
  await formRef.value.validate()
  if (editingMember.value) {
    await memberApi.update(editingMember.value.id, form.value)
    ElMessage.success('更新成功')
  } else {
    await memberApi.create(form.value)
    ElMessage.success('创建成功')
  }
  showAddDialog.value = false
  editingMember.value = null
  form.value = defaultForm()
  loadMembers()
}

onMounted(loadMembers)
</script>
