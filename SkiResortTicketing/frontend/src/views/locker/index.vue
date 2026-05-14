<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>储物柜管理</span>
          <el-button type="primary" @click="openAssignDialog">
            <el-icon><Plus /></el-icon>
            分配储物柜
          </el-button>
        </div>
      </template>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="储物柜状态" name="status">
          <el-row :gutter="20">
            <el-col :span="8" v-for="area in areas" :key="area.id">
              <el-card class="mb-20">
                <template #header>
                  <div class="card-header">
                    <span>{{ area.name }}</span>
                    <span style="color: #909399">{{ area.location }}</span>
                  </div>
                </template>
                <div class="locker-grid">
                  <div
                    v-for="locker in getLockersByArea(area.id)"
                    :key="locker.id"
                    class="locker-item"
                    :class="'locker-' + locker.status"
                    @click="handleLockerClick(locker)"
                  >
                    <div class="locker-no">{{ locker.lockerNo }}</div>
                    <div class="locker-size">{{ locker.size }}</div>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="使用记录" name="usage">
          <el-table :data="usageRecords" border>
            <el-table-column prop="lockerNo" label="柜号" width="100" />
            <el-table-column prop="area" label="区域" width="100" />
            <el-table-column prop="customerName" label="使用人" width="120" />
            <el-table-column prop="phone" label="联系电话" width="130" />
            <el-table-column prop="startTime" label="开始时间" width="160" />
            <el-table-column prop="endTime" label="结束时间" width="160" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'warning' : 'success'">
                  {{ row.status === 1 ? '使用中' : '已结束' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button type="primary" link size="small" v-if="row.status === 1" @click="endUsage(row)">结束使用</el-button>
                <el-button type="info" link size="small" @click="showDetail(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="detailDialogVisible" title="储物柜使用详情" width="500px">
      <el-descriptions :column="2" border v-if="currentUsage">
        <el-descriptions-item label="储物柜编号">{{ currentUsage.lockerNo }}</el-descriptions-item>
        <el-descriptions-item label="所在区域">{{ currentUsage.area }}</el-descriptions-item>
        <el-descriptions-item label="使用人">{{ currentUsage.customerName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentUsage.phone }}</el-descriptions-item>
        <el-descriptions-item label="开箱密码">{{ currentUsage.password }}</el-descriptions-item>
        <el-descriptions-item label="押金(元)">{{ currentUsage.deposit }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ currentUsage.startTime }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ currentUsage.endTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态" :span="2">
          <el-tag :type="currentUsage.status === 1 ? 'warning' : 'success'">
            {{ currentUsage.status === 1 ? '使用中' : '已结束' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog v-model="assignDialogVisible" title="分配储物柜" width="500px">
      <el-form :model="assignForm" label-width="100px">
        <el-form-item label="选择区域">
          <el-select v-model="assignForm.areaId" placeholder="请选择区域" style="width: 100%" @change="onAreaChange">
            <el-option v-for="area in areas" :key="area.id" :label="area.name" :value="area.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="选择储物柜">
          <el-select v-model="assignForm.lockerId" placeholder="请选择储物柜" style="width: 100%">
            <el-option
              v-for="locker in availableLockers"
              :key="locker.id"
              :label="`${locker.lockerNo} - ${locker.size}`"
              :value="locker.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="使用人">
          <el-input v-model="assignForm.customerName" placeholder="请输入使用人姓名" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="assignForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="开箱密码">
          <el-input v-model="assignForm.password" placeholder="请设置开箱密码" />
        </el-form-item>
        <el-form-item label="押金(元)">
          <el-input-number v-model="assignForm.deposit" :min="0" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="assignLocker">确认分配</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeTab = ref('status')
const assignDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const currentUsage = ref(null)

const areas = ref([
  { id: 1, name: 'A区', location: '一楼大厅左侧', totalCount: 50 },
  { id: 2, name: 'B区', location: '一楼大厅右侧', totalCount: 50 },
  { id: 3, name: 'C区', location: '二楼租赁区旁', totalCount: 30 }
])

const lockers = ref([
  { id: 1, areaId: 1, lockerNo: 'A001', size: '小号', status: 0 },
  { id: 2, areaId: 1, lockerNo: 'A002', size: '小号', status: 1 },
  { id: 3, areaId: 1, lockerNo: 'A003', size: '中号', status: 0 },
  { id: 4, areaId: 1, lockerNo: 'A004', size: '中号', status: 1 },
  { id: 5, areaId: 1, lockerNo: 'A005', size: '大号', status: 0 },
  { id: 6, areaId: 2, lockerNo: 'B001', size: '小号', status: 1 },
  { id: 7, areaId: 2, lockerNo: 'B002', size: '中号', status: 0 },
  { id: 8, areaId: 2, lockerNo: 'B003', size: '大号', status: 2 },
  { id: 9, areaId: 3, lockerNo: 'C001', size: '大号', status: 0 },
  { id: 10, areaId: 3, lockerNo: 'C002', size: '大号', status: 1 }
])

const usageRecords = ref([
  { id: 1, lockerId: 2, lockerNo: 'A002', area: 'A区', customerName: '张三', phone: '13800000001', password: '123456', startTime: '2024-05-14 09:30:00', endTime: null, status: 1, deposit: 100 },
  { id: 2, lockerId: 4, lockerNo: 'A004', area: 'A区', customerName: '李四', phone: '13800000002', password: '654321', startTime: '2024-05-14 10:15:00', endTime: null, status: 1, deposit: 100 },
  { id: 3, lockerId: 6, lockerNo: 'B001', area: 'B区', customerName: '王五', phone: '13800000003', password: '111111', startTime: '2024-05-14 08:45:00', endTime: '2024-05-14 15:30:00', status: 2, deposit: 100 },
  { id: 4, lockerId: 10, lockerNo: 'C002', area: 'C区', customerName: '赵六', phone: '13800000004', password: '222222', startTime: '2024-05-14 11:00:00', endTime: null, status: 1, deposit: 100 }
])

const assignForm = reactive({
  areaId: '',
  lockerId: '',
  customerName: '',
  phone: '',
  password: '',
  deposit: 100
})

const availableLockers = computed(() => {
  if (!assignForm.areaId) return []
  return lockers.value.filter(l => l.areaId === assignForm.areaId && l.status === 0)
})

const getLockersByArea = (areaId) => {
  return lockers.value.filter(l => l.areaId === areaId)
}

const openAssignDialog = () => {
  const freeCount = lockers.value.filter(l => l.status === 0).length
  if (freeCount === 0) {
    ElMessage.warning('当前没有可用的储物柜！')
    return
  }
  Object.assign(assignForm, {
    areaId: '',
    lockerId: '',
    customerName: '',
    phone: '',
    password: '',
    deposit: 100
  })
  assignDialogVisible.value = true
}

const onAreaChange = () => {
  assignForm.lockerId = ''
}

const assignLocker = () => {
  if (!assignForm.areaId) {
    ElMessage.warning('请选择区域！')
    return
  }
  if (!assignForm.lockerId) {
    ElMessage.warning('请选择储物柜！')
    return
  }
  if (!assignForm.customerName) {
    ElMessage.warning('请输入使用人姓名！')
    return
  }

  const locker = lockers.value.find(l => l.id === assignForm.lockerId)
  const area = areas.value.find(a => a.id === assignForm.areaId)
  const now = new Date().toLocaleString()

  locker.status = 1

  usageRecords.value.unshift({
    id: Date.now(),
    lockerId: assignForm.lockerId,
    lockerNo: locker.lockerNo,
    area: area.name,
    customerName: assignForm.customerName,
    phone: assignForm.phone,
    password: assignForm.password,
    startTime: now,
    endTime: null,
    status: 1,
    deposit: assignForm.deposit
  })

  assignDialogVisible.value = false
  ElMessage.success('储物柜分配成功！')
}

const handleLockerClick = (locker) => {
  const statusMap = { 0: '空闲', 1: '使用中', 2: '维护中' }
  ElMessage.info(`储物柜 ${locker.lockerNo} (${locker.size}) - ${statusMap[locker.status]}`)
}

const endUsage = (row) => {
  ElMessageBox.confirm(`确定要结束储物柜 ${row.lockerNo} 的使用吗？押金 ¥${row.deposit} 将退回。`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    const locker = lockers.value.find(l => l.id === row.lockerId)
    if (locker) {
      locker.status = 0
    }
    row.status = 2
    row.endTime = new Date().toLocaleString()
    ElMessage.success('使用已结束，押金已退回')
  }).catch(() => {})
}

const showDetail = (row) => {
  currentUsage.value = row
  detailDialogVisible.value = true
}
</script>

<style scoped>
.locker-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.locker-item {
  padding: 10px;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.locker-item:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.locker-0 {
  background: #f0f9eb;
  border: 2px solid #67c23a;
}

.locker-1 {
  background: #fdf6ec;
  border: 2px solid #e6a23c;
}

.locker-2 {
  background: #f4f4f5;
  border: 2px solid #909399;
}

.locker-no {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 3px;
}

.locker-size {
  font-size: 12px;
  color: #909399;
}
</style>
