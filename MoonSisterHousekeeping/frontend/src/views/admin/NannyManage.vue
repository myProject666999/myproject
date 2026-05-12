<template>
  <div>
    <div class="page-header flex-between">
      <h2>月嫂管理</h2>
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon>
        添加月嫂
      </el-button>
    </div>

    <el-card>
      <el-table :data="nannies" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :size="50">
              <img :src="row.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'" />
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="等级">
          <template #default="{ row }">
            <el-tag type="success">{{ row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="age" label="年龄" width="80" />
        <el-table-column prop="experience" label="经验">
          <template #default="{ row }">
            {{ row.experience }}年
          </template>
        </el-table-column>
        <el-table-column label="评分">
          <template #default="{ row }">
            <el-rate v-model="row.rating" disabled size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 'available' ? 'success' : 'info'">
              {{ row.status === 'available' ? '可预约' : '服务中' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEditDialog(row)">编辑</el-button>
            <el-button type="primary" link @click="openSkillDialog(row)">技能</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="loadData"
        @current-change="loadData"
        class="mt-20"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑月嫂' : '添加月嫂'" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="等级">
          <el-select v-model="form.level" placeholder="请选择" style="width: 100%">
            <el-option label="初级" value="初级" />
            <el-option label="中级" value="中级" />
            <el-option label="高级" value="高级" />
          </el-select>
        </el-form-item>
        <el-form-item label="年龄">
          <el-input-number v-model="form.age" :min="18" :max="65" />
        </el-form-item>
        <el-form-item label="工作年限">
          <el-input-number v-model="form.experience" :min="0" :max="30" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" placeholder="请选择" style="width: 100%">
            <el-option label="可预约" value="available" />
            <el-option label="已预约" value="booked" />
            <el-option label="服务中" value="working" />
          </el-select>
        </el-form-item>
        <el-form-item label="个人简介">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入个人简介" />
        </el-form-item>
        <el-form-item label="视频简历">
          <el-input v-model="form.video_resume" placeholder="视频链接" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="skillDialogVisible" title="管理技能标签" width="500px">
      <el-checkbox-group v-model="selectedSkills">
        <el-checkbox v-for="skill in skills" :key="skill.id" :label="skill.id">
          {{ skill.name }}
        </el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="skillDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSkills">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getNannies, createNanny, updateNanny, deleteNanny, getSkills, addNannySkill } from '@/api'

const nannies = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const skillDialogVisible = ref(false)
const isEdit = ref(false)
const currentNanny = ref(null)
const skills = ref([])
const selectedSkills = ref([])

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  level: '初级',
  age: 30,
  experience: 1,
  status: 'available',
  description: '',
  video_resume: ''
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getNannies({
      page: pagination.page,
      page_size: pagination.pageSize
    })
    nannies.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const loadSkills = async () => {
  try {
    const res = await getSkills()
    skills.value = res.data
  } catch (error) {
    console.error(error)
  }
}

const openAddDialog = () => {
  isEdit.value = false
  Object.assign(form, {
    level: '初级',
    age: 30,
    experience: 1,
    status: 'available',
    description: '',
    video_resume: ''
  })
  dialogVisible.value = true
}

const openEditDialog = (nanny) => {
  isEdit.value = true
  currentNanny.value = nanny
  Object.assign(form, {
    level: nanny.level,
    age: nanny.age,
    experience: nanny.experience,
    status: nanny.status,
    description: nanny.description,
    video_resume: nanny.video_resume
  })
  dialogVisible.value = true
}

const submitForm = async () => {
  try {
    if (isEdit.value) {
      await updateNanny(currentNanny.value.id, form)
      ElMessage.success('更新成功')
    } else {
      await createNanny(form)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error(error)
  }
}

const handleDelete = async (nanny) => {
  try {
    await ElMessageBox.confirm('确定要删除该月嫂吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteNanny(nanny.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

const openSkillDialog = async (nanny) => {
  currentNanny.value = nanny
  await loadSkills()
  selectedSkills.value = nanny.skills?.map(s => s.id) || []
  skillDialogVisible.value = true
}

const saveSkills = async () => {
  try {
    await addNannySkill(currentNanny.value.id, { skill_ids: selectedSkills.value })
    ElMessage.success('保存成功')
    skillDialogVisible.value = false
    loadData()
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  loadData()
})
</script>
