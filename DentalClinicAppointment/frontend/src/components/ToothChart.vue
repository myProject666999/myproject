<template>
  <div class="tooth-chart">
    <div class="quadrant-container">
      <div class="quadrant quadrant-2">
        <div class="quadrant-title">上颌左 (10-19)</div>
        <div class="teeth-row">
          <div
            v-for="tooth in upperLeftTeeth"
            :key="tooth"
            class="tooth"
            :class="getToothClass(tooth)"
            @click="handleToothClick(tooth)"
          >
            <span class="tooth-number">{{ tooth }}</span>
          </div>
        </div>
      </div>
      <div class="quadrant quadrant-1">
        <div class="quadrant-title">上颌右 (1-9)</div>
        <div class="teeth-row">
          <div
            v-for="tooth in upperRightTeeth"
            :key="tooth"
            class="tooth"
            :class="getToothClass(tooth)"
            @click="handleToothClick(tooth)"
          >
            <span class="tooth-number">{{ tooth }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="midline">中线</div>

    <div class="quadrant-container">
      <div class="quadrant quadrant-3">
        <div class="quadrant-title">下颌左 (30-39)</div>
        <div class="teeth-row">
          <div
            v-for="tooth in lowerLeftTeeth"
            :key="tooth"
            class="tooth"
            :class="getToothClass(tooth)"
            @click="handleToothClick(tooth)"
          >
            <span class="tooth-number">{{ tooth }}</span>
          </div>
        </div>
      </div>
      <div class="quadrant quadrant-4">
        <div class="quadrant-title">下颌右 (40-49)</div>
        <div class="teeth-row">
          <div
            v-for="tooth in lowerRightTeeth"
            :key="tooth"
            class="tooth"
            :class="getToothClass(tooth)"
            @click="handleToothClick(tooth)"
          >
            <span class="tooth-number">{{ tooth }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="legend">
      <div class="legend-item">
        <div class="legend-color normal"></div>
        <span>正常</span>
      </div>
      <div class="legend-item">
        <div class="legend-color missing"></div>
        <span>缺失</span>
      </div>
      <div class="legend-item">
        <div class="legend-color implant"></div>
        <span>种植</span>
      </div>
      <div class="legend-item">
        <div class="legend-color crown"></div>
        <span>冠修复</span>
      </div>
      <div class="legend-item">
        <div class="legend-color bridge"></div>
        <span>桥修复</span>
      </div>
    </div>

    <el-dialog v-model="dialogVisible" title="牙齿状态" width="400px">
      <el-form :model="toothForm" label-width="100px">
        <el-form-item label="牙位">
          <el-input :value="currentTooth" disabled />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="toothForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="正常" value="NORMAL" />
            <el-option label="缺失" value="MISSING" />
            <el-option label="种植" value="IMPLANT" />
            <el-option label="冠修复" value="CROWN" />
            <el-option label="桥修复" value="BRIDGE" />
          </el-select>
        </el-form-item>
        <el-form-item label="状况描述">
          <el-input
            v-model="toothForm.toothCondition"
            type="textarea"
            :rows="3"
            placeholder="请输入牙齿状况"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="toothForm.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveToothStatus">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getToothStatus, createToothStatus, updateToothStatus } from '../api'

const props = defineProps({
  patientId: {
    type: Number,
    required: true
  }
})

const upperRightTeeth = [18, 17, 16, 15, 14, 13, 12, 11]
const upperLeftTeeth = [21, 22, 23, 24, 25, 26, 27, 28]
const lowerLeftTeeth = [31, 32, 33, 34, 35, 36, 37, 38]
const lowerRightTeeth = [48, 47, 46, 45, 44, 43, 42, 41]

const toothStatusMap = reactive({})
const dialogVisible = ref(false)
const currentTooth = ref(null)

const toothForm = reactive({
  id: null,
  patientId: props.patientId,
  toothNumber: null,
  status: '',
  toothCondition: '',
  remark: ''
})

const loadToothStatus = async () => {
  try {
    const res = await getToothStatus(props.patientId)
    const data = res.data || []
    data.forEach(item => {
      toothStatusMap[item.toothNumber] = item
    })
  } catch (e) {
    console.error(e)
  }
}

const getToothClass = (toothNumber) => {
  const status = toothStatusMap[toothNumber]?.status || 'NORMAL'
  return {
    normal: status === 'NORMAL',
    missing: status === 'MISSING',
    implant: status === 'IMPLANT',
    crown: status === 'CROWN',
    bridge: status === 'BRIDGE'
  }
}

const handleToothClick = (toothNumber) => {
  currentTooth.value = toothNumber
  toothForm.patientId = props.patientId
  toothForm.toothNumber = toothNumber
  
  const existing = toothStatusMap[toothNumber]
  if (existing) {
    toothForm.id = existing.id
    toothForm.status = existing.status
    toothForm.toothCondition = existing.toothCondition
    toothForm.remark = existing.remark
  } else {
    toothForm.id = null
    toothForm.status = 'NORMAL'
    toothForm.toothCondition = ''
    toothForm.remark = ''
  }
  
  dialogVisible.value = true
}

const saveToothStatus = async () => {
  if (toothForm.id) {
    await updateToothStatus(toothForm)
    ElMessage.success('更新成功')
  } else {
    await createToothStatus(toothForm)
    ElMessage.success('保存成功')
  }
  dialogVisible.value = false
  loadToothStatus()
}

watch(() => props.patientId, () => {
  Object.keys(toothStatusMap).forEach(key => delete toothStatusMap[key])
  loadToothStatus()
})

onMounted(() => {
  loadToothStatus()
})
</script>

<style lang="scss" scoped>
.tooth-chart {
  padding: 20px;

  .quadrant-container {
    display: flex;
    gap: 20px;
    justify-content: center;
    margin-bottom: 10px;
  }

  .quadrant {
    flex: 1;
    max-width: 400px;

    .quadrant-title {
      text-align: center;
      font-weight: bold;
      margin-bottom: 10px;
      color: #666;
    }
  }

  .teeth-row {
    display: flex;
    gap: 5px;
    justify-content: center;
  }

  .tooth {
    width: 45px;
    height: 45px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: 2px solid #ddd;
    transition: all 0.2s;
    background: #fff;

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    &.normal { background: #f0f9eb; border-color: #67c23a; }
    &.missing { background: #fef0f0; border-color: #f56c6c; }
    &.implant { background: #e6f7ff; border-color: #409eff; }
    &.crown { background: #fdf6ec; border-color: #e6a23c; }
    &.bridge { background: #f4f4f5; border-color: #909399; }

    .tooth-number {
      font-size: 12px;
      font-weight: bold;
      color: #333;
    }
  }

  .midline {
    text-align: center;
    margin: 15px 0;
    color: #999;
    font-size: 14px;
  }

  .legend {
    display: flex;
    justify-content: center;
    gap: 30px;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #eee;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #666;

      .legend-color {
        width: 20px;
        height: 20px;
        border-radius: 4px;
        border: 1px solid #ddd;

        &.normal { background: #f0f9eb; border-color: #67c23a; }
        &.missing { background: #fef0f0; border-color: #f56c6c; }
        &.implant { background: #e6f7ff; border-color: #409eff; }
        &.crown { background: #fdf6ec; border-color: #e6a23c; }
        &.bridge { background: #f4f4f5; border-color: #909399; }
      }
    }
  }
}
</style>
