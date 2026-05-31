<template>
  <div class="allocation-page">
    <div class="page-title">
      <el-icon :size="24"><Location /></el-icon>
      <span>堆位分配</span>
    </div>

    <div class="allocation-container">
      <div class="left-panel">
        <el-card class="pending-container">
          <template #header>
            <div class="card-header">
              <el-icon><List /></el-icon>
              <span>待分配集装箱</span>
              <el-badge :value="pendingList.length" class="ml-2" />
            </div>
          </template>
          <div class="pending-list">
            <div
              v-for="item in pendingList"
              :key="item.id"
              :class="['pending-item', { active: selectedContainer?.id === item.id }]"
              @click="handleSelectContainer(item)"
            >
              <div class="item-main">
                <span class="container-no">{{ item.containerNo }}</span>
                <el-tag size="small" :type="getCargoTypeTag(item.cargoType)">
                  {{ item.containerType }}
                </el-tag>
              </div>
              <div class="item-info">
                <span v-if="item.isDanger">
                  <el-tag type="danger" size="small">危险品</el-tag>
                </span>
                <span v-if="item.isReefer">
                  <el-tag type="success" size="small">冷藏箱</el-tag>
                </span>
                <span class="weight">{{ item.weight }}吨</span>
              </div>
              <div class="item-actions">
                <el-button type="primary" size="small" @click.stop="handleAutoAllocate(item)">
                  自动分配
                </el-button>
              </div>
            </div>
            <el-empty v-if="pendingList.length === 0" description="暂无待分配集装箱" />
          </div>
        </el-card>
      </div>

      <div class="right-panel">
        <el-card class="yard-view">
          <template #header>
            <div class="card-header">
              <el-icon><Grid /></el-icon>
              <span>堆场箱位</span>
              <el-radio-group v-model="viewMode" size="small" class="ml-auto">
                <el-radio-button label="2D">2D视图</el-radio-button>
                <el-radio-button label="3D">3D视图</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="yard-content">
            <YardSlotGrid
              v-if="viewMode === '2D'"
              yard-name="A堆场"
              :grid-data="gridData"
              :selected-slot="selectedSlot"
              :suggested-slots="suggestedSlots"
              @slot-click="handleSlotClick"
            />
            <YardSlot3D
              v-else
              yard-name="A堆场"
              :grid-data="gridData3D"
              @slot-click="handleSlotClick"
            />
          </div>
        </el-card>

        <el-card class="suggestion-panel" v-if="selectedContainer">
          <template #header>
            <div class="card-header">
              <el-icon><MagicStick /></el-icon>
              <span>分配建议 (Top3)</span>
            </div>
          </template>
          <div class="suggestion-list">
            <div
              v-for="(suggestion, index) in suggestedSlots"
              :key="suggestion.id"
              :class="['suggestion-item', { active: selectedSlot?.id === suggestion.id }]"
              @click="handleSelectSuggestion(suggestion)"
            >
              <div class="suggestion-rank">{{ index + 1 }}</div>
              <div class="suggestion-info">
                <div class="suggestion-slot">{{ suggestion.yardCode }}-{{ suggestion.row }}-{{ suggestion.col }}-{{ suggestion.layer }}</div>
                <div class="suggestion-score">匹配度: <span class="score">{{ suggestion.score }}%</span></div>
              </div>
              <div class="suggestion-reason">{{ suggestion.reason }}</div>
            </div>
          </div>
          <div class="suggestion-actions" v-if="selectedSlot">
            <el-button type="primary" :loading="allocating" @click="handleConfirmAllocate">
              <el-icon><Check /></el-icon>
              确认分配
            </el-button>
            <el-button @click="handleClearSelection">
              <el-icon><Close /></el-icon>
              取消选择
            </el-button>
          </div>
        </el-card>
      </div>
    </div>

    <SlotLegend style="margin-top: 16px;" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Location,
  List,
  Grid,
  MagicStick,
  Check,
  Close
} from '@element-plus/icons-vue'
import YardSlotGrid from '@/components/yard/YardSlotGrid.vue'
import YardSlot3D from '@/components/yard/YardSlot3D.vue'
import SlotLegend from '@/components/yard/SlotLegend.vue'
import { getPendingAllocation, getAllocationSuggestion, autoAllocate, manualAllocate } from '@/api/allocation'

const viewMode = ref('2D')
const pendingList = ref([])
const selectedContainer = ref(null)
const selectedSlot = ref(null)
const suggestedSlots = ref([])
const allocating = ref(false)
const gridData = ref([])
const gridData3D = ref([])

function getCargoTypeTag(type) {
  const map = { GENERAL: 'info', DANGER: 'danger', REEFER: 'success', FRAGILE: 'warning' }
  return map[type] || 'info'
}

async function fetchPendingList() {
  try {
    const res = await getPendingAllocation()
    pendingList.value = res.data || []
  } catch (error) {
    console.error('获取待分配列表失败:', error)
  }
}

async function handleSelectContainer(container) {
  selectedContainer.value = container
  selectedSlot.value = null
  
  try {
    const res = await getAllocationSuggestion(container.id)
    suggestedSlots.value = res.data || []
  } catch (error) {
    console.error('获取分配建议失败:', error)
  }
}

function handleSlotClick(slot) {
  if (slot.status === 'EMPTY') {
    selectedSlot.value = slot
  } else {
    ElMessage.warning('该箱位已被占用')
  }
}

function handleSelectSuggestion(suggestion) {
  selectedSlot.value = suggestion
}

async function handleAutoAllocate(container) {
  try {
    allocating.value = true
    await autoAllocate(container.id)
    ElMessage.success('自动分配成功')
    fetchPendingList()
    selectedContainer.value = null
    selectedSlot.value = null
    suggestedSlots.value = []
  } catch (error) {
    console.error('自动分配失败:', error)
  } finally {
    allocating.value = false
  }
}

async function handleConfirmAllocate() {
  if (!selectedContainer.value || !selectedSlot.value) {
    ElMessage.warning('请先选择集装箱和箱位')
    return
  }
  
  try {
    allocating.value = true
    await manualAllocate({
      containerId: selectedContainer.value.id,
      slotId: selectedSlot.value.id
    })
    ElMessage.success('分配成功')
    fetchPendingList()
    selectedContainer.value = null
    selectedSlot.value = null
    suggestedSlots.value = []
  } catch (error) {
    console.error('分配失败:', error)
  } finally {
    allocating.value = false
  }
}

function handleClearSelection() {
  selectedSlot.value = null
}

function generateMockGridData() {
  const rows = 10
  const cols = 20
  const layers = 5
  
  const data2D = []
  const data3D = []
  
  for (let r = 0; r < rows; r++) {
    const row2D = []
    const row3D = []
    
    for (let c = 0; c < cols; c++) {
      const rand = Math.random()
      const status = rand > 0.35 ? 'OCCUPIED' : 'EMPTY'
      const isDanger = status === 'OCCUPIED' && Math.random() > 0.9
      const isReefer = status === 'OCCUPIED' && !isDanger && Math.random() > 0.85
      
      row2D.push({
        id: `${r}-${c}`,
        yardCode: 'A',
        row: r + 1,
        col: c + 1,
        layer: 1,
        status,
        isDanger,
        isReefer,
        containerNo: status === 'OCCUPIED' ? `MSKU${Math.floor(Math.random() * 1000000)}` : null
      })
      
      const col3D = []
      for (let l = 0; l < layers; l++) {
        const layerRand = Math.random()
        const layerStatus = layerRand > 0.5 ? 'OCCUPIED' : 'EMPTY'
        const layerIsDanger = layerStatus === 'OCCUPIED' && Math.random() > 0.9
        const layerIsReefer = layerStatus === 'OCCUPIED' && !layerIsDanger && Math.random() > 0.85
        
        col3D.push({
          id: `${r}-${c}-${l}`,
          yardCode: 'A',
          row: r + 1,
          col: c + 1,
          layer: l + 1,
          status: layerStatus,
          isDanger: layerIsDanger,
          isReefer: layerIsReefer,
          containerNo: layerStatus === 'OCCUPIED' ? `MSKU${Math.floor(Math.random() * 1000000)}` : null
        })
      }
      row3D.push(col3D)
    }
    data2D.push(row2D)
    data3D.push(row3D)
  }
  
  gridData.value = data2D
  gridData3D.value = data3D
}

onMounted(() => {
  fetchPendingList()
  generateMockGridData()
})
</script>

<style scoped>
.allocation-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.allocation-container {
  flex: 1;
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 16px;
  min-height: 0;
}

.left-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.pending-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.pending-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.pending-item {
  padding: 12px;
  margin-bottom: 12px;
  background: rgba(64, 158, 255, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.pending-item:hover {
  border-color: rgba(64, 158, 255, 0.5);
  background: rgba(64, 158, 255, 0.1);
}

.pending-item.active {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.15);
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.3);
}

.item-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.container-no {
  font-weight: 600;
  color: #e0e6ed;
}

.item-info {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.weight {
  font-size: 12px;
  color: #a8b2c1;
}

.item-actions {
  display: flex;
  justify-content: flex-end;
}

.right-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

.yard-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.yard-content {
  flex: 1;
  min-height: 0;
}

.ml-auto {
  margin-left: auto;
}

.ml-2 {
  margin-left: 8px;
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(64, 158, 255, 0.05);
  border: 1px solid rgba(64, 158, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.suggestion-item:hover {
  border-color: rgba(64, 158, 255, 0.5);
}

.suggestion-item.active {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.15);
}

.suggestion-rank {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409eff 0%, #1c7ed6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.suggestion-info {
  flex: 1;
}

.suggestion-slot {
  font-weight: 600;
  color: #e0e6ed;
  margin-bottom: 4px;
}

.suggestion-score {
  font-size: 12px;
  color: #a8b2c1;
}

.score {
  color: #67c23a;
  font-weight: 600;
}

.suggestion-reason {
  font-size: 12px;
  color: #6b7280;
  max-width: 200px;
}

.suggestion-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid rgba(64, 158, 255, 0.2);
}
</style>