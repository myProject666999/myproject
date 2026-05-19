<template>
  <div class="compare-page">
    <el-card class="compare-card">
      <template #header>
        <div class="card-header">
          <el-icon><Scale /></el-icon>
          <span>版本对比</span>
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
          <el-button type="primary" @click="loadVersions">加载版本</el-button>
        </el-form-item>
      </el-form>

      <div v-if="versions.length > 0" class="compare-select">
        <el-row :gutter="20">
          <el-col :span="10">
            <el-select v-model="snapshotId1" placeholder="选择版本1" style="width: 100%">
              <el-option
                v-for="v in versions"
                :key="v.id"
                :label="`v${v.version} - ${v.description}`"
                :value="v.id"
              />
            </el-select>
          </el-col>
          <el-col :span="4" class="vs-col">
            <span class="vs-text">VS</span>
          </el-col>
          <el-col :span="10">
            <el-select v-model="snapshotId2" placeholder="选择版本2" style="width: 100%">
              <el-option
                v-for="v in versions"
                :key="v.id"
                :label="`v${v.version} - ${v.description}`"
                :value="v.id"
              />
            </el-select>
          </el-col>
        </el-row>
        <el-button
          type="primary"
          style="margin-top: 20px"
          :disabled="!snapshotId1 || !snapshotId2"
          @click="handleCompare"
        >
          开始对比
        </el-button>
      </div>

      <el-empty v-else description="请先加载版本列表" />
    </el-card>

    <el-card v-if="compareResult" class="result-card">
      <template #header>
        <div class="card-header">
          <el-icon><Document /></el-icon>
          <span>对比结果 - v{{ compareResult.version1 }} vs v{{ compareResult.version2 }}</span>
        </div>
      </template>

      <el-descriptions :column="4" border class="summary">
        <el-descriptions-item label="新增">
          <el-tag type="success">{{ compareResult.summary.added }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="删除">
          <el-tag type="danger">{{ compareResult.summary.removed }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="修改">
          <el-tag type="warning">{{ compareResult.summary.updated }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="不变">
          <el-tag type="info">{{ compareResult.summary.unchanged }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <el-tabs v-model="activeTab" style="margin-top: 20px">
        <el-tab-pane label="新增" name="added" v-if="compareResult.added.length > 0">
          <el-table :data="compareResult.added" stripe size="small">
            <el-table-column prop="name" label="姓名" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="删除" name="removed" v-if="compareResult.removed.length > 0">
          <el-table :data="compareResult.removed" stripe size="small">
            <el-table-column prop="name" label="姓名" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="修改" name="updated" v-if="compareResult.updated.length > 0">
          <el-table :data="compareResult.updated" stripe size="small">
            <el-table-column prop="name" label="姓名" width="150" />
            <el-table-column label="变更详情">
              <template #default="{ row }">
                <el-tag
                  v-for="change in row.changes"
                  :key="change.field"
                  size="small"
                  style="margin-right: 8px"
                >
                  {{ change.field }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="不变" name="unchanged" v-if="compareResult.unchanged.length > 0">
          <el-table :data="compareResult.unchanged" stripe size="small">
            <el-table-column prop="name" label="姓名" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getVersionList, compareVersions } from '../api'
import { ElMessage } from 'element-plus'

const userId = ref('default_user')
const versions = ref([])
const snapshotId1 = ref(null)
const snapshotId2 = ref(null)
const compareResult = ref(null)
const activeTab = ref('added')

const loadVersions = async () => {
  if (!userId.value) {
    ElMessage.warning('请输入用户ID')
    return
  }
  const res = await getVersionList(userId.value)
  versions.value = res.data
  compareResult.value = null
}

const handleCompare = async () => {
  try {
    const res = await compareVersions(snapshotId1.value, snapshotId2.value)
    compareResult.value = res.data
    ElMessage.success('对比完成')
  } catch (e) {
    console.error(e)
  }
}

loadVersions()
</script>

<style scoped>
.compare-page {
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

.vs-col {
  display: flex;
  align-items: center;
  justify-content: center;
}

.vs-text {
  font-size: 24px;
  font-weight: bold;
  color: #909399;
}

.compare-select {
  padding: 20px 0;
}

.result-card {
  margin-top: 20px;
}

.summary {
  margin-bottom: 20px;
}
</style>
