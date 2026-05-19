<template>
  <div class="download-page">
    <el-card class="download-card">
      <template #header>
        <div class="card-header">
          <el-icon><Download /></el-icon>
          <span>下载与还原</span>
        </div>
      </template>

      <el-form :model="form" label-width="80px">
        <el-form-item label="用户ID">
          <el-input
            v-model="form.userId"
            placeholder="请输入用户标识"
            style="width: 300px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">加载数据</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <el-icon><UserFilled /></el-icon>
              <span>当前通讯录 ({{ contacts.length }} 人)</span>
            </div>
          </template>
          <div class="action-bar">
            <el-button type="primary" @click="handleExportCurrent">
              <el-icon><Download /></el-icon>
              导出当前通讯录
            </el-button>
            <el-button type="danger" @click="handleDeduplicate">
              <el-icon><Delete /></el-icon>
              合并去重
            </el-button>
          </div>
          <el-table :data="contacts" stripe height="400" size="small">
            <el-table-column prop="formattedName" label="姓名" min-width="120" />
            <el-table-column prop="organization" label="公司" min-width="120" />
            <el-table-column label="电话" min-width="130">
              <template #default="{ row }">
                <span v-if="row.phones">{{ parsePhones(row.phones) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <el-icon><Clock /></el-icon>
              <span>历史版本</span>
            </div>
          </template>
          <el-table :data="versions" stripe height="450" size="small">
            <el-table-column prop="version" label="版本" width="80">
              <template #default="{ row }">
                <el-tag type="primary" size="small">v{{ row.version }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="contactCount" label="数量" width="70" />
            <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip />
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="primary" link @click="handleDownload(row)">
                  <el-icon><Download /></el-icon>
                  下载
                </el-button>
                <el-button size="small" type="success" link @click="handleMerge(row)">
                  <el-icon><Plus /></el-icon>
                  合并
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import {
  getContactList,
  getVersionList,
  exportContacts,
  exportVersion,
  mergeFromSnapshot,
  deduplicate
} from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'

const form = reactive({
  userId: 'default_user'
})
const contacts = ref([])
const versions = ref([])

const loadData = async () => {
  if (!form.userId) {
    ElMessage.warning('请输入用户ID')
    return
  }
  await Promise.all([loadContacts(), loadVersions()])
}

const loadContacts = async () => {
  const res = await getContactList(form.userId)
  contacts.value = res.data
}

const loadVersions = async () => {
  const res = await getVersionList(form.userId)
  versions.value = res.data
}

const handleExportCurrent = () => {
  exportContacts(form.userId)
}

const handleDownload = (row) => {
  exportVersion(row.id)
}

const handleMerge = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要将版本 v${row.version} 合并到当前通讯录吗？`,
      '合并确认',
      { type: 'warning' }
    )
    await mergeFromSnapshot(form.userId, row.id)
    ElMessage.success('合并成功')
    loadData()
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
    }
  }
}

const handleDeduplicate = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要对当前通讯录进行合并去重吗？重复联系人将被删除。',
      '去重确认',
      { type: 'warning' }
    )
    const res = await deduplicate(form.userId)
    ElMessage.success(
      `去重完成，原始 ${res.data.originalCount} 条，删除重复 ${res.data.duplicateCount} 条，剩余 ${res.data.remainingCount} 条`
    )
    loadData()
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
    }
  }
}

const parsePhones = (phones) => {
  try {
    const arr = JSON.parse(phones)
    return arr.map(p => p.value).join(', ')
  } catch {
    return phones
  }
}

loadData()
</script>

<style scoped>
.download-page {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: bold;
}

.action-bar {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
}
</style>
