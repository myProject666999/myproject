<template>
  <div class="space-y-6 p-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">个人中心</h1>
      <el-button type="primary" :icon="Edit" @click="isEditing = !isEditing">
        {{ isEditing ? '取消编辑' : '编辑资料' }}
      </el-button>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :md="8">
        <el-card shadow="hover" class="text-center">
          <div class="py-6">
            <div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
              {{ userInfo.username.charAt(0) }}
            </div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ userInfo.username }}</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ userInfo.role }}</p>
            <el-tag :type="userInfo.status === 1 ? 'success' : 'danger'" class="mt-3" size="small">
              {{ userInfo.status === 1 ? '在线' : '离线' }}
            </el-tag>

            <div class="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div>
                <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ stats.tasks }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">今日任务</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ stats.completed }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">已完成</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-orange-600 dark:text-orange-400">{{ stats.pending }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">待处理</p>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="16">
        <el-card shadow="hover">
          <template #header>
            <span class="font-semibold text-gray-900 dark:text-white">基本信息</span>
          </template>

          <el-form :model="userInfo" :rules="rules" ref="formRef" label-width="100px" class="max-w-2xl">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="userInfo.username" :disabled="!isEditing" />
            </el-form-item>

            <el-form-item label="真实姓名" prop="realName">
              <el-input v-model="userInfo.realName" :disabled="!isEditing" />
            </el-form-item>

            <el-form-item label="手机号" prop="phone">
              <el-input v-model="userInfo.phone" :disabled="!isEditing" />
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input v-model="userInfo.email" :disabled="!isEditing" />
            </el-form-item>

            <el-form-item label="所属部门">
              <el-input v-model="userInfo.department" disabled />
            </el-form-item>

            <el-form-item label="角色">
              <el-input v-model="userInfo.role" disabled />
            </el-form-item>

            <el-form-item label="创建时间">
              <el-input v-model="userInfo.createdAt" disabled />
            </el-form-item>

            <el-form-item v-if="isEditing">
              <el-button type="primary" :icon="Save" @click="handleSave">保存修改</el-button>
              <el-button @click="isEditing = false">取消</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card shadow="hover" class="mt-6">
          <template #header>
            <span class="font-semibold text-gray-900 dark:text-white">操作记录</span>
          </template>

          <el-table :data="activityLogs" v-loading="loading">
            <el-table-column prop="time" label="时间" width="180" />
            <el-table-column prop="action" label="操作" />
            <el-table-column prop="ip" label="IP地址" width="140" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
                  {{ row.status === 'success' ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Edit, Save } from 'lucide-vue-next'

const isEditing = ref(false)
const loading = ref(false)
const formRef = ref<FormInstance>()

const userInfo = reactive({
  username: 'admin',
  realName: '系统管理员',
  phone: '13800138000',
  email: 'admin@example.com',
  department: '技术部',
  role: '系统管理员',
  status: 1,
  createdAt: '2025-01-01 00:00:00'
})

const stats = reactive({
  tasks: 12,
  completed: 8,
  pending: 4
})

const activityLogs = ref([
  { time: '2026-05-29 10:30:00', action: '登录系统', ip: '127.0.0.1', status: 'success' },
  { time: '2026-05-29 10:35:00', action: '查看货柜地图监控', ip: '127.0.0.1', status: 'success' },
  { time: '2026-05-29 10:40:00', action: '生成补货任务', ip: '127.0.0.1', status: 'success' },
  { time: '2026-05-29 11:00:00', action: '创建盘点单', ip: '127.0.0.1', status: 'success' },
  { time: '2026-05-29 11:30:00', action: '修改商品信息', ip: '127.0.0.1', status: 'success' }
])

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

async function handleSave() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  try {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('个人信息更新成功')
    isEditing.value = false
  } catch (error) {
    ElMessage.error('保存失败，请重试')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  document.title = '个人中心 - 无人智能货柜补货调度系统'
})
</script>
