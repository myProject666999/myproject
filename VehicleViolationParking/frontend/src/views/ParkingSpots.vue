<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">车位管理</h2>
      <el-button type="primary" :icon="Plus" @click="handleAdd">新增车位</el-button>
    </div>

    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-item" shadow="hover">
          <div class="stat-label">车位总数</div>
          <div class="stat-value">{{ stats.total || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-item" shadow="hover">
          <div class="stat-label">空闲车位</div>
          <div class="stat-value text-success">{{ stats.free || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-item" shadow="hover">
          <div class="stat-label">占用车位</div>
          <div class="stat-value text-danger">{{ stats.occupied || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-item" shadow="hover">
          <div class="stat-label">维修车位</div>
          <div class="stat-value text-warning">{{ stats.repair || 0 }}</div>
        </el-card>
      </el-col>
    </el-row>

    <div class="search-bar">
      <el-form :inline="true">
        <el-form-item label="区域">
          <el-select v-model="searchArea" placeholder="全部" clearable @change="fetchSpots">
            <el-option
              v-for="area in areas"
              :key="area.spot_area"
              :label="area.spot_area"
              :value="area.spot_area"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchStatus" placeholder="全部" clearable @change="fetchSpots">
            <el-option label="空闲" :value="0" />
            <el-option label="占用" :value="1" />
            <el-option label="预留" :value="2" />
            <el-option label="维修" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Refresh" @click="fetchSpots">刷新</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card>
      <div class="spot-legend">
        <span class="legend-item"><i class="dot free"></i>空闲</span>
        <span class="legend-item"><i class="dot occupied"></i>占用</span>
        <span class="legend-item"><i class="dot reserved"></i>预留</span>
        <span class="legend-item"><i class="dot repair"></i>维修</span>
      </div>

      <div class="spot-container" v-for="area in groupedSpots" :key="area.name">
        <h3 class="area-title">{{ area.name }}</h3>
        <div class="spot-grid">
          <div
            v-for="spot in area.spots"
            :key="spot.id"
            :class="['spot-item', getStatusClass(spot.status)]"
            @click="handleSpotClick(spot)"
          >
            <div class="spot-number">{{ spot.spot_number }}</div>
            <div class="spot-plate" v-if="spot.current_plate_number">
              {{ spot.current_plate_number }}
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="400px"
      @close="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="车位编号" prop="spot_number">
          <el-input v-model="form.spot_number" placeholder="如: A001" />
        </el-form-item>
        <el-form-item label="车位类型" prop="spot_type">
          <el-select v-model="form.spot_type">
            <el-option label="小型车位" :value="1" />
            <el-option label="中型车位" :value="2" />
            <el-option label="大型车位" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属区域">
          <el-input v-model="form.spot_area" placeholder="如: A区" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status">
            <el-option label="空闲" :value="0" />
            <el-option label="预留" :value="2" />
            <el-option label="维修" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getSpotList,
  getSpotStatistics,
  getSpotAreas,
  createSpot,
  updateSpot,
  deleteSpot
} from '@/api'

const spots = ref([])
const stats = ref({})
const areas = ref([])
const searchArea = ref('')
const searchStatus = ref('')

const dialogVisible = ref(false)
const dialogTitle = ref('新增车位')
const submitting = ref(false)
const formRef = ref(null)
const isEdit = ref(false)
const editId = ref(null)

const form = reactive({
  spot_number: '',
  spot_type: 1,
  spot_area: '',
  status: 0,
  remark: ''
})

const rules = {
  spot_number: [{ required: true, message: '请输入车位编号', trigger: 'blur' }],
  spot_type: [{ required: true, message: '请选择车位类型', trigger: 'change' }]
}

const groupedSpots = computed(() => {
  const groups = {}
  spots.value.forEach(spot => {
    if (!groups[spot.spot_area]) {
      groups[spot.spot_area] = []
    }
    groups[spot.spot_area].push(spot)
  })
  return Object.entries(groups)
    .map(([name, spots]) => ({ name, spots }))
    .sort((a, b) => a.name.localeCompare(b.name))
})

const getStatusClass = (status) => {
  const classes = {
    0: 'spot-free',
    1: 'spot-occupied',
    2: 'spot-reserved',
    3: 'spot-repair'
  }
  return classes[status] || 'spot-free'
}

const fetchSpots = async () => {
  try {
    const params = {}
    if (searchArea.value) params.spot_area = searchArea.value
    if (searchStatus.value !== '') params.status = searchStatus.value
    
    const res = await getSpotList(params)
    if (res.code === 0) {
      spots.value = res.data.list || []
    }
  } catch (error) {
    console.error('Fetch spots error:', error)
  }
}

const fetchStats = async () => {
  try {
    const res = await getSpotStatistics()
    if (res.code === 0) {
      stats.value = res.data
    }
  } catch (error) {
    console.error('Fetch stats error:', error)
  }
}

const fetchAreas = async () => {
  try {
    const res = await getSpotAreas()
    if (res.code === 0) {
      areas.value = res.data || []
    }
  } catch (error) {
    console.error('Fetch areas error:', error)
  }
}

const resetForm = () => {
  Object.assign(form, {
    spot_number: '',
    spot_type: 1,
    spot_area: '',
    status: 0,
    remark: ''
  })
  formRef.value?.resetFields()
}

const handleAdd = () => {
  isEdit.value = false
  editId.value = null
  dialogTitle.value = '新增车位'
  resetForm()
  dialogVisible.value = true
}

const handleSpotClick = (spot) => {
  const statusText = {
    0: '空闲',
    1: '占用',
    2: '预留',
    3: '维修'
  }
  
  let msg = `车位编号: ${spot.spot_number}\n状态: ${statusText[spot.status]}`
  if (spot.current_plate_number) {
    msg += `\n当前车辆: ${spot.current_plate_number}`
  }
  
  ElMessageBox.alert(msg, '车位信息', {
    confirmButtonText: '确定'
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        let res
        if (isEdit.value) {
          res = await updateSpot(editId.value, form)
        } else {
          res = await createSpot(form)
        }
        
        if (res.code === 0) {
          ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
          dialogVisible.value = false
          fetchSpots()
          fetchStats()
        }
      } finally {
        submitting.value = false
      }
    }
  })
}

onMounted(() => {
  fetchSpots()
  fetchStats()
  fetchAreas()
})
</script>

<style scoped>
.stats-row {
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.text-success { color: #67c23a; }
.text-danger { color: #f56c6c; }
.text-warning { color: #e6a23c; }

.spot-legend {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  display: inline-block;
}

.dot.free { background: #67c23a; }
.dot.occupied { background: #f56c6c; }
.dot.reserved { background: #e6a23c; }
.dot.repair { background: #909399; }

.area-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 10px 0;
  padding-left: 10px;
  border-left: 3px solid #409eff;
}

.spot-container {
  margin-bottom: 20px;
}

.spot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 10px;
}

.spot-item {
  aspect-ratio: 1.5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.spot-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.spot-free {
  background: #67c23a;
  color: #fff;
}

.spot-occupied {
  background: #f56c6c;
  color: #fff;
}

.spot-reserved {
  background: #e6a23c;
  color: #fff;
}

.spot-repair {
  background: #909399;
  color: #fff;
}

.spot-number {
  font-size: 14px;
  font-weight: 600;
}

.spot-plate {
  font-size: 10px;
  margin-top: 4px;
  background: rgba(0, 0, 0, 0.2);
  padding: 2px 4px;
  border-radius: 3px;
}
</style>
