<template>
  <div class="page-container gray-page">
    <PageHeader title="灰度发布" description="管理应用的灰度发布策略，支持用户灰度、比例灰度和规则灰度">
      <template #actions>
        <el-button type="primary" :icon="Plus" @click="openCreateDialog">创建灰度发布</el-button>
      </template>
    </PageHeader>

    <div class="table-toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索灰度单号、应用"
          :prefix-icon="Search"
          clearable
          style="width: 280px"
          @keyup.enter="fetchGrayList"
          @clear="fetchGrayList"
        />
        <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 140px">
          <el-option label="待开始" :value="0" />
          <el-option label="进行中" :value="1" />
          <el-option label="已暂停" :value="2" />
          <el-option label="已全量" :value="3" />
          <el-option label="已回滚" :value="4" />
          <el-option label="已完成" :value="5" />
        </el-select>
        <el-button :icon="Refresh" @click="fetchGrayList">刷新</el-button>
      </div>
    </div>

    <el-table
      v-loading="loading"
      :data="grayList"
      border
      stripe
      style="width: 100%"
    >
      <el-table-column prop="grayNo" label="灰度单号" width="180" />
      <el-table-column prop="appCode" label="应用编码" width="140" />
      <el-table-column prop="targetVersion" label="目标版本" width="120" />
      <el-table-column label="灰度类型" width="120">
        <template #default="{ row }">
          <el-tag :type="row.grayType === 'percentage' ? 'primary' : row.grayType === 'user' ? 'success' : 'warning'">
            {{ getGrayTypeText(row.grayType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="灰度进度" width="280">
        <template #default="{ row }">
          <GrayProgress
            :percent="row.progress"
            :status="row.status === 1 ? 1 : row.status === 3 || row.status === 5 ? 2 : row.status === 4 ? 3 : 0"
            :success-count="row.hitCount"
            :total-count="row.totalCount"
            :show-detail="true"
            label="命中进度"
          />
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <StatusTag :status="row.status" type="gray" show-icon />
        </template>
      </el-table-column>
      <el-table-column prop="operator" label="操作人" width="100" />
      <el-table-column prop="createTime" label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="viewDetail(row)">详情</el-button>
          <el-button
            v-if="row.status === 0"
            type="success"
            link
            @click="handleStart(row)"
          >
            开始
          </el-button>
          <el-button
            v-if="row.status === 1"
            type="warning"
            link
            @click="handlePause(row)"
          >
            暂停
          </el-button>
          <el-button
            v-if="row.status === 1 || row.status === 2"
            type="success"
            link
            @click="handleFull(row)"
          >
            全量
          </el-button>
          <el-button
            v-if="row.status === 1 || row.status === 2"
            type="danger"
            link
            @click="handleRollback(row)"
          >
            回滚
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.size"
      :total="pagination.total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      class="pagination"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <el-dialog v-model="createDialogVisible" title="创建灰度发布" width="600px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="选择应用" prop="appId">
          <el-select v-model="formData.appId" placeholder="请选择应用" style="width: 100%" @change="handleAppChange">
            <el-option
              v-for="app in apps"
              :key="app.id"
              :label="`${app.appName} (${app.appCode})`"
              :value="app.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="目标版本" prop="targetVersion">
          <el-select v-model="formData.targetVersion" placeholder="请选择目标版本" style="width: 100%">
            <el-option
              v-for="version in versions"
              :key="version.version"
              :label="version.version"
              :value="version.version"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="灰度类型" prop="grayType">
          <el-radio-group v-model="formData.grayType">
            <el-radio value="user">用户灰度</el-radio>
            <el-radio value="percentage">比例灰度</el-radio>
            <el-radio value="rule">规则灰度</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="formData.grayType === 'percentage'" label="灰度比例" prop="percentage">
          <el-slider v-model="formData.percentage" :min="1" :max="100" show-input />
        </el-form-item>
        <el-form-item v-if="formData.grayType === 'user'" label="灰度用户" prop="userIds">
          <el-select
            v-model="formData.userIds"
            multiple
            filterable
            allow-create
            placeholder="输入用户ID，按回车添加"
            style="width: 100%"
          >
            <el-option label="user001" value="user001" />
            <el-option label="user002" value="user002" />
            <el-option label="user003" value="user003" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="formData.grayType === 'rule'" label="灰度规则" prop="ruleConfig">
          <el-input
            v-model="formData.ruleConfig"
            type="textarea"
            :rows="6"
            placeholder="请输入灰度规则，JSON格式，如：{&quot;region&quot;: [&quot;beijing&quot;, &quot;shanghai&quot;]}"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="form-footer">
          <el-button @click="createDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleCreate">创建</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="灰度详情" width="900px" destroy-on-close>
      <div v-if="currentGray" class="detail-content">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="灰度单号">{{ currentGray.grayNo }}</el-descriptions-item>
          <el-descriptions-item label="应用编码">{{ currentGray.appCode }}</el-descriptions-item>
          <el-descriptions-item label="目标版本">{{ currentGray.targetVersion }}</el-descriptions-item>
          <el-descriptions-item label="灰度类型">{{ getGrayTypeText(currentGray.grayType) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <StatusTag :status="currentGray.status" type="gray" />
          </el-descriptions-item>
          <el-descriptions-item label="操作人">{{ currentGray.operator }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(currentGray.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ formatDate(currentGray.startTime) }}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{ formatDate(currentGray.endTime) }}</el-descriptions-item>
        </el-descriptions>

        <GrayProgress
          :percent="currentGray.progress"
          :status="currentGray.status === 1 ? 1 : currentGray.status === 3 || currentGray.status === 5 ? 2 : currentGray.status === 4 ? 3 : 0"
          :success-count="currentGray.hitCount"
          :total-count="currentGray.totalCount"
          show-detail
          style="margin: 20px 0"
        />

        <el-tabs v-model="detailTab" class="detail-tabs">
          <el-tab-pane label="灰度规则" name="rule">
            <el-input
              v-model="ruleEditorContent"
              type="textarea"
              :rows="6"
              placeholder="编辑灰度规则"
              :disabled="currentGray.status !== 0 && currentGray.status !== 2"
            />
            <el-button
              v-if="currentGray.status === 0 || currentGray.status === 2"
              type="primary"
              style="margin-top: 12px"
              @click="saveRule"
            >
              保存规则
            </el-button>
          </el-tab-pane>
          <el-tab-pane label="灰度用户" name="user">
            <div class="user-toolbar">
              <el-select
                v-model="newUserId"
                filterable
                allow-create
                placeholder="添加用户ID"
                style="width: 200px"
              >
                <el-option label="user001" value="user001" />
                <el-option label="user002" value="user002" />
              </el-select>
              <el-button type="primary" :icon="Plus" @click="addGrayUser">添加</el-button>
            </div>
            <el-table :data="grayUsers" border style="margin-top: 12px">
              <el-table-column prop="userId" label="用户ID" width="200" />
              <el-table-column prop="userName" label="用户名" width="200" />
              <el-table-column prop="createTime" label="添加时间">
                <template #default="{ row }">
                  {{ formatDate(row.createTime) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100">
                <template #default="{ row }">
                  <el-button type="danger" link @click="removeGrayUser(row.id)">移除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="命中统计" name="stat">
            <el-row :gutter="20" style="margin-bottom: 20px">
              <el-col :span="6">
                <div class="stat-card info">
                  <div class="stat-number">{{ statistics?.totalCount || 0 }}</div>
                  <div class="stat-label">总请求数</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-card success">
                  <div class="stat-number">{{ statistics?.hitCount || 0 }}</div>
                  <div class="stat-label">命中数</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-card warning">
                  <div class="stat-number">{{ statistics?.missCount || 0 }}</div>
                  <div class="stat-label">未命中数</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="stat-card">
                  <div class="stat-number">{{ hitRate }}%</div>
                  <div class="stat-label">命中率</div>
                </div>
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import * as grayApi from '@/api/gray'
import * as appApi from '@/api/app'
import { formatDate, getGrayTypeText } from '@/utils/format'
import { createRules, validateRequired, validateJson, validateRange } from '@/utils/validate'
import type { GrayRelease, MicroApp, AppVersion, GrayUser } from '@/types'

const loading = ref(false)
const searchKeyword = ref('')
const statusFilter = ref<number | null>(null)
const grayList = ref<GrayRelease[]>([])
const apps = ref<MicroApp[]>([])
const versions = ref<AppVersion[]>([])
const grayUsers = ref<GrayUser[]>([])
const statistics = ref<any>(null)

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const createDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const formRef = ref()
const currentGray = ref<GrayRelease | null>(null)
const detailTab = ref('rule')
const ruleEditorContent = ref('')
const newUserId = ref('')

const formData = reactive({
  appId: null as number | null,
  targetVersion: '',
  grayType: 'percentage',
  percentage: 10,
  userIds: [] as string[],
  ruleConfig: '',
  remark: ''
})

const formRules = createRules({
  appId: [validateRequired('请选择应用')],
  targetVersion: [validateRequired('请选择目标版本')],
  grayType: [validateRequired('请选择灰度类型')],
  percentage: [validateRange(1, 100, '比例必须在1-100之间')],
  ruleConfig: [validateJson]
})

const hitRate = computed(() => {
  if (!statistics.value || statistics.value.totalCount === 0) return '0.00'
  return ((statistics.value.hitCount / statistics.value.totalCount) * 100).toFixed(2)
})

async function fetchApps() {
  apps.value = await appApi.getAllApps()
}

async function fetchGrayList() {
  loading.value = true
  try {
    const result = await grayApi.getGrayList({
      current: pagination.current,
      size: pagination.size,
      keyword: searchKeyword.value,
      status: statusFilter.value ?? undefined
    }) as any
    grayList.value = result.records
    pagination.total = result.total
    pagination.current = result.current
    pagination.size = result.size
  } finally {
    loading.value = false
  }
}

async function handleAppChange(appId: number) {
  versions.value = await appApi.getAppVersions(appId)
}

function handleSizeChange(size: number) {
  pagination.size = size
  pagination.current = 1
  fetchGrayList()
}

function handleCurrentChange(page: number) {
  pagination.current = page
  fetchGrayList()
}

function openCreateDialog() {
  Object.assign(formData, {
    appId: null,
    targetVersion: '',
    grayType: 'percentage',
    percentage: 10,
    userIds: [],
    ruleConfig: '',
    remark: ''
  })
  versions.value = []
  createDialogVisible.value = true
}

async function handleCreate() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  try {
    await grayApi.createGray(formData)
    ElMessage.success('创建成功')
    createDialogVisible.value = false
    fetchGrayList()
  } catch (e: any) {
    ElMessage.error(e.message || '创建失败')
  }
}

async function viewDetail(row: GrayRelease) {
  currentGray.value = row
  ruleEditorContent.value = row.ruleConfig || ''
  detailDialogVisible.value = true
  
  const [users, stats] = await Promise.all([
    grayApi.getGrayUsers(row.id),
    grayApi.getGrayStatistics(row.id)
  ])
  grayUsers.value = (users as any).records || users
  statistics.value = stats
}

async function handleStart(row: GrayRelease) {
  try {
    await ElMessageBox.confirm('确定要开始该灰度发布吗？', '确认操作', { type: 'warning' })
    await grayApi.startGray(row.id)
    ElMessage.success('已开始')
    fetchGrayList()
  } catch {
  }
}

async function handlePause(row: GrayRelease) {
  try {
    await ElMessageBox.confirm('确定要暂停该灰度发布吗？', '确认操作', { type: 'warning' })
    await grayApi.pauseGray(row.id)
    ElMessage.success('已暂停')
    fetchGrayList()
  } catch {
  }
}

async function handleFull(row: GrayRelease) {
  try {
    await ElMessageBox.confirm('确定要将该版本全量发布吗？', '确认操作', { type: 'warning' })
    await grayApi.fullGray(row.id)
    ElMessage.success('已全量发布')
    fetchGrayList()
  } catch {
  }
}

async function handleRollback(row: GrayRelease) {
  try {
    await ElMessageBox.confirm('确定要回滚该灰度发布吗？', '确认操作', { type: 'warning' })
    await grayApi.rollbackGray(row.id)
    ElMessage.success('已回滚')
    fetchGrayList()
  } catch {
  }
}

async function saveRule() {
  if (!currentGray.value) return
  try {
    await grayApi.updateGrayRule(currentGray.value.id, ruleEditorContent.value)
    ElMessage.success('规则保存成功')
  } catch (e: any) {
    ElMessage.error(e.message || '保存失败')
  }
}

async function addGrayUser() {
  if (!currentGray.value || !newUserId.value) return
  try {
    await grayApi.addGrayUsers(currentGray.value.id, [newUserId.value])
    ElMessage.success('添加成功')
    newUserId.value = ''
    const users = await grayApi.getGrayUsers(currentGray.value.id)
    grayUsers.value = (users as any).records || users
  } catch (e: any) {
    ElMessage.error(e.message || '添加失败')
  }
}

async function removeGrayUser(id: number) {
  try {
    await ElMessageBox.confirm('确定要移除该用户吗？', '确认操作', { type: 'warning' })
    await grayApi.removeGrayUser(id)
    ElMessage.success('移除成功')
    if (currentGray.value) {
      const users = await grayApi.getGrayUsers(currentGray.value.id)
      grayUsers.value = (users as any).records || users
    }
  } catch {
  }
}

onMounted(() => {
  fetchApps()
  fetchGrayList()
})
</script>

<style lang="scss" scoped>
.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}

.detail-content {
  .detail-tabs {
    margin-top: 20px;
  }

  .user-toolbar {
    display: flex;
    gap: 12px;
    align-items: center;
  }
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  padding: 20px;
  color: #fff;

  .stat-number {
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .stat-label {
    font-size: 14px;
    opacity: 0.9;
  }

  &.success {
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  }

  &.warning {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }

  &.info {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }
}
</style>
