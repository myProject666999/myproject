<template>
  <div class="query-container">
    <div class="search-section">
      <div class="search-card">
        <h2 class="search-title">快递运单查询</h2>
        <p class="search-desc">输入运单号，查询物流轨迹信息</p>
        <el-input
          v-model="waybillNo"
          placeholder="请输入运单号，如：YB20260524001"
          size="large"
          class="search-input"
          @keyup.enter="handleQuery"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #append>
            <el-button @click="handleQuery" :loading="loading">查询</el-button>
          </template>
        </el-input>
      </div>
    </div>

    <div class="info-section">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="info-card">
            <el-icon :size="40" color="#409eff"><Van /></el-icon>
            <h3>实时跟踪</h3>
            <p>实时掌握运单动态，随时更新</p>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-card">
            <el-icon :size="40" color="#67c23a"><Location /></el-icon>
            <h3>精准定位</h3>
            <p>轨迹节点精准定位，一目了然</p>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="info-card">
            <el-icon :size="40" color="#e6a23c"><Bell /></el-icon>
            <h3>状态通知</h3>
            <p>状态变更及时推送，不错过任何信息</p>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="demo-section">
      <h3 class="demo-title">示例运单号</h3>
      <div class="demo-waybills">
        <el-tag
          v-for="no in demoWaybills"
          :key="no"
          class="demo-tag"
          @click="selectWaybill(no)"
        >
          {{ no }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const waybillNo = ref('')
const loading = ref(false)

const demoWaybills = [
  'YB20260524001',
  'YB20260524002',
  'YB20260524003',
  'YB20260524004'
]

const handleQuery = () => {
  if (!waybillNo.value.trim()) {
    return
  }
  router.push(`/tracking/${waybillNo.value.trim()}`)
}

const selectWaybill = (no) => {
  waybillNo.value = no
  handleQuery()
}
</script>

<style scoped>
.query-container {
  max-width: 1200px;
  margin: 0 auto;
}

.search-section {
  margin-bottom: 40px;
}

.search-card {
  background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
  border-radius: 16px;
  padding: 60px 40px;
  text-align: center;
  color: #fff;
}

.search-title {
  font-size: 32px;
  margin-bottom: 12px;
  color: #fff;
}

.search-desc {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 32px;
}

.search-input {
  max-width: 600px;
  margin: 0 auto;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 24px 0 0 24px;
}

.search-input :deep(.el-input-group__append) {
  border-radius: 0 24px 24px 0;
  background: #fff;
}

.info-section {
  margin-bottom: 40px;
}

.info-card {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.info-card h3 {
  margin: 16px 0 8px;
  font-size: 18px;
  color: #303133;
}

.info-card p {
  color: #909399;
  font-size: 14px;
}

.demo-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.demo-title {
  font-size: 16px;
  color: #303133;
  margin-bottom: 16px;
}

.demo-waybills {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.demo-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.demo-tag:hover {
  transform: translateY(-2px);
}
</style>
