<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Delete, Edit, Check } from '@element-plus/icons-vue'
import { listDevices, updateDevice, deleteDevice, batchDeleteDevices, getVendors } from '../api/device'
import { useDeviceStore } from '../stores/device'
import type { Device, DeviceQuery, DeviceUpdate } from '../types'

const store = useDeviceStore()

const keyword = ref('')
const statusFilter = ref('')
const vendorFilter = ref('')
const vendorOptions = ref<string[]>([])
const page = ref(1)
const pageSize = ref(20)

const dialogVisible = ref(false)
const editingDevice = ref<Device | null>(null)
const editForm = ref<DeviceUpdate>({ name: '', note: '' })

const query = computed<DeviceQuery>(() => ({
  keyword: keyword.value || undefined,
  status: statusFilter.value as any || undefined,
  vendor: vendorFilter.value || undefined,
  page: page.value,
  pageSize: pageSize.value,
}))

async function loadVendors() {
  try {
    const res = await getVendors()
    vendorOptions.value = res.data
  } catch (e) {
    console.error('加载厂商列表失败', e)
  }
}

async function loadDevices() {
  store.loading = true
  try {
    const res = await listDevices(query.value)
    store.setDevices(res.data.items, res.data.total)
  } catch (e: any) {
    ElMessage.error(e.response?.data?.error || '加载设备列表失败')
  } finally {
    store.loading = false
  }
}

function handleSearch() {
  page.value = 1
  loadDevices()
}

function handleReset() {
  keyword.value = ''
  statusFilter.value = ''
  vendorFilter.value = ''
  page.value = 1
  loadDevices()
}

function handlePageChange(p: number) {
  page.value = p
  loadDevices()
}

function handleSizeChange(size: number) {
  pageSize.value = size
  page.value = 1
  loadDevices()
}

function handleEdit(device: Device) {
  editingDevice.value = device
  editForm.value = {
    name: device.name ?? '',
    note: device.note ?? '',
  }
  dialogVisible.value = true
}

async function handleSave() {
  if (!editingDevice.value) return
  try {
    await updateDevice(editingDevice.value.id, editForm.value)
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadDevices()
  } catch (e: any) {
    ElMessage.error(e.response?.data?.error || '保存失败')
  }
}

async function handleDelete(id: number) {
  try {
    await ElMessageBox.confirm('确定删除该设备？', '提示', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteDevice(id)
    ElMessage.success('删除成功')
    store.removeDevice(id)
  } catch {
    // cancelled
  }
}

async function handleBatchDelete() {
  if (store.selected.length === 0) {
    ElMessage.warning('请先选择设备')
    return
  }
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${store.selected.length} 台设备？`, '提示', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await batchDeleteDevices(store.selected)
    ElMessage.success('批量删除成功')
    store.clearSelection()
    loadDevices()
  } catch {
    // cancelled
  }
}

function handleSelectionChange(selection: Device[]) {
  store.selected = selection.map((d) => d.id)
}

const onlineCount = computed(() => store.devices.filter((d) => d.status === 'online').length)
const offlineCount = computed(() => store.devices.filter((d) => d.status === 'offline').length)

onMounted(() => {
  loadDevices()
  loadVendors()
})
</script>

<template>
  <div class="device-list-view">
    <el-card class="stats-card" shadow="never">
      <div class="stats">
        <div class="stat-item">
          <span class="stat-label">设备总数</span>
          <span class="stat-value">{{ store.total }}</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-dot online"></span>
          <span class="stat-label">在线</span>
          <span class="stat-value">{{ onlineCount }}</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-dot offline"></span>
          <span class="stat-label">离线</span>
          <span class="stat-value">{{ offlineCount }}</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-label">已选中</span>
          <span class="stat-value">{{ store.selected.length }}</span>
        </div>
      </div>
    </el-card>

    <el-card class="toolbar-card" shadow="never">
      <el-form :inline="true" class="filter-form">
        <el-form-item>
          <el-input
            v-model="keyword"
            placeholder="搜索 IP / MAC / 名称"
            clearable
            style="width: 240px"
            :prefix-icon="Search"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-select v-model="statusFilter" placeholder="状态" clearable style="width: 120px">
            <el-option label="在线" value="online" />
            <el-option label="离线" value="offline" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="vendorFilter" placeholder="厂商" clearable filterable style="width: 160px">
            <el-option v-for="v in vendorOptions" :key="v" :label="v" :value="v" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="batch-actions" v-if="store.selected.length > 0">
        <el-button type="danger" :icon="Delete" @click="handleBatchDelete">
          批量删除（{{ store.selected.length }}）
        </el-button>
      </div>
    </el-card>

    <el-card class="table-card" shadow="never">
      <el-table
        :data="store.devices"
        v-loading="store.loading"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="40" />
        <el-table-column label="IP" prop="ip" width="140">
          <template #default="{ row }">
            <span class="mono">{{ row.ip }}</span>
          </template>
        </el-table-column>
        <el-table-column label="MAC" prop="mac" width="170">
          <template #default="{ row }">
            <span class="mono">{{ row.mac }}</span>
          </template>
        </el-table-column>
        <el-table-column label="厂商" prop="vendor" min-width="160">
          <template #default="{ row }">
            <el-tag v-if="row.vendor" type="info" effect="plain" size="small">
              {{ row.vendor }}
            </el-tag>
            <span v-else style="color: var(--text-muted)">未知</span>
          </template>
        </el-table-column>
        <el-table-column label="主机名" prop="hostname" min-width="140">
          <template #default="{ row }">
            <span v-if="row.hostname">{{ row.hostname }}</span>
            <span v-else style="color: var(--text-muted)">-</span>
          </template>
        </el-table-column>
        <el-table-column label="自定义名称" prop="name" min-width="140">
          <template #default="{ row }">
            <span v-if="row.name" style="color: var(--accent)">{{ row.name }}</span>
            <span v-else style="color: var(--text-muted)">未命名</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="note" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.note">{{ row.note }}</span>
            <span v-else style="color: var(--text-muted)">-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 'online' ? 'success' : 'info'" effect="dark" size="small" round>
              <span class="status-dot-small" :class="row.status"></span>
              {{ row.status === 'online' ? '在线' : '离线' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="最后在线" prop="lastSeenAt" width="170">
          <template #default="{ row }">
            <span style="color: var(--text-secondary)">{{ row.lastSeenAt.replace('T', ' ').slice(0, 19) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="Edit" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link :icon="Delete" size="small" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="store.total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" title="编辑设备" width="480px" :close-on-click-modal="false">
      <el-form :model="editForm" label-width="90px">
        <el-form-item label="IP">
          <span class="mono" style="color: var(--text-secondary)">{{ editingDevice?.ip }}</span>
        </el-form-item>
        <el-form-item label="MAC">
          <span class="mono" style="color: var(--text-secondary)">{{ editingDevice?.mac }}</span>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="editForm.name" placeholder="输入自定义名称" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="editForm.note" type="textarea" :rows="3" placeholder="输入备注信息" maxlength="200" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :icon="Check" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.device-list-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-card :deep(.el-card__body) {
  padding: 16px 24px;
}

.stats {
  display: flex;
  align-items: center;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  color: var(--text-muted);
  font-size: 13px;
}

.stat-value {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
}

.stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.stat-dot.online {
  background: var(--success);
  box-shadow: 0 0 4px var(--success);
}

.stat-dot.offline {
  background: var(--text-muted);
}

.stat-divider {
  width: 1px;
  height: 24px;
  background: var(--border);
}

.toolbar-card :deep(.el-card__body) {
  padding: 12px 20px;
}

.filter-form {
  margin: 0;
}

.batch-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px solid var(--border-light);
}

.table-card :deep(.el-card__body) {
  padding: 0;
}

.status-dot-small {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 4px;
  vertical-align: middle;
}

.status-dot-small.online {
  background: var(--success);
}

.status-dot-small.offline {
  background: var(--text-muted);
}

.pagination {
  display: flex;
  justify-content: flex-end;
  padding: 16px 20px;
}

.mono {
  font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
}
</style>
