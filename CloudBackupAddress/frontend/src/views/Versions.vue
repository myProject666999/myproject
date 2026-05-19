<template>
  <div class="versions-page">
    <el-card class="versions-card">
      <template #header>
        <div class="card-header">
          <el-icon><Clock /></el-icon>
          <span>版本历史</span>
        </div>
      </template>

      <el-form :inline="true" class="query-form">
        <el-form-item label="用户ID">
          <el-input
            v-model="userId"
            placeholder="请输入用户标识"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadVersions">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table v-if="versions.length > 0" :data="versions" stripe>
        <el-table-column prop="version" label="版本号" width="100">
          <template #default="{ row }">
            <el-tag type="primary">v{{ row.version }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="contactCount" label="联系人数量" width="120" />
        <el-table-column prop="changeType" label="操作类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.changeType)">
              {{ getTypeLabel(row.changeType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="300" />
        <el-table-column prop="createdTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleDownload(row)">
              <el-icon><Download /></el-icon>
              下载
            </el-button>
            <el-button size="small" type="success" link @click="handleRestore(row)">
              <el-icon><RefreshRight /></el-icon>
              还原
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-else description="暂无版本记录" />
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getVersionList, exportVersion, restoreFromSnapshot } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'

const userId = ref('default_user')
const versions = ref([])

const loadVersions = async () => {
  if (!userId.value) {
    ElMessage.warning('请输入用户ID')
    return
  }
  const res = await getVersionList(userId.value)
  versions.value = res.data
}

const getTypeLabel = (type) => {
  const map = {
    upload: '上传',
    merge: '合并',
    restore: '还原'
  }
  return map[type] || type
}

const getTypeTag = (type) => {
  const map = {
    upload: 'primary',
    merge: 'warning',
    restore: 'success'
  }
  return map[type] || 'info'
}

const handleDownload = (row) => {
  exportVersion(row.id)
}

const handleRestore = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要还原到版本 v${row.version} 吗？当前数据将被覆盖。`,
      '还原确认',
      { type: 'warning' }
    )
    await restoreFromSnapshot(userId.value, row.id)
    ElMessage.success('还原成功')
    loadVersions()
  } catch (e) {
    if (e !== 'cancel') {
      console.error(e)
    }
  }
}

loadVersions()
</script>

<style scoped>
.versions-page {
  max-width: 1000px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: bold;
}

.query-form {
  margin-bottom: 20px;
}
</style>
