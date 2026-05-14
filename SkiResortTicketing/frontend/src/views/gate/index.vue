<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>闸机管理</span>
          <div>
            <el-button type="success">设备同步</el-button>
            <el-button type="primary">新增闸机</el-button>
          </div>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="8" v-for="gate in gates" :key="gate.id">
          <el-card shadow="hover" class="gate-card">
            <div class="gate-header">
              <el-icon :size="40" :color="gate.status === 1 ? '#67c23a' : '#f56c6c'">
                <component :is="gate.type === 'Entry' ? 'Switch' : 'TurnOff'" />
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
              <el-button type="primary" link>查看记录</el-button>
              <el-button type="warning" link>远程开门</el-button>
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
        <el-table-column prop="failReason" label="失败原因" v-if="accessLogs.some(l => l.failReason)" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const gates = ref([
  { id: 1, gateNo: 'G001', name: '主入口1号闸机', location: '滑雪场主入口左侧', type: 'Entry', status: 1 },
  { id: 2, gateNo: 'G002', name: '主入口2号闸机', location: '滑雪场主入口右侧', type: 'Entry', status: 1 },
  { id: 3, gateNo: 'G003', name: 'VIP入口闸机', location: 'VIP通道入口', type: 'Entry', status: 0 },
  { id: 4, gateNo: 'G004', name: '出口1号闸机', location: '滑雪场出口左侧', type: 'Exit', status: 1 },
  { id: 5, gateNo: 'G005', name: '出口2号闸机', location: '滑雪场出口右侧', type: 'Exit', status: 1 }
])

const accessLogs = ref([
  { gateNo: 'G001', gateName: '主入口1号闸机', ticketQrCode: 'TK202405140001', accessType: 1, result: 1, accessTime: '2024-05-14 10:30:25', failReason: null },
  { gateNo: 'G001', gateName: '主入口1号闸机', ticketQrCode: 'TK202405140002', accessType: 1, result: 1, accessTime: '2024-05-14 10:32:18', failReason: null },
  { gateNo: 'G002', gateName: '主入口2号闸机', ticketQrCode: 'TK202405140003', accessType: 1, result: 0, accessTime: '2024-05-14 10:35:00', failReason: '门票已过期' },
  { gateNo: 'G004', gateName: '出口1号闸机', ticketQrCode: 'TK202405140004', accessType: 2, result: 1, accessTime: '2024-05-14 15:45:30', failReason: null },
  { gateNo: 'G001', gateName: '主入口1号闸机', ticketQrCode: 'TK202405140005', accessType: 1, result: 1, accessTime: '2024-05-14 11:00:12', failReason: null }
])
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
  gap: 10px;
}
</style>
