<template>
  <div class="page-container">
    <div v-if="userInfo" class="card">
      <div class="page-header">
        <h2>个人中心</h2>
        <el-button type="primary" @click="showEdit = true">编辑资料</el-button>
      </div>
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <el-avatar :size="80" :src="userInfo.avatar">
          {{ userInfo.nickname?.charAt(0) }}
        </el-avatar>
        <div style="margin-left: 20px;">
          <h2 style="margin: 0;">{{ userInfo.nickname }}</h2>
          <p style="color: #909399; margin: 5px 0;">@{{ userInfo.username }}</p>
          <el-tag v-if="userInfo.role === 1" type="danger">管理员</el-tag>
        </div>
      </div>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="邮箱">{{ userInfo.email || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="userInfo.status === 1 ? 'success' : 'danger'">
            {{ userInfo.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="通过题目数">{{ userInfo.solvedCount }}</el-descriptions-item>
        <el-descriptions-item label="提交次数">{{ userInfo.submitCount }}</el-descriptions-item>
        <el-descriptions-item label="积分">{{ userInfo.rating }}</el-descriptions-item>
        <el-descriptions-item label="通过率">
          {{ userInfo.submitCount > 0 ? ((userInfo.solvedCount / userInfo.submitCount * 100).toFixed(1) + '%') : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ userInfo.createTime }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="card">
      <h3>我的提交记录</h3>
      <el-table :data="submissions" stripe>
        <el-table-column label="题目" width="200">
          <template #default="scope">
            <router-link :to="`/problem/detail/${scope.row.problemId}`">
              {{ scope.row.problem?.title || `#${scope.row.problemId}` }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="语言" prop="language" width="80" />
        <el-table-column label="状态" width="150">
          <template #default="scope">
            <span :class="getStatusClass(scope.row.status)">{{ scope.row.statusText }}</span>
          </template>
        </el-table-column>
        <el-table-column label="用时" width="80">
          <template #default="scope">
            {{ scope.row.timeUsed ? scope.row.timeUsed + 'ms' : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="提交时间" prop="createTime" width="170" />
      </el-table>
    </div>

    <el-dialog v-model="showEdit" title="编辑资料" width="500px">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef">
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="editForm.nickname" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEdit = false">取消</el-button>
        <el-button type="primary" @click="handleUpdate">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const userInfo = ref(null)
const submissions = ref([])
const showEdit = ref(false)
const editFormRef = ref(null)

const editForm = ref({
  nickname: '',
  email: ''
})

const editRules = {
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }]
}

const fetchUserInfo = async () => {
  const res = await request.get('/user/info')
  userInfo.value = res.data
  editForm.value.nickname = res.data.nickname
  editForm.value.email = res.data.email
}

const fetchSubmissions = async () => {
  const res = await request.get('/submission/mine', { params: { size: 20 } })
  submissions.value = res.data.records
}

const handleUpdate = async () => {
  if (!editFormRef.value) return
  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await request.put('/user/update', editForm.value)
        ElMessage.success('更新成功')
        showEdit.value = false
        fetchUserInfo()
      } catch (e) {
        // error handled
      }
    }
  })
}

const getStatusClass = (s) => {
  if (s === 2) return 'status-accepted'
  if (s === 0 || s === 1) return 'status-pending'
  return 'status-error'
}

onMounted(() => {
  fetchUserInfo()
  fetchSubmissions()
})
</script>
