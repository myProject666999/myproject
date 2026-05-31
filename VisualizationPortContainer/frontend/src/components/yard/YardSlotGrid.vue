<template>
  <div class="yard-slot-grid">
    <div class="yard-header">
      <div class="yard-title">{{ yardName }} - 2D视图</div>
      <div class="yard-controls">
        <el-select v-model="currentLayer" @change="handleLayerChange" size="small">
          <el-option v-for="layer in totalLayers" :key="layer" :label="`第 ${layer} 层`" :value="layer" />
        </el-select>
        <el-button-group size="small">
          <el-button @click="zoomOut">
            <el-icon><ZoomOut /></el-icon>
          </el-button>
          <el-button @click="zoomReset">100%</el-button>
          <el-button @click="zoomIn">
            <el-icon><ZoomIn /></el-icon>
          </el-button>
        </el-button-group>
      </div>
    </div>
    
    <div class="grid-wrapper" ref="gridWrapper">
      <div class="grid-container" :style="{ transform: `scale(${scale})` }">
        <div class="grid-rows">
          <div v-for="(row, rowIndex) in gridData" :key="rowIndex" class="grid-row">
            <div class="row-label">{{ rowIndex + 1 }}</div>
            <div class="row-slots">
              <div
                v-for="(slot, colIndex) in row"
                :key="colIndex"
                :class="getSlotClass(slot)"
                class="slot-cell"
                @click="handleSlotClick(slot)"
                @mouseenter="handleSlotHover(slot)"
                @mouseleave="handleSlotLeave"
              >
                <span v-if="slot.containerNo" class="slot-no">{{ slot.containerNo }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="grid-col-labels">
          <div class="col-label-empty"></div>
          <div v-for="col in totalCols" :key="col" class="col-label">{{ col }}</div>
        </div>
      </div>
    </div>

    <el-tooltip
      v-model:visible="tooltipVisible"
      :content="tooltipContent"
      placement="top"
      :offset="10"
    >
      <div ref="tooltipTarget" style="display: none;"></div>
    </el-tooltip>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ZoomIn, ZoomOut } from '@element-plus/icons-vue'

const props = defineProps({
  yardName: {
    type: String,
    default: 'A堆场'
  },
  gridData: {
    type: Array,
    required: true
  },
  selectedSlot: {
    type: Object,
    default: null
  },
  suggestedSlots: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['slot-click'])

const gridWrapper = ref(null)
const scale = ref(1)
const currentLayer = ref(1)
const totalLayers = ref(5)
const tooltipVisible = ref(false)
const tooltipContent = ref('')

const totalCols = computed(() => {
  if (props.gridData.length > 0) {
    return props.gridData[0].length
  }
  return 20
})

function getSlotClass(slot) {
  const classes = []
  
  if (!slot || slot.status === 'EMPTY') {
    classes.push('slot-empty')
  } else if (slot.isDanger) {
    classes.push('slot-danger')
  } else if (slot.isReefer) {
    classes.push('slot-reefer')
  } else {
    classes.push('slot-occupied')
  }
  
  if (props.selectedSlot && slot.id === props.selectedSlot.id) {
    classes.push('slot-selected')
  }
  
  if (props.suggestedSlots.some(s => s.id === slot.id)) {
    classes.push('slot-suggest')
  }
  
  return classes
}

function handleSlotClick(slot) {
  emit('slot-click', slot)
}

function handleSlotHover(slot) {
  if (slot) {
    const statusText = {
      EMPTY: '空箱位',
      OCCUPIED: '已占用',
      RESERVED: '已预留'
    }
    tooltipContent.value = `
      位置: ${slot.yardCode}-${slot.row}-${slot.col}-${slot.layer}
      ${slot.status !== 'EMPTY' ? `箱号: ${slot.containerNo}` : ''}
      状态: ${statusText[slot.status] || slot.status}
      ${slot.containerType ? `箱型: ${slot.containerType}` : ''}
    `.trim()
    tooltipVisible.value = true
  }
}

function handleSlotLeave() {
  tooltipVisible.value = false
}

function handleLayerChange() {
  // TODO: 根据层号切换数据
}

function zoomIn() {
  if (scale.value < 2) {
    scale.value = Math.min(2, scale.value + 0.1)
  }
}

function zoomOut() {
  if (scale.value > 0.5) {
    scale.value = Math.max(0.5, scale.value - 0.1)
  }
}

function zoomReset() {
  scale.value = 1
}
</script>

<style scoped>
.yard-slot-grid {
  background: rgba(20, 28, 48, 0.8);
  border: 1px solid rgba(64, 158, 255, 0.2);
  border-radius: 8px;
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.yard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.yard-title {
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
}

.yard-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.grid-wrapper {
  flex: 1;
  overflow: auto;
  position: relative;
}

.grid-container {
  transform-origin: top left;
  transition: transform 0.3s;
  display: inline-flex;
  flex-direction: column;
}

.grid-rows {
  display: flex;
  flex-direction: column;
}

.grid-row {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.row-label {
  width: 30px;
  text-align: center;
  color: #a8b2c1;
  font-size: 12px;
}

.row-slots {
  display: flex;
  gap: 4px;
}

.slot-cell {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
}

.slot-cell:hover {
  transform: scale(1.1);
  z-index: 10;
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.5);
}

.slot-no {
  font-size: 9px;
  color: #fff;
  text-align: center;
  line-height: 1.2;
  word-break: break-all;
}

.grid-col-labels {
  display: flex;
  margin-top: 8px;
  padding-left: 30px;
}

.col-label-empty {
  width: 30px;
}

.col-label {
  width: 40px;
  margin-right: 4px;
  text-align: center;
  color: #a8b2c1;
  font-size: 12px;
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

.slot-selected {
  box-shadow: 0 0 0 3px #ffd700;
}

.slot-suggest {
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
