<template>
  <div class="page-container">
    <PageHeader title="应用注册" description="管理微前端应用的注册、版本和依赖关系">
      <template #actions>
        <el-button type="primary" :icon="Plus" @click="openAddDialog">
          新增应用
        </el-button>
      </template>
    </PageHeader>

    <div class="stat-row">
      <div class="stat-card info">
        <div class="stat-number">{{ appStore.pagination.total }}</div>
        <div class="stat-label">应用总数</div>
      </div>
      <div class="stat-card success">
        <div class="stat-number">{{ appStore.onlineCount }}</div>
        <div class="stat-label">上线应用</div>
      </div>
      <div class="stat-card danger">
        <div class="stat-number">{{ appStore.offlineCount }}</div>
        <div class="stat-label">下线应用</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-number">{{ appStore.maintenanceCount }}</div>
        <div class="stat-label">维护中</div>
      </div>
    </div>

    <div class="table-toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索应用编码、名称"
          :prefix-icon="Search"
          clearable
          style="width: 280px"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 140px">
          <el-option label="上线" :value="1" />
          <el-option label="下线" :value="0" />
          <el-option label="维护中" :value="2" />
        </el-select>
        <el-button :icon="Refresh" @click="fetchApps">刷新</el-button>
      </div>
    </div>

    <el-table
      v-loading="appStore.loading"
      :data="appStore.apps"
      border
      stripe
      style="width: 100%"
    >
      <el-table-column prop="appCode" label="应用编码" width="140" />
      <el-table-column prop="appName" label="应用名称" width="160" />
      <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
      <el-table-column prop="currentVersion" label="当前版本" width="120" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <StatusTag :status="row.status" type="app" show-icon />
        </template>
      </el-table-column>
      <el-table-column prop="owner" label="负责人" width="120" />
      <el-table-column prop="createTime" label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="320" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="openEditDialog(row)">编辑</el-button>
          <el-button type="primary" link @click="openVersionDialog(row)">版本管理</el-button>
          <el-button type="primary" link @click="openDependencyDialog(row)">依赖关系</el-button>
          <el-button
            v-if="row.status === 1"
            type="danger"
            link
            @click="handleToggleStatus(row, 0)"
          >
            下线
          </el-button>
          <el-button
            v-else
            type="success"
            link
            @click="handleToggleStatus(row, 1)"
          >
            上线
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="appStore.pagination.current"
      v-model:page-size="appStore.pagination.size"
      :total="appStore.pagination.total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      class="pagination"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑应用' : '新增应用'"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="应用编码" prop="appCode">
          <el-input v-model="formData.appCode" :disabled="isEdit" placeholder="如：user-center" />
        </el-form-item>
        <el-form-item label="应用名称" prop="appName">
          <el-input v-model="formData.appName" placeholder="请输入应用名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="入口地址" prop="entryUrl">
          <el-input v-model="formData.entryUrl" placeholder="如：http://localhost:3001" />
        </el-form-item>
        <el-form-item label="负责人" prop="owner">
          <el-input v-model="formData.owner" placeholder="请输入负责人" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio :value="0">下线</el-radio>
            <el-radio :value="1">上线</el-radio>
            <el-radio :value="2">维护中</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="form-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="versionDialogVisible" title="版本管理" width="800px">
      <template #header>
        <div class="dialog-header">
          <span>版本管理 - {{ currentApp?.appName }}</span>
          <el-button type="primary" size="small" :icon="Plus" @click="openPublishVersionDialog">
            发布新版本
          </el-button>
        </div>
      </template>
      <el-table :data="appStore.versions" v-loading="appStore.loading" border>
        <el-table-column prop="version" label="版本号" width="140" />
        <el-table-column prop="description" label="版本描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="entryUrl" label="入口地址" min-width="200" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <StatusTag :status="row.status" type="version" />
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.publishTime) }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog v-model="publishVersionVisible" title="发布新版本" width="500px">
      <el-form ref="versionFormRef" :model="versionForm" :rules="versionRules" label-width="100px">
        <el-form-item label="版本号" prop="version">
          <el-input v-model="versionForm.version" placeholder="如：1.0.0" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="versionForm.description" type="textarea" :rows="3" placeholder="请输入版本描述" />
        </el-form-item>
        <el-form-item label="入口地址" prop="entryUrl">
          <el-input v-model="versionForm.entryUrl" placeholder="请输入入口地址" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="form-footer">
          <el-button @click="publishVersionVisible = false">取消</el-button>
          <el-button type="primary" @click="handlePublishVersion">发布</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="dependencyDialogVisible" title="依赖关系" width="700px">
      <template #header>
        <div class="dialog-header">
          <span>依赖关系 - {{ currentApp?.appName }}</span>
          <el-button type="primary" size="small" :icon="Plus" @click="openAddDependencyDialog">
            添加依赖
          </el-button>
        </div>
      </template>
      <el-table :data="appStore.dependencies" v-loading="appStore.loading" border>
        <el-table-column prop="dependencyAppCode" label="依赖应用编码" width="160" />
        <el-table-column prop="dependencyAppName" label="依赖应用名称" width="160" />
        <el-table-column prop="minVersion" label="最低版本" width="120" />
        <el-table-column prop="maxVersion" label="最高版本" width="120" />
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button type="danger" link @click="handleRemoveDependency(row.id)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog v-model="addDependencyVisible" title="添加依赖" width="500px">
      <el-form ref="dependencyFormRef" :model="dependencyForm" :rules="dependencyRules" label-width="100px">
        <el-form-item label="依赖应用" prop="dependencyAppId">
          <el-select v-model="dependencyForm.dependencyAppId" placeholder="请选择依赖应用" style="width: 100%">
            <el-option
              v-for="app in allApps"
              :key="app.id"
              :label="`${app.appName} (${app.appCode})`"
              :value="app.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="最低版本" prop="minVersion">
          <el-input v-model="dependencyForm.minVersion" placeholder="如：1.0.0" />
        </el-form-item>
        <el-form-item label="最高版本" prop="maxVersion">
          <el-input v-model="dependencyForm.maxVersion" placeholder="如：2.0.0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="form-footer">
          <el-button @click="addDependencyVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAddDependency">添加</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/appStore'
import { formatDate } from '@/utils/format'
import { createRules, validateRequired, validateAppCode, validateVersion, validateURL } from '@/utils/validate'
import * as appApi from '@/api/app'
import type { MicroApp } from '@/types'

const appStore = useAppStore()

const searchKeyword = ref('')
const statusFilter = ref<number | null>(null)
const dialogVisible = ref(false)
const versionDialogVisible = ref(false)
const publishVersionVisible = ref(false)
const dependencyDialogVisible = ref(false)
const addDependencyVisible = ref(false)
const isEdit = ref(false)
const currentApp = ref<MicroApp | null>(null)
const allApps = ref<MicroApp[]>([])

const formRef = ref()
const versionFormRef = ref()
const dependencyFormRef = ref()

const formData = reactive<Partial<MicroApp>>({
  appCode: '',
  appName: '',
  description: '',
  entryUrl: '',
  owner: '',
  status: 0
})

const versionForm = reactive({
  version: '',
  description: '',
  entryUrl: ''
})

const dependencyForm = reactive({
  dependencyAppId: null as number | null,
  minVersion: '',
  maxVersion: ''
})

const formRules = createRules({
  appCode: [validateAppCode],
  appName: [validateRequired('请输入应用名称')],
  description: [validateRequired('请输入描述')],
  entryUrl: [validateURL],
  owner: [validateRequired('请输入负责人')]
})

const versionRules = createRules({
  version: [validateVersion],
  description: [validateRequired('请输入版本描述')],
  entryUrl: [validateURL]
})

const dependencyRules = createRules({
  dependencyAppId: [validateRequired('请选择依赖应用')],
  minVersion: [validateVersion],
  maxVersion: [validateVersion]
})

async function fetchApps() {
  await appStore.fetchApps({
    keyword: searchKeyword.value,
    status: statusFilter.value ?? undefined
  })
}

async function fetchAllApps() {
  allApps.value = await appApi.getAllApps()
}

function handleSearch() {
  appStore.setPagination(1)
  fetchApps()
}

function handleSizeChange(size: number) {
  appStore.setPagination(1, size)
  fetchApps()
}

function handleCurrentChange(page: number) {
  appStore.setPagination(page)
  fetchApps()
}

function openAddDialog() {
  isEdit.value = false
  Object.assign(formData, {
    appCode: '',
    appName: '',
    description: '',
    entryUrl: '',
    owner: '',
    status: 0
  })
  dialogVisible.value = true
}

function openEditDialog(row: MicroApp) {
  isEdit.value = true
  currentApp.value = row
  Object.assign(formData, row)
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  try {
    if (isEdit.value && currentApp.value) {
      await appStore.updateApp(currentApp.value.id, formData)
      ElMessage.success('更新成功')
    } else {
      await appStore.createApp(formData)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchApps()
  } catch (e: any) {
    ElMessage.error(e.message || '操作失败')
  }
}

async function handleToggleStatus(row: MicroApp, status: number) {
  const action = status === 1 ? '上线' : '下线'
  try {
    await ElMessageBox.confirm(`确定要${action}应用【${row.appName}】吗？`, '确认操作', {
      type: 'warning'
    })
    await appStore.toggleStatus(row.id, status)
    ElMessage.success(`${action}成功`)
    fetchApps()
  } catch {
  }
}

async function openVersionDialog(row: MicroApp) {
  currentApp.value = row
  versionDialogVisible.value = true
  await appStore.fetchVersions(row.id)
}

function openPublishVersionDialog() {
  Object.assign(versionForm, {
    version: '',
    description: '',
    entryUrl: ''
  })
  publishVersionVisible.value = true
}

async function handlePublishVersion() {
  const valid = await versionFormRef.value?.validate().catch(() => false)
  if (!valid || !currentApp.value) return

  try {
    await appStore.publishVersion(currentApp.value.id, versionForm)
    ElMessage.success('版本发布成功')
    publishVersionVisible.value = false
    appStore.fetchVersions(currentApp.value.id)
  } catch (e: any) {
    ElMessage.error(e.message || '发布失败')
  }
}

async function openDependencyDialog(row: MicroApp) {
  currentApp.value = row
  dependencyDialogVisible.value = true
  await fetchAllApps()
  await appStore.fetchDependencies(row.id)
}

function openAddDependencyDialog() {
  Object.assign(dependencyForm, {
    dependencyAppId: null,
    minVersion: '',
    maxVersion: ''
  })
  addDependencyVisible.value = true
}

async function handleAddDependency() {
  const valid = await dependencyFormRef.value?.validate().catch(() => false)
  if (!valid || !currentApp.value) return

  try {
    await appStore.addDependency(currentApp.value.id, dependencyForm)
    ElMessage.success('添加依赖成功')
    addDependencyVisible.value = false
    appStore.fetchDependencies(currentApp.value.id)
  } catch (e: any) {
    ElMessage.error(e.message || '添加失败')
  }
}

async function handleRemoveDependency(id: number) {
  try {
    await ElMessageBox.confirm('确定要移除该依赖吗？', '确认操作', {
      type: 'warning'
    })
    await appStore.removeDependency(id)
    ElMessage.success('移除成功')
    if (currentApp.value) {
      appStore.fetchDependencies(currentApp.value.id)
    }
  } catch {
  }
}

onMounted(() => {
  fetchApps()
})
</script>

<style lang="scss" scoped>
.stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
</style>
