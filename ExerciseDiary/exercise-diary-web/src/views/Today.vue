<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span style="font-size: 18px; font-weight: bold">📅 今日运动记录</span>
              <el-button type="primary" @click="showAddDialog = true">
                <el-icon><Plus /></el-icon> 添加运动
              </el-button>
            </div>
          </template>

          <el-empty v-if="todayRecords.length === 0" description="今日还没有运动记录，快去运动吧！" />

          <el-timeline v-else>
            <el-timeline-item
              v-for="record in todayRecords"
              :key="record.id"
              :timestamp="record.exerciseDate"
              placement="top"
            >
              <el-card shadow="never" style="margin-bottom: 10px">
                <div style="display: flex; justify-content: space-between; align-items: center">
                  <div>
                    <div style="font-size: 20px; margin-bottom: 8px">
                      <span style="margin-right: 8px">{{ record.icon }}</span>
                      <span style="font-weight: bold">{{ record.exerciseTypeName }}</span>
                    </div>
                    <el-tag size="small" style="margin-right: 10px">
                      时长：{{ record.duration }} 分钟
                    </el-tag>
                    <el-tag type="success" size="small" style="margin-right: 10px">
                      消耗：{{ record.calories }} kcal
                    </el-tag>
                    <el-tag :type="getIntensityType(record.intensity)" size="small">
                      强度：{{ getIntensityText(record.intensity) }}
                    </el-tag>
                    <div v-if="record.distance" style="margin-top: 8px; color: #666">
                      距离：{{ record.distance }} km
                    </div>
                    <div v-if="record.remark" style="margin-top: 8px; color: #666">
                      备注：{{ record.remark }}
                    </div>
                  </div>
                  <el-button type="danger" link @click="handleDelete(record.id)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover" style="margin-bottom: 20px">
          <template #header>
            <span style="font-size: 18px; font-weight: bold">🔥 今日数据</span>
          </template>
          <div style="text-align: center">
            <div style="font-size: 48px; color: #f56c6c; font-weight: bold">
              {{ dailyStats.totalCalories || 0 }}
            </div>
            <div style="color: #909399; margin-bottom: 20px">消耗热量 (kcal)</div>
            <el-divider />
            <div style="font-size: 24px; color: #409eff; font-weight: bold">
              {{ dailyStats.totalDuration || 0 }}
            </div>
            <div style="color: #909399">运动时长 (分钟)</div>
          </div>
        </el-card>

        <el-card shadow="hover">
          <template #header>
            <span style="font-size: 18px; font-weight: bold">🏆 个人 PR</span>
          </template>
          <el-empty v-if="prList.length === 0" description="暂无 PR 记录" :image-size="80" />
          <div v-else>
            <div
              v-for="pr in prList.slice(0, 5)"
              :key="pr.id"
              style="padding: 10px 0; border-bottom: 1px solid #eee"
            >
              <div style="display: flex; justify-content: space-between">
                <span>
                  <span style="margin-right: 5px">{{ pr.icon }}</span>
                  {{ pr.exerciseTypeName }} - {{ pr.prType }}
                </span>
                <el-tag type="warning" size="small">
                  {{ pr.prValue }} {{ pr.prUnit }}
                </el-tag>
              </div>
              <div style="font-size: 12px; color: #909399; margin-top: 5px">
                达成日期：{{ pr.achievedDate }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="showAddDialog" title="添加运动记录" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="运动类型">
          <el-select v-model="form.exerciseTypeId" placeholder="请选择运动类型" style="width: 100%">
            <el-option
              v-for="type in exerciseTypes"
              :key="type.id"
              :label="type.icon + ' ' + type.name + ' (MET:' + type.met + ')'"
              :value="type.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="运动时长">
          <el-input-number v-model="form.duration" :min="1" :max="480" />
          <span style="margin-left: 10px">分钟</span>
        </el-form-item>
        <el-form-item label="运动强度">
          <el-radio-group v-model="form.intensity">
            <el-radio :label="1">轻松</el-radio>
            <el-radio :label="2">适中</el-radio>
            <el-radio :label="3">较强</el-radio>
            <el-radio :label="4">剧烈</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="距离(可选)">
          <el-input-number v-model="form.distance" :min="0" :precision="2" />
          <span style="margin-left: 10px">km</span>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAdd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getTodayRecords,
  getDailyStats,
  getExerciseTypes,
  getPrList,
  addRecord,
  deleteRecord
} from '../api'

const todayRecords = ref([])
const dailyStats = ref({})
const exerciseTypes = ref([])
const prList = ref([])
const showAddDialog = ref(false)
const form = ref({
  exerciseTypeId: null,
  duration: 30,
  intensity: 2,
  distance: null,
  remark: ''
})

const fetchData = async () => {
  todayRecords.value = await getTodayRecords()
  dailyStats.value = await getDailyStats()
  exerciseTypes.value = await getExerciseTypes()
  prList.value = await getPrList()
}

const handleAdd = async () => {
  if (!form.value.exerciseTypeId) {
    ElMessage.warning('请选择运动类型')
    return
  }
  await addRecord({ ...form.value, userId: 1 })
  ElMessage.success('添加成功')
  showAddDialog.value = false
  form.value = { exerciseTypeId: null, duration: 30, intensity: 2, distance: null, remark: '' }
  fetchData()
}

const handleDelete = (id) => {
  ElMessageBox.confirm('确定删除这条记录吗？', '提示', { type: 'warning' })
    .then(async () => {
      await deleteRecord(id)
      ElMessage.success('删除成功')
      fetchData()
    })
    .catch(() => {})
}

const getIntensityText = (level) => {
  const map = { 1: '轻松', 2: '适中', 3: '较强', 4: '剧烈' }
  return map[level] || '适中'
}

const getIntensityType = (level) => {
  const map = { 1: 'info', 2: '', 3: 'warning', 4: 'danger' }
  return map[level] || ''
}

onMounted(fetchData)
</script>
