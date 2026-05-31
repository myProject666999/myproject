<template>
  <div class="page-container config-page">
    <PageHeader title="配置下发" description="管理全局和应用级配置，支持配置发布和实时推送">
      <template #actions>
        <el-badge v-if="wsConnected" :value="1" type="success" class="ws-badge">
          <span class="ws-status">实时推送已连接</span>
        </el-badge>
        <el-badge v-else :value="0" type="danger">
          <span class="ws-status">实时推送未连接</span>
        </el-badge>
      </template>
    </PageHeader>

    <div class="stat-row">
      <div class="stat-card info">
        <div class="stat-number">{{ configStore.pagination.total }}</div>
        <div class="stat-label">配置总数</div>
      </div>
      <div class="stat-card success">
        <div class="stat-number">{{ configStore.enabledCount }}</div>
        <div class="stat-label">已启用</div>
      </div>
      <div class="stat-card danger">
        <div class="stat-number">{{ configStore.disabledCount }}</div>
        <div class="stat-label">已禁用</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-number">{{ configStore.pendingCount }}</div>
        <div class="stat-label">待发布</div>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="main-tabs">
      <el-tab-pane label="配置列表" name="list">
        <div class="scope-switch">
          <el-radio-group v-model="configStore.currentScope" @change="handleScopeChange">
            <el-radio-button value="global">全局配置</el-radio-button>
            <el-radio-button value="app">应用级配置</el-radio-button>
          </el-radio-group>
          <el-select
            v-if="configStore.currentScope === 'app'"
            v-model="selectedAppId"
            placeholder="选择应用"
            style="width: 220px; margin-left: 12px"
            @change="fetchConfigs"
          >
            <el-option
              v-for="app in apps"
              :key="app.id"
              :label="`${app.appName} (${app.appCode})`"
              :value="app.id"
            />
          </el-select>
        </div>

        <div class="table-toolbar">
          <div class="toolbar-left">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索配置键、描述"
              :prefix-icon="Search"
              clearable
              style="width: 280px"
              @keyup.enter="fetchConfigs"
              @clear="fetchConfigs"
            />
            <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 140px">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
              <el-option label="待发布" :value="2" />
            </el-select>
            <el-button :icon="Refresh" @click="fetchConfigs">刷新</el-button>
          </div>
          <div class="toolbar-right">
            <el-button :icon="Upload" @click="openPublishDialog">发布配置</el-button>
            <el-button type="primary" :icon="Plus" @click="openAddDialog">新增配置</el-button>
          </div>
        </div>

        <el-table
          v-loading="configStore.loading"
          :data="configStore.configs"
          border
          stripe
          style="width: 100%"
        >
          <el-table-column prop="configKey" label="配置键" width="220" />
          <el-table-column label="配置值" min-width="200" show-overflow-tooltip>
            <template #default="{ row }">
              <code class="config-value">{{ row.configValue }}</code>
            </template>
          </el-table-column>
          <el-table-column label="类型" width="100">
            <template #default="{ row }">
              {{ getConfigTypeText(row.configType) }}
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" min-width="180" show-overflow-tooltip />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <StatusTag :status="row.status" type="config" show-icon />
            </template>
          </el-table-column>
          <el-table-column prop="version" label="版本" width="80" />
          <el-table-column v-if="configStore.currentScope === 'app'" prop="appCode" label="所属应用" width="120" />
          <el-table-column prop="updateTime" label="更新时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.updateTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="openEditDialog(row)">编辑</el-button>
              <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          v-model:current-page="configStore.pagination.current"
          v-model:page-size="configStore.pagination.size"
          :total="configStore.pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          class="pagination"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </el-tab-pane>

      <el-tab-pane label="发布历史" name="history">
        <div class="table-toolbar">
          <div class="toolbar-left">
            <el-select v-model="publishStatusFilter" placeholder="状态筛选" clearable style="width: 140px">
              <el-option label="待发布" :value="0" />
              <el-option label="发布中" :value="1" />
              <el-option label="发布成功" :value="2" />
              <el-option label="发布失败" :value="3" />
            </el-select>
            <el-button :icon="Refresh" @click="fetchPublishHistory">刷新</el-button>
          </div>
        </div>

        <el-table
          v-loading="configStore.loading"
          :data="configStore.publishHistory"
          border
          stripe
          style="width: 100%"
        >
          <el-table-column prop="publishNo" label="发布单号" width="180" />
          <el-table-column label="发布类型" width="100">
            <template #default="{ row }">
              <el-tag :type="row.publishType === 'full' ? 'primary' : 'success'">
                {{ row.publishType === 'full' ? '全量' : '增量' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="范围" width="100">
            <template #default="{ row }">
              <el-tag>{{ row.scope === 'global' ? '全局' : '应用' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="发布进度" width="280">
            <template #default="{ row }">
              <GrayProgress
                :percent="row.progress"
                :status="row.status"
                :success-count="row.successCount"
                :fail-count="row.failCount"
                :total-count="row.totalCount"
                :show-detail="row.status === 1 || row.status === 2 || row.status === 3"
              />
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <StatusTag :status="row.status" type="publish" />
            </template>
          </el-table-column>
          <el-table-column prop="operator" label="操作人" width="100" />
          <el-table-column prop="publishTime" label="发布时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.publishTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="viewPublishDetail(row)">详情</el-button>
              <el-button
                v-if="row.status === 1"
                type="warning"
                link
                @click="handleCancelPublish(row)"
              >
                取消
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          v-model:current-page="configStore.publishPagination.current"
          v-model:page-size="configStore.publishPagination.size"
          :total="configStore.publishPagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          class="pagination"
          @size-change="handlePublishSizeChange"
          @current-change="handlePublishCurrentChange"
        />
      </el-tab-pane>
    </el-tabs>

    <el-dialog
      v-model="configDialogVisible"
      :title="isEdit ? '编辑配置' : '新增配置'"
      width="650px"
      destroy-on-close
    >
      <ConfigEditor
        ref="configEditorRef"
        v-model="formData"
        :is-edit="isEdit"
      />
      <template #footer>
        <div class="form-footer">
          <el-button @click="configDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfigSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="publishDialogVisible" title="发布配置" width="500px" destroy-on-close>
      <el-form ref="publishFormRef" :model="publishForm" :rules="publishRules" label-width="100px">
        <el-form-item label="发布类型" prop="publishType">
          <el-radio-group v-model="publishForm.publishType">
            <el-radio value="full">全量发布</el-radio>
            <el-radio value="incremental">增量发布</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="发布范围" prop="scope">
          <el-radio-group v-model="publishForm.scope" @change="handlePublishScopeChange">
            <el-radio value="global">全局</el-radio>
            <el-radio value="app">指定应用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="publishForm.scope === 'app'" label="选择应用" prop="appId">
          <el-select v-model="publishForm.appId" placeholder="请选择应用" style="width: 100%">
            <el-option
              v-for="app in apps"
              :key="app.id"
              :label="`${app.appName} (${app.appCode})`"
              :value="app.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="publishForm.publishType === 'incremental'" label="选择配置" prop="configIds">
          <el-select
            v-model="publishForm.configIds"
            multiple
            filterable
            placeholder="请选择要发布的配置"
            style="width: 100%"
          >
            <el-option
              v-for="config in configStore.configs"
              :key="config.id"
              :label="`${config.configKey} - ${config.description}`"
              :value="config.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="form-footer">
          <el-button @click="publishDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handlePublish">发布</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="发布详情" width="600px">
      <el-descriptions :column="2" border v-if="publishDetail">
        <el-descriptions-item label="发布单号">{{ publishDetail.publishNo }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <StatusTag :status="publishDetail.status" type="publish" />
        </el-descriptions-item>
        <el-descriptions-item label="发布类型">
          {{ publishDetail.publishType === 'full' ? '全量' : '增量' }}
        </el-descriptions-item>
        <el-descriptions-item label="范围">
          {{ publishDetail.scope === 'global' ? '全局' : '应用' }}
        </el-descriptions-item>
        <el-descriptions-item label="进度">{{ publishDetail.progress }}%</el-descriptions-item>
        <el-descriptions-item label="操作人">{{ publishDetail.operator }}</el-descriptions-item>
        <el-descriptions-item label="成功数">{{ publishDetail.successCount }}</el-descriptions-item>
        <el-descriptions-item label="失败数">{{ publishDetail.failCount }}</el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ formatDate(publishDetail.publishTime) }}</el-descriptions-item>
        <el-descriptions-item label="完成时间">{{ formatDate(publishDetail.completeTime) }}</el-descriptions-item>
      </el-descriptions>
      <GrayProgress
        v-if="publishDetail"
        :percent="publishDetail.progress"
        :status="publishDetail.status"
        :success-count="publishDetail.successCount"
        :fail-count="publishDetail.failCount"
        :total-count="publishDetail.totalCount"
        show-detail
        style="margin-top: 20px"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Upload } from '@element-plus/icons-vue'
import { useConfigStore } from '@/stores/configStore'
import { formatDate, getConfigTypeText } from '@/utils/format'
import { createRules, validateRequired } from '@/utils/validate'
import { subscribe, isConnected } from '@/utils/websocket'
import * as appApi from '@/api/app'
import * as configApi from '@/api/config'
import type { MicroApp, RuntimeConfig, ConfigPublish } from '@/types'

const configStore = useConfigStore()

const activeTab = ref('list')
const searchKeyword = ref('')
const statusFilter = ref<number | null>(null)
const publishStatusFilter = ref<number | null>(null)
const selectedAppId = ref<number | null>(null)
const apps = ref<MicroApp[]>([])
const wsConnected = ref(false)
let unsubscribe: (() => void) | null = null

const configDialogVisible = ref(false)
const publishDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const isEdit = ref(false)
const configEditorRef = ref()
const publishFormRef = ref()

const formData = reactive<Partial<RuntimeConfig>>({
  configKey: '',
  configValue: '',
  configType: 'string',
  description: '',
  status: 1,
  scope: 'global'
})

const publishForm = reactive({
  publishType: 'full',
  scope: 'global',
  appId: null as number | null,
  configIds: [] as number[]
})

const publishDetail = ref<ConfigPublish | null>(null)

const publishRules = createRules({
  publishType: [validateRequired('请选择发布类型')],
  scope: [validateRequired('请选择发布范围')],
  appId: [
    { required: true, message: '请选择应用', trigger: 'change' }
  ],
  configIds: [
    { required: true, message: '请选择要发布的配置', trigger: 'change' }
  ]
})

async function fetchApps() {
  apps.value = await appApi.getAllApps()
}

async function fetchConfigs() {
  const appId = configStore.currentScope === 'app' ? selectedAppId.value : undefined
  await configStore.fetchConfigs({
    keyword: searchKeyword.value,
    status: statusFilter.value ?? undefined,
    appId
  })
}

async function fetchPublishHistory() {
  await configStore.fetchPublishHistory({
    status: publishStatusFilter.value ?? undefined
  })
}

function handleScopeChange() {
  configStore.setScope(configStore.currentScope, selectedAppId.value ?? undefined)
  fetchConfigs()
}

function handleSizeChange(size: number) {
  configStore.setPagination(1, size)
  fetchConfigs()
}

function handleCurrentChange(page: number) {
  configStore.setPagination(page)
  fetchConfigs()
}

function handlePublishSizeChange(size: number) {
  configStore.setPublishPagination(1, size)
  fetchPublishHistory()
}

function handlePublishCurrentChange(page: number) {
  configStore.setPublishPagination(page)
  fetchPublishHistory()
}

function openAddDialog() {
  isEdit.value = false
  Object.assign(formData, {
    configKey: '',
    configValue: '',
    configType: 'string',
    description: '',
    status: 1,
    scope: configStore.currentScope,
    appId: configStore.currentScope === 'app' ? selectedAppId.value : undefined,
    appCode: configStore.currentScope === 'app'
      ? apps.value.find(a => a.id === selectedAppId.value)?.appCode
      : undefined
  })
  configDialogVisible.value = true
}

function openEditDialog(row: RuntimeConfig) {
  isEdit.value = true
  Object.assign(formData, row)
  configDialogVisible.value = true
}

async function handleConfigSubmit() {
  const valid = await configEditorRef.value?.validate().catch(() => false)
  if (!valid) return

  try {
    if (isEdit.value && formData.id) {
      await configStore.updateConfig(formData.id, formData)
      ElMessage.success('更新成功')
    } else {
      await configStore.createConfig(formData)
      ElMessage.success('创建成功')
    }
    configDialogVisible.value = false
    fetchConfigs()
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败')
  }
}

async function handleDelete(row: RuntimeConfig) {
  try {
    await ElMessageBox.confirm(`确定要删除配置【${row.configKey}】吗？`, '确认操作', {
      type: 'warning'
    })
    await configStore.deleteConfig(row.id)
    ElMessage.success('删除成功')
    fetchConfigs()
  } catch {
  }
}

function openPublishDialog() {
  Object.assign(publishForm, {
    publishType: 'full',
    scope: configStore.currentScope,
    appId: configStore.currentScope === 'app' ? selectedAppId.value : null,
    configIds: []
  })
  publishDialogVisible.value = true
}

function handlePublishScopeChange() {
  if (publishForm.scope === 'global') {
    publishForm.appId = null
  }
}

async function handlePublish() {
  const valid = await publishFormRef.value?.validate().catch(() => false)
  if (!valid) return

  try {
    await configStore.publishConfig(publishForm)
    ElMessage.success('发布任务已提交')
    publishDialogVisible.value = false
    activeTab.value = 'history'
    fetchPublishHistory()
  } catch (e: any) {
    ElMessage.error(e.message || '发布失败')
  }
}

async function viewPublishDetail(row: ConfigPublish) {
  publishDetail.value = await configStore.getPublishDetail(row.id)
  detailDialogVisible.value = true
}

async function handleCancelPublish(row: ConfigPublish) {
  try {
    await ElMessageBox.confirm('确定要取消该发布任务吗？', '确认操作', {
      type: 'warning'
    })
    await configApi.cancelPublish(row.id)
    ElMessage.success('取消成功')
    fetchPublishHistory()
  } catch {
  }
}

function handleWebSocketMessage() {
  wsConnected.value = isConnected.value
  if (activeTab.value === 'list') {
    fetchConfigs()
  } else if (activeTab.value === 'history') {
    fetchPublishHistory()
  }
}

watch(activeTab, (tab) => {
  if (tab === 'list') {
    fetchConfigs()
  } else if (tab === 'history') {
    fetchPublishHistory()
  }
})

onMounted(() => {
  fetchApps()
  fetchConfigs()
  unsubscribe = subscribe('/topic/publish', handleWebSocketMessage)
  wsConnected.value = isConnected.value
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>

<style lang="scss" scoped>
.stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.ws-badge {
  margin-right: 12px;

  .ws-status {
    font-size: 14px;
    color: #606266;
  }
}

.main-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 16px;
  }
}

.scope-switch {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.config-value {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  color: #e74c3c;
}

.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}
</style>
