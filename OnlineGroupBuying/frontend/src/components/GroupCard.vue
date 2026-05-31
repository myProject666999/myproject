<template>
  <el-card class="group-card" shadow="hover" @click="goDetail">
    <div class="card-header">
      <el-tag :type="statusTagType" size="small" effect="dark">
        {{ statusText }}
      </el-tag>
      <span class="group-id">#{{ group.id }}</span>
    </div>
    <div class="product-info">
      <div class="product-image">
        <el-image
          :src="group.product?.images"
          :alt="group.product?.name"
          fit="cover"
          style="width: 100%; height: 100%; border-radius: 8px;"
        >
          <template #error>
            <div class="image-placeholder">
              <el-icon :size="48"><Goods /></el-icon>
            </div>
          </template>
        </el-image>
      </div>
      <div class="product-details">
        <h3 class="product-name">{{ group.product?.name }}</h3>
        <p class="product-desc">{{ group.product?.description }}</p>
        <div class="price-row">
          <span class="current-price">
            <span class="currency">¥</span>{{ group.group_price }}
          </span>
          <span class="original-price" v-if="group.product?.original_price">
            ¥{{ group.product.original_price }}
          </span>
        </div>
      </div>
    </div>
    <el-divider />
    <div class="card-footer">
      <div class="progress-section">
        <div class="progress-label">
          <span>拼单进度</span>
          <span class="progress-count">
            {{ group.current_size }}/{{ group.group_size }}
          </span>
        </div>
        <el-progress
          :percentage="progressPercentage"
          :stroke-width="10"
          :color="progressColor"
        />
      </div>
      <div class="time-section">
        <el-icon><Clock /></el-icon>
        <span>{{ formatDeadline }}</span>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Goods, Clock } from '@element-plus/icons-vue'

const props = defineProps({
  group: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const progressPercentage = computed(() => {
  const current = props.group.current_size || 0
  const target = props.group.group_size || 1
  return Math.min(Math.round((current / target) * 100), 100)
})

const statusText = computed(() => {
  const status = props.group.status
  const statusMap = {
    0: '进行中',
    1: '已成团',
    2: '拼团失败',
    3: '已取消'
  }
  return statusMap[status] || '进行中'
})

const statusTagType = computed(() => {
  const status = props.group.status
  if (status === 0) return 'success'
  if (status === 1) return 'primary'
  if (status === 2) return 'info'
  if (status === 3) return 'danger'
  return 'success'
})

const progressColor = computed(() => {
  const pct = progressPercentage.value
  if (pct >= 100) return '#67c23a'
  if (pct >= 60) return '#409eff'
  return '#e6a23c'
})

const formatDeadline = computed(() => {
  const deadline = props.group.expire_time
  if (!deadline) return '长期有效'
  const date = new Date(deadline)
  return `${date.getMonth() + 1}月${date.getDate()}日截止`
})

function goDetail() {
  router.push(`/group/${props.group.id}`)
}
</script>

<style scoped>
.group-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border-radius: 12px;
}

.group-card:hover {
  transform: translateY(-4px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.group-id {
  font-size: 12px;
  color: #909399;
}

.product-info {
  display: flex;
  gap: 16px;
}

.product-image {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f5f7fa;
  flex-shrink: 0;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
}

.product-details {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.product-desc {
  font-size: 13px;
  color: #909399;
  margin: 0 0 12px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.5;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.current-price {
  color: #f56c6c;
  font-weight: bold;
}

.current-price .currency {
  font-size: 14px;
}

.current-price:not(.currency) {
  font-size: 22px;
}

.original-price {
  font-size: 13px;
  color: #c0c4cc;
  text-decoration: line-through;
}

.card-footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #606266;
  margin-bottom: 6px;
}

.progress-count {
  font-weight: 500;
  color: #409eff;
}

.time-section {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}
</style>
