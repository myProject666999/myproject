<template>
  <div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 20px">
      <h2>宠物档案管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增宠物
      </el-button>
    </div>

    <el-form :inline="true" style="margin-bottom: 20px">
      <el-form-item label="搜索">
        <el-input
          v-model="keyword"
          placeholder="搜索名称、品种、主人"
          clearable
          @keyup.enter="loadPets"
          style="width: 300px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="loadPets">搜索</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="pets" border stripe>
      <el-table-column prop="name" label="宠物名称" width="120" />
      <el-table-column prop="breed" label="品种" width="120" />
      <el-table-column label="性别" width="80">
        <template #default="scope">
          <span>{{ scope.row.gender === 'male' ? '公' : '母' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="weight" label="体重(kg)" width="100" />
      <el-table-column prop="birthDate" label="出生日期" width="120" />
      <el-table-column prop="personality" label="性格" show-overflow-tooltip />
      <el-table-column prop="ownerName" label="主人" width="100" />
      <el-table-column prop="ownerPhone" label="电话" width="130" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="warning" link @click="handleView(scope.row)">详情</el-button>
          <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑宠物' : '新增宠物'"
      width="700px"
    >
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="宠物名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入宠物名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="品种" prop="breed">
              <el-input v-model="form.breed" placeholder="请输入品种" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-select v-model="form.gender" placeholder="请选择性别" style="width: 100%">
                <el-option label="公" value="male" />
                <el-option label="母" value="female" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="体重" prop="weight">
              <el-input-number v-model="form.weight" :min="0" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出生日期">
              <el-date-picker
                v-model="form.birthDate"
                type="date"
                placeholder="选择出生日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主人姓名">
              <el-input v-model="form.ownerName" placeholder="请输入主人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主人电话">
              <el-input v-model="form.ownerPhone" placeholder="请输入主人电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性格">
              <el-input v-model="form.personality" placeholder="描述宠物性格" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="过敏史">
              <el-input
                v-model="form.allergies"
                type="textarea"
                :rows="2"
                placeholder="请输入过敏史"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="疫苗记录">
              <el-input
                v-model="form.vaccinationRecords"
                type="textarea"
                :rows="2"
                placeholder="请输入疫苗接种记录"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input
                v-model="form.notes"
                type="textarea"
                :rows="2"
                placeholder="备注信息"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="宠物详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="宠物名称">{{ currentPet.name }}</el-descriptions-item>
        <el-descriptions-item label="品种">{{ currentPet.breed }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ currentPet.gender === 'male' ? '公' : '母' }}</el-descriptions-item>
        <el-descriptions-item label="体重">{{ currentPet.weight }} kg</el-descriptions-item>
        <el-descriptions-item label="出生日期">{{ currentPet.birthDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="主人">{{ currentPet.ownerName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="电话">{{ currentPet.ownerPhone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="性格">{{ currentPet.personality || '-' }}</el-descriptions-item>
        <el-descriptions-item label="过敏史" :span="2">{{ currentPet.allergies || '-' }}</el-descriptions-item>
        <el-descriptions-item label="疫苗记录" :span="2">{{ currentPet.vaccinationRecords || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentPet.notes || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPets, createPet, updatePet, deletePet } from '@/api/pet'

const pets = ref([])
const keyword = ref('')
const dialogVisible = ref(false)
const detailVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const currentPet = ref({})

const form = reactive({
  id: '',
  name: '',
  breed: '',
  gender: 'male',
  weight: 0,
  birthDate: '',
  personality: '',
  allergies: '',
  ownerName: '',
  ownerPhone: '',
  vaccinationRecords: '',
  notes: ''
})

const rules = {
  name: [{ required: true, message: '请输入宠物名称', trigger: 'blur' }],
  breed: [{ required: true, message: '请输入品种', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  weight: [{ required: true, message: '请输入体重', trigger: 'blur' }]
}

const resetForm = () => {
  Object.assign(form, {
    id: '',
    name: '',
    breed: '',
    gender: 'male',
    weight: 0,
    birthDate: '',
    personality: '',
    allergies: '',
    ownerName: '',
    ownerPhone: '',
    vaccinationRecords: '',
    notes: ''
  })
}

const loadPets = async () => {
  const data = await getPets(keyword.value)
  pets.value = data
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

const handleView = (row) => {
  currentPet.value = row
  detailVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该宠物档案吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deletePet(row.id)
    ElMessage.success('删除成功')
    loadPets()
  }).catch(() => {})
}

const submitForm = async () => {
  await formRef.value.validate()
  if (isEdit.value) {
    await updatePet(form.id, form)
    ElMessage.success('更新成功')
  } else {
    await createPet(form)
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
  loadPets()
}

onMounted(() => {
  loadPets()
})
</script>
