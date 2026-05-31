<template>
  <div class="gray-progress">
    <div class="progress-header">
      <span class="progress-label">{{ label }}</span>
      <span class="progress-value">{{ percent }}%</span>
    </div>
    <div class="progress-bar-wrapper">
      <div
        class="progress-bar"
        :class="statusClass"
        :style="{ width: percent + '%' }"
      >
        <div v-if="showAnimation" class="progress-stripes"></div>
      </div>
    </div>
    <div v-if="showDetail" class="progress-detail">
      <span>
        <el-icon><Check /></el-icon>
        成功: {{ successCount }}
      </span>
      <span>
        <el-icon><Close /></el-icon>
        失败: {{ failCount }}
      </span>
      <span>
        <el-icon><Clock /></el-icon>
        总计: {{ totalCount }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Check, Close, Clock } from '@element-plus/icons-vue'

const props = withDefaults(defineProps<{
  percent: number
  status?: number
  label?: string
  successCount?: number
  failCount?: number
  totalCount?: number
  showDetail?: boolean
  showAnimation?: boolean
}>(), {
  status: 1,
  label: '发布进度',
  successCount: 0,
  failCount: 0,
  totalCount: 0,
  showDetail: false,
  showAnimation: true
})

const statusClass = computed(() => {
  switch (props.status) {
    case 2: return 'success'
    case 3: return 'danger'
    case 1: return 'active'
    default: return ''
  }
})
</script>

<style lang="scss" scoped>
.gray-progress {
  .progress-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;

    .progress-label {
      font-size: 14px;
      color: #606266;
    }

    .progress-value {
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }
  }

  .progress-bar-wrapper {
    height: 12px;
    background: #e9ecef;
    border-radius: 6px;
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #409eff, #66b1ff);
    border-radius: 6px;
    position: relative;
    transition: width 0.3s ease;
    overflow: hidden;

    &.success {
      background: linear-gradient(90deg, #67c23a, #85ce61);
    }

    &.danger {
      background: linear-gradient(90deg, #f56c6c, #f89898);
    }

    &.active .progress-stripes {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: repeating-linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.15),
        rgba(255, 255, 255, 0.15) 25%,
        transparent 25%,
        transparent 50%
      );
      background-size: 20px 20px;
      animation: progress-stripes 1s linear infinite;
    }
  }

  .progress-detail {
    display: flex;
    gap: 24px;
    margin-top: 12px;
    font-size: 13px;
    color: #909399;

    span {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .el-icon {
      font-size: 14px;
    }
  }
}

@keyframes progress-stripes {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 20px 0;
  }
}
</style>
