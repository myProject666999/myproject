<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>闸机管理</span>
          <div>
            <el-button type="success" @click="syncDevices">
              <el-icon><Refresh /></el-icon>
              设备同步
            </el-button>
            <el-button type="primary" @click="openAddDialog">
              <el-icon><Plus /></el-icon>
              新增闸机
            </el-button>
          </div>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="8" v-for="gate in gates" :key="gate.id">
          <el-card shadow="hover" class="gate-card">
            <div class="gate-header">
              <el-icon :size="40" :color="gate.status === 1 ? '#67c23a' : '#f56c6c'">
                <component :is="gate.type === '入口闸机' ? 'Switch' : 'TurnOff'" />
              </el-icon>
              <div class="gate-info">
                <div class="gate-name">{{ gate.name }}</div>
                <div class="gate-no">{{ gate.gateNo }}</div>
              </div>
            </div>
            <div class="gate-detail">
              <p><el-icon><Location /></el-icon> {{ gate.location }}</p>
              <p><el-icon><Menu /></el-icon> {{ gate.type }}</p>
              <p class="gate-status">
                <el-tag :type="gate.status === 1 ? 'success' : 'danger'" size="small">
                  {{ gate.status === 1 ? '正常运行' : '故障' }}
                </el-tag>
              </p>
            </div>
            <div class="gate-footer">
              <el-button type="primary" link @click="viewRecords(gate)">查看记录</el-button>
              <el-button type="warning" link @click="remoteOpen(gate)">远程开门</el-button>
              <el-button type="info" link @click="editGate(gate)">编辑</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-divider />

      <div class="card-header mb-20">
        <span>最近通行记录</span>
      </div>
      <el-table :data="accessLogs" border>
        <el-table-column prop="gateNo" label="闸机编号" width="120" />
        <el-table-column prop="gateName" label="闸机名称" />
        <el-table-column prop="ticketQrCode" label="门票二维码" width="160" />
        <el-table-column prop="accessType" label="通行类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.accessType === 1 ? 'success' : 'info'">
              {{ row.accessType === 1 ? '入园' : '出园' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="result" label="结果" width="100">
          <template #default="{ row }">
            <el-tag :type="row.result === 1 ? 'success' : 'danger'">
              {{ row.result === 1 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="accessTime" label="通行时间" width="160" />
        <el-table-column prop="failReason" label="失败原因" />
      </el-table>
    </el-card>

    <el-dialog v-model="addDialogVisible" :title="isEdit ? '编辑闸机' : '新增闸机'" width="500px">
      <el-form :model="gateForm" label-width="100px">
        <el-form-item label="闸机编号">
          <el-input v-model="gateForm.gateNo" placeholder="请输入闸机编号" />
        </el-form-item>
        <el-form-item label="闸机名称">
          <el-input v-model="gateForm.name" placeholder="请输入闸机名称" />
        </el-form-item>
        <el-form-item label="安装位置">
          <el-input v-model="gateForm.location" placeholder="请输入安装位置" />
        </el-form-item>
        <el-form-item label="闸机类型">
          <el-radio-group v-model="gateForm.type">
            <el-radio value="入口闸机">入口闸机</el-radio>
            <el-radio value="出口闸机">出口闸机</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="gateForm.status" :active-value="1" :inactive-value="0" active-text="正常" inactive-text="故障" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveGate">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="recordsDialogVisible" title="通行记录" width="700px">
      <div v-if="currentGate">
        <el-alert type="info" :closable="false" class="mb-20">
          闸机: {{ currentGate.name }} ({{ currentGate.gateNo }})
        </el-alert>
        <el-table :data="gateAccessLogs" border>
          <el-table-column prop="ticketQrCode" label="门票二维码" />
          <el-table-column prop="accessType" label="通行类型" width="100">
            <template #default="{ row }">
              <el-tag :type="row.accessType === 1 ? 'success' : 'info'">
                {{ row.accessType === 1 ? '入园' : '出园' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="result" label="结果" width="100">
            <template #default="{ row }">
              <el-tag :type="row.result === 1 ? 'success' : 'danger'">
                {{ row.result === 1 ? '成功' : '失败' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="accessTime" label="通行时间" />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const addDialogVisible = ref(false)
const recordsDialogVisible = ref(false)
const isEdit = ref(false)
const currentGate = ref(null)

const gates = ref([
  { id: 1, gateNo: 'G001', name: '主入口1号闸机', location: '滑雪场主入口左侧', type: '入口闸机', status: 1 },
  { id: 2, gateNo: 'G002', name: '主入口2号闸机', location: '滑雪场主入口右侧', type: '入口闸机', status: 1 },
  { id: 3, gateNo: 'G003', name: 'VIP入口闸机', location: 'VIP通道入口', type: '入口闸机', status: 0 },
  { id: 4, gateNo: 'G004', name: '出口1号闸机', location: '滑雪场出口左侧', type: '出口闸机', status: 1 },
  { id: 5, gateNo: 'G005', name: '出口2号闸机', location: '滑雪场出口右侧', type: '出口闸机', status: 1 }
])

const accessLogs = ref([
  { gateNo: 'G001', gateName: '主入口1号闸机', ticketQrCode: 'TK202405140001', accessType: 1, result: 1, accessTime: '2024-05-14 10:30:25', failReason: null },
  { gateNo: 'G001', gateName: '主入口1号闸机', ticketQrCode: 'TK202405140002', accessType: 1, result: 1, accessTime: '2024-05-14 10:32:18', failReason: null },
  { gateNo: 'G002', gateName: '主入口2号闸机', ticketQrCode: 'TK202405140003', accessType: 1, result: 0, accessTime: '2024-05-14 10:35:00', failReason: '门票已过期' },
  { gateNo: 'G004', gateName: '出口1号闸机', ticketQrCode: 'TK202405140004', accessType: 2, result: 1, accessTime: '2024-05-14 15:45:30', failReason: null },
  { gateNo: 'G001', gateName: '主入口1号闸机', ticketQrCode: 'TK202405140005', accessType: 1, result: 1, accessTime: '2024-05-14 11:00:12', failReason: null }
])

const gateForm = reactive({
  id: null,
  gateNo: '',
  name: '',
  location: '',
  type: '入口闸机',
  status: 1
})

const gateAccessLogs = computed(() => {
  if (!currentGate.value) return []
  return accessLogs.value.filter(log => log.gateNo === currentGate.value.gateNo)
})

const openAddDialog = () => {
  isEdit.value = false
  Object.assign(gateForm, {
    id: null,
    gateNo: '',
    name: '',
    location: '',
    type: '入口闸机',
    status: 1
  })
  addDialogVisible.value = true
}

const editGate = (gate) => {
  isEdit.value = true
  Object.assign(gateForm, gate)
  addDialogVisible.value = true
}

const saveGate = () => {
  if (!gateForm.gateNo) {
    ElMessage.warning('请输入闸机编号！')
    return
  }
  if (!gateForm.name) {
    ElMessage.warning('请输入闸机名称！')
    return
  }

  if (isEdit.value) {
    const index = gates.value.findIndex(g => g.id === gateForm.id)
    if (index > -1) {
      gates.value[index] = { ...gateForm }
    }
    ElMessage.success('编辑成功')
  } else {
    gates.value.unshift({
      ...gateForm,
      id: Date.now()
    })
    ElMessage.success('新增成功')
  }
  addDialogVisible.value = false
}

const syncDevices = () => {
  ElMessage.success('设备同步中...')
  setTimeout(() => {
    ElMessage.success('设备同步成功！共同步 5 台闸机')
  }, 1000)
}

const viewRecords = (gate) => {
  currentGate.value = gate
  recordsDialogVisible.value = true
}

const remoteOpen = (gate) => {
  ElMessageBox.confirm(`确定要远程开门"${gate.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success(`${gate.name} 已远程开门`)
  }).catch(() => {})
}
</script>

<style scoped>
.gate-card {
  margin-bottom: 20px;
}

.gate-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.gate-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 3px;
}

.gate-no {
  font-size: 12px;
  color: #909399;
}

.gate-detail {
  font-size: 14px;
  color: #606266;
}

.gate-detail p {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 8px;
}

.gate-footer {
  margin-top: 15px;
  border-top: 1px solid #ebeef5;
  padding-top: 15px;
  display: flex;
  justify-content: flex-end;
  gap: 5px;
}
</style>
