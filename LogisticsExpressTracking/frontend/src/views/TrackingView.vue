<template>
  <div class="tracking-container">
    <div class="back-link" @click="goBack">
      <el-icon><ArrowLeft /></el-icon>
      <span>返回查询</span>
    </div>

    <div v-if="loading" class="loading-container">
      <el-icon class="is-loading" :size="40"><Loading /></el-icon>
      <p>加载中...</p>
    </div>

    <div v-else-if="!waybillDetail" class="empty-container">
      <el-empty description="运单不存在" />
      <el-button type="primary" @click="goBack">返回查询</el-button>
    </div>

    <div v-else class="detail-content">
      <el-row :gutter="24">
        <el-col :span="10">
          <div class="info-card">
            <div class="info-header">
              <h3>运单信息</h3>
              <el-tag :type="statusType" size="large">{{ waybillDetail.statusText }}</el-tag>
            </div>
            <div class="info-row">
              <span class="label">运单号</span>
              <span class="value">{{ waybillDetail.waybillNo }}</span>
            </div>
            <div class="info-row">
              <span class="label">物品名称</span>
              <span class="value">{{ waybillDetail.goodsName }}</span>
            </div>
            <div class="info-row">
              <span class="label">物品重量</span>
              <span class="value">{{ waybillDetail.goodsWeight }} kg</span>
            </div>
            <div class="info-row">
              <span class="label">运费</span>
              <span class="value">¥{{ waybillDetail.freight }}</span>
            </div>
          </div>

          <div class="info-card">
            <h3>寄件人</h3>
            <div class="info-row">
              <span class="label">姓名</span>
              <span class="value">{{ waybillDetail.senderName }}</span>
            </div>
            <div class="info-row">
              <span class="label">电话</span>
              <span class="value">{{ waybillDetail.senderPhone }}</span>
            </div>
            <div class="info-row">
              <span class="label">地址</span>
              <span class="value">{{ waybillDetail.senderAddress }}</span>
            </div>
          </div>

          <div class="info-card">
            <h3>收件人</h3>
            <div class="info-row">
              <span class="label">姓名</span>
              <span class="value">{{ waybillDetail.receiverName }}</span>
            </div>
            <div class="info-row">
              <span class="label">电话</span>
              <span class="value">{{ waybillDetail.receiverPhone }}</span>
            </div>
            <div class="info-row">
              <span class="label">地址</span>
              <span class="value">{{ waybillDetail.receiverAddress }}</span>
            </div>
          </div>
        </el-col>

        <el-col :span="14">
          <div class="timeline-card">
            <h3 class="timeline-title">
              <el-icon><Location /></el-icon>
              物流轨迹
            </h3>
            <el-timeline v-if="waybillDetail.trackingNodes && waybillDetail.trackingNodes.length">
              <el-timeline-item
                v-for="(node, index) in waybillDetail.trackingNodes"
                :key="node.id"
                :timestamp="formatTime(node.nodeTime)"
                :type="getNodeType(node.nodeType)"
                :hollow="index === waybillDetail.trackingNodes.length - 1"
                placement="top"
              >
                <div class="node-content">
                  <div class="node-header">
                    <el-tag :type="getNodeTagType(node.nodeType)" size="small">
                      {{ node.nodeTypeText }}
                    </el-tag>
                    <span class="node-location">
                      <el-icon><Location /></el-icon>
                      {{ node.location }}
                    </span>
                  </div>
                  <div class="node-desc">{{ node.description }}</div>
                  <div v-if="node.operator" class="node-operator">
                    <el-icon><User /></el-icon>
                    {{ node.operator }}
                    <span v-if="node.operatorPhone">({{ node.operatorPhone }})</span>
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
            <el-empty v-else description="暂无轨迹信息" />
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getWaybillDetail } from '../api/waybill'

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const waybillDetail = ref(null)

const statusType = computed(() => {
  if (!waybillDetail.value) return 'info'
  const status = waybillDetail.value.status
  switch (status) {
    case 0: return 'warning'
    case 1: return 'primary'
    case 2: return 'primary'
    case 3: return 'success'
    case 4: return 'info'
    case 5: return 'danger'
    default: return 'info'
  }
})

const goBack = () => {
  router.push('/')
}

const formatTime = (time) => {
  if (!time) return ''
  return time.replace('T', ' ').substring(0, 19)
}

const getNodeType = (nodeType) => {
  switch (nodeType) {
    case 1: return 'primary'
    case 2: return ''
    case 3: return ''
    case 4: return 'warning'
    case 5: return 'success'
    case 6: return 'info'
    case 7: return 'danger'
    default: return ''
  }
}

const getNodeTagType = (nodeType) => {
  switch (nodeType) {
    case 1: return 'primary'
    case 2: return ''
    case 3: return ''
    case 4: return 'warning'
    case 5: return 'success'
    case 6: return 'info'
    case 7: return 'danger'
    default: return ''
  }
}

const fetchDetail = async () => {
  const waybillNo = route.params.waybillNo
  if (!waybillNo) return

  loading.value = true
  try {
    const res = await getWaybillDetail(waybillNo)
    if (res.code === 200) {
      waybillDetail.value = res.data
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchDetail)
</script>

<style scoped>
.tracking-container {
  max-width: 1400px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #409eff;
  cursor: pointer;
  margin-bottom: 20px;
  font-size: 14px;
}

.back-link:hover {
  text-decoration: underline;
}

.loading-container {
  text-align: center;
  padding: 100px 0;
  color: #909399;
}

.loading-container p {
  margin-top: 12px;
}

.empty-container {
  text-align: center;
  padding: 60px 0;
}

.empty-container .el-button {
  margin-top: 20px;
}

.info-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.info-card h3 {
  font-size: 16px;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.info-header h3 {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.info-row {
  display: flex;
  padding: 8px 0;
}

.info-row .label {
  width: 80px;
  color: #909399;
  font-size: 14px;
}

.info-row .value {
  flex: 1;
  color: #303133;
  font-size: 14px;
}

.timeline-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.timeline-title {
  font-size: 18px;
  color: #303133;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.node-content {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 12px 16px;
}

.node-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.node-location {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #606266;
  font-size: 13px;
}

.node-desc {
  color: #303133;
  font-size: 14px;
  margin-bottom: 4px;
}

.node-operator {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 13px;
}
</style>
