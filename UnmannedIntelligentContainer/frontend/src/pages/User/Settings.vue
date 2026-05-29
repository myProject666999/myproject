<template>
  <div class="space-y-6 p-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">系统设置</h1>
      <el-button type="primary" :icon="Save" @click="handleSaveAll">
        保存所有设置
      </el-button>
    </div>

    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="基本设置" name="basic">
        <el-card shadow="hover">
          <template #header>
            <span class="font-semibold text-gray-900 dark:text-white">系统基本信息</span>
          </template>

          <el-form :model="basicSettings" label-width="120px" class="max-w-2xl">
            <el-form-item label="系统名称">
              <el-input v-model="basicSettings.systemName" />
            </el-form-item>
            <el-form-item label="系统版本">
              <el-input v-model="basicSettings.systemVersion" disabled />
            </el-form-item>
            <el-form-item label="运行环境">
              <el-input v-model="basicSettings.environment" disabled />
            </el-form-item>
            <el-form-item label="时区设置">
              <el-select v-model="basicSettings.timezone" class="w-full">
                <el-option label="Asia/Shanghai (UTC+8)" value="Asia/Shanghai" />
                <el-option label="UTC" value="UTC" />
                <el-option label="America/New_York (UTC-5)" value="America/New_York" />
              </el-select>
            </el-form-item>
            <el-form-item label="语言设置">
              <el-select v-model="basicSettings.language" class="w-full">
                <el-option label="简体中文" value="zh-CN" />
                <el-option label="English" value="en-US" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card shadow="hover" class="mt-6">
          <template #header>
            <span class="font-semibold text-gray-900 dark:text-white">业务参数设置</span>
          </template>

          <el-form :model="businessSettings" label-width="150px" class="max-w-2xl">
            <el-form-item label="低库存预警阈值">
              <el-input-number v-model="businessSettings.lowStockThreshold" :min="1" :max="100" />
              <span class="ml-2 text-sm text-gray-500 dark:text-gray-400">件（默认值）</span>
            </el-form-item>
            <el-form-item label="补货任务超时时间">
              <el-input-number v-model="businessSettings.taskTimeout" :min="1" :max="72" />
              <span class="ml-2 text-sm text-gray-500 dark:text-gray-400">小时</span>
            </el-form-item>
            <el-form-item label="自动生成补货任务">
              <el-switch v-model="businessSettings.autoGenerateTasks" />
            </el-form-item>
            <el-form-item label="自动发送通知">
              <el-switch v-model="businessSettings.autoNotify" />
            </el-form-item>
            <el-form-item label="数据保留天数">
              <el-input-number v-model="businessSettings.dataRetentionDays" :min="30" :max="3650" />
              <span class="ml-2 text-sm text-gray-500 dark:text-gray-400">天</span>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="通知设置" name="notification">
        <el-card shadow="hover">
          <template #header>
            <span class="font-semibold text-gray-900 dark:text-white">通知渠道设置</span>
          </template>

          <el-form :model="notificationSettings" label-width="120px" class="max-w-2xl">
            <el-form-item label="邮件通知">
              <el-switch v-model="notificationSettings.email.enabled" />
            </el-form-item>
            <el-form-item v-if="notificationSettings.email.enabled" label="SMTP服务器">
              <el-input v-model="notificationSettings.email.smtpHost" placeholder="smtp.example.com" />
            </el-form-item>
            <el-form-item v-if="notificationSettings.email.enabled" label="SMTP端口">
              <el-input-number v-model="notificationSettings.email.smtpPort" :min="1" :max="65535" />
            </el-form-item>
            <el-form-item v-if="notificationSettings.email.enabled" label="发件人邮箱">
              <el-input v-model="notificationSettings.email.sender" />
            </el-form-item>

            <el-divider />

            <el-form-item label="短信通知">
              <el-switch v-model="notificationSettings.sms.enabled" />
            </el-form-item>
            <el-form-item v-if="notificationSettings.sms.enabled" label="API密钥">
              <el-input v-model="notificationSettings.sms.apiKey" type="password" show-password />
            </el-form-item>

            <el-divider />

            <el-form-item label="微信通知">
              <el-switch v-model="notificationSettings.wechat.enabled" />
            </el-form-item>
            <el-form-item v-if="notificationSettings.wechat.enabled" label="企业微信Webhook">
              <el-input v-model="notificationSettings.wechat.webhookUrl" />
            </el-form-item>
          </el-form>
        </el-card>

        <el-card shadow="hover" class="mt-6">
          <template #header>
            <span class="font-semibold text-gray-900 dark:text-white">通知触发条件</span>
          </template>

          <el-form :model="notificationTriggers" label-width="150px" class="max-w-2xl">
            <el-form-item label="低库存预警">
              <el-switch v-model="notificationTriggers.lowStock" />
            </el-form-item>
            <el-form-item label="新补货任务">
              <el-switch v-model="notificationTriggers.newTask" />
            </el-form-item>
            <el-form-item label="任务超时">
              <el-switch v-model="notificationTriggers.taskTimeout" />
            </el-form-item>
            <el-form-item label="盘点完成">
              <el-switch v-model="notificationTriggers.stockCheckComplete" />
            </el-form-item>
            <el-form-item label="货损上报">
              <el-switch v-model="notificationTriggers.damageReport" />
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="安全设置" name="security">
        <el-card shadow="hover">
          <template #header>
            <span class="font-semibold text-gray-900 dark:text-white">密码安全</span>
          </template>

          <el-form label-width="120px" class="max-w-2xl">
            <el-form-item label="密码最小长度">
              <el-input-number v-model="securitySettings.passwordMinLength" :min="6" :max="32" />
            </el-form-item>
            <el-form-item label="密码复杂度">
              <el-checkbox-group v-model="securitySettings.passwordComplexity">
                <el-checkbox label="uppercase">包含大写字母</el-checkbox>
                <el-checkbox label="lowercase">包含小写字母</el-checkbox>
                <el-checkbox label="number">包含数字</el-checkbox>
                <el-checkbox label="special">包含特殊字符</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="密码过期时间">
              <el-input-number v-model="securitySettings.passwordExpireDays" :min="0" :max="365" />
              <span class="ml-2 text-sm text-gray-500 dark:text-gray-400">天（0表示永不过期）</span>
            </el-form-item>
            <el-form-item label="登录失败锁定">
              <el-input-number v-model="securitySettings.loginAttempts" :min="3" :max="10" />
              <span class="ml-2 text-sm text-gray-500 dark:text-gray-400">次后锁定账号</span>
            </el-form-item>
            <el-form-item label="会话超时时间">
              <el-input-number v-model="securitySettings.sessionTimeout" :min="15" :max="480" />
              <span class="ml-2 text-sm text-gray-500 dark:text-gray-400">分钟</span>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card shadow="hover" class="mt-6">
          <template #header>
            <span class="font-semibold text-gray-900 dark:text-white">修改密码</span>
          </template>

          <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="120px" class="max-w-2xl">
            <el-form-item label="当前密码" prop="currentPassword">
              <el-input v-model="passwordForm.currentPassword" type="password" show-password />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input v-model="passwordForm.newPassword" type="password" show-password />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleChangePassword">修改密码</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="系统信息" name="system">
        <el-card shadow="hover">
          <template #header>
            <span class="font-semibold text-gray-900 dark:text-white">系统状态</span>
          </template>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-500 dark:text-gray-400">CPU使用率</p>
                  <p class="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{{ systemStatus.cpu }}%</p>
                </div>
                <Cpu class="w-10 h-10 text-blue-500 opacity-50" />
              </div>
            </div>
            <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-500 dark:text-gray-400">内存使用率</p>
                  <p class="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{{ systemStatus.memory }}%</p>
                </div>
                <HardDrive class="w-10 h-10 text-green-500 opacity-50" />
              </div>
            </div>
            <div class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-500 dark:text-gray-400">磁盘使用率</p>
                  <p class="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{{ systemStatus.disk }}%</p>
                </div>
                <Database class="w-10 h-10 text-purple-500 opacity-50" />
              </div>
            </div>
            <div class="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-500 dark:text-gray-400">运行时间</p>
                  <p class="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">{{ systemStatus.uptime }}</p>
                </div>
                <Clock class="w-10 h-10 text-orange-500 opacity-50" />
              </div>
            </div>
          </div>
        </el-card>

        <el-card shadow="hover" class="mt-6">
          <template #header>
            <span class="font-semibold text-gray-900 dark:text-white">系统操作</span>
          </template>

          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h3 class="font-medium text-gray-900 dark:text-white">清除缓存</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">清除系统所有缓存数据，释放内存</p>
              </div>
              <el-button type="primary" :icon="Trash2" @click="handleClearCache">清除缓存</el-button>
            </div>
            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h3 class="font-medium text-gray-900 dark:text-white">重启服务</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">重新启动后端服务，将中断所有连接</p>
              </div>
              <el-button type="warning" :icon="RefreshCw" @click="handleRestart">重启服务</el-button>
            </div>
            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h3 class="font-medium text-gray-900 dark:text-white">数据备份</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">导出完整数据库备份，建议定期执行</p>
              </div>
              <el-button type="success" :icon="Download" @click="handleBackup">立即备份</el-button>
            </div>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Save, Cpu, HardDrive, Database, Clock, Trash2, RefreshCw, Download } from 'lucide-vue-next'

const activeTab = ref('basic')
const loading = ref(false)
const passwordFormRef = ref<FormInstance>()

const basicSettings = reactive({
  systemName: '无人智能货柜补货调度系统',
  systemVersion: 'v1.0.0',
  environment: '生产环境',
  timezone: 'Asia/Shanghai',
  language: 'zh-CN'
})

const businessSettings = reactive({
  lowStockThreshold: 5,
  taskTimeout: 24,
  autoGenerateTasks: true,
  autoNotify: true,
  dataRetentionDays: 365
})

const notificationSettings = reactive({
  email: {
    enabled: false,
    smtpHost: '',
    smtpPort: 465,
    sender: ''
  },
  sms: {
    enabled: false,
    apiKey: ''
  },
  wechat: {
    enabled: false,
    webhookUrl: ''
  }
})

const notificationTriggers = reactive({
  lowStock: true,
  newTask: true,
  taskTimeout: true,
  stockCheckComplete: true,
  damageReport: true
})

const securitySettings = reactive({
  passwordMinLength: 8,
  passwordComplexity: ['uppercase', 'lowercase', 'number'],
  passwordExpireDays: 90,
  loginAttempts: 5,
  sessionTimeout: 30
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules: FormRules = {
  currentPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const systemStatus = reactive({
  cpu: 35,
  memory: 62,
  disk: 45,
  uptime: '15天'
})

async function handleSaveAll() {
  try {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('所有设置已保存')
  } catch (error) {
    ElMessage.error('保存失败，请重试')
  } finally {
    loading.value = false
  }
}

async function handleChangePassword() {
  if (!passwordFormRef.value) return
  const valid = await passwordFormRef.value.validate().catch(() => false)
  if (!valid) return

  try {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('密码修改成功')
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (error) {
    ElMessage.error('密码修改失败，请重试')
  } finally {
    loading.value = false
  }
}

async function handleClearCache() {
  try {
    await ElMessageBox.confirm('确定要清除所有缓存吗？此操作不会影响数据。', '确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('缓存清除成功')
  } catch {
    // 用户取消
  } finally {
    loading.value = false
  }
}

async function handleRestart() {
  try {
    await ElMessageBox.confirm('确定要重启服务吗？此操作将中断所有连接！', '警告', {
      confirmButtonText: '确定重启',
      cancelButtonText: '取消',
      type: 'error'
    })
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('服务正在重启，请稍候...')
  } catch {
    // 用户取消
  } finally {
    loading.value = false
  }
}

async function handleBackup() {
  try {
    loading.value = true
    await new Promise(resolve => setTimeout(resolve, 1500))
    ElMessage.success('数据备份成功，文件已保存到备份目录')
  } catch (error) {
    ElMessage.error('备份失败，请重试')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  document.title = '系统设置 - 无人智能货柜补货调度系统'
})
</script>
