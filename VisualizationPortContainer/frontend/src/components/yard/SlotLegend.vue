<template>
  <div class="slot-legend">
    <div class="legend-title">图例说明</div>
    <div class="legend-items">
      <div class="legend-item">
        <span class="legend-color slot-empty"></span>
        <span class="legend-text">空箱位</span>
      </div>
      <div class="legend-item">
        <span class="legend-color slot-occupied"></span>
        <span class="legend-text">已占用</span>
      </div>
      <div class="legend-item">
        <span class="legend-color slot-danger"></span>
        <span class="legend-text">危险品</span>
      </div>
      <div class="legend-item">
        <span class="legend-color slot-reefer"></span>
        <span class="legend-text">冷藏箱</span>
      </div>
      <div class="legend-item">
        <span class="legend-color slot-suggest"></span>
        <span class="legend-text">推荐位置</span>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.slot-legend {
  background: rgba(20, 28, 48, 0.8);
  border: 1px solid rgba(64, 158, 255, 0.2);
  border-radius: 8px;
  padding: 16px;
}

.legend-title {
  font-size: 16px;
  font-weight: 600;
  color: #409eff;
  margin-bottom: 12px;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.legend-text {
  font-size: 13px;
  color: #a8b2c1;
}

.slot-empty {
  background: rgba(100, 100, 100, 0.3);
}

.slot-occupied {
  background: linear-gradient(135deg, #409eff 0%, #1c7ed6 100%);
}

.slot-danger {
  background: linear-gradient(135deg, #f56c6c 0%, #dc3545 100%);
}

.slot-reefer {
  background: linear-gradient(135deg, #67c23a 0%, #52c41a 100%);
}

.slot-suggest {
  background: linear-gradient(135deg, #ffd700 0%, #ffb700 100%);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
</style>
