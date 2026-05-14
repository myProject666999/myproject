<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>储物柜管理</span>
          <el-button type="primary">分配储物柜</el-button>
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
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('status')

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
  { lockerNo: 'A002', area: 'A区', customerName: '张三', phone: '13800000001', startTime: '2024-05-14 09:30:00', endTime: null, status: 1 },
  { lockerNo: 'A004', area: 'A区', customerName: '李四', phone: '13800000002', startTime: '2024-05-14 10:15:00', endTime: null, status: 1 },
  { lockerNo: 'B001', area: 'B区', customerName: '王五', phone: '13800000003', startTime: '2024-05-14 08:45:00', endTime: '2024-05-14 15:30:00', status: 2 },
  { lockerNo: 'C002', area: 'C区', customerName: '赵六', phone: '13800000004', startTime: '2024-05-14 11:00:00', endTime: null, status: 1 }
])

const getLockersByArea = (areaId) => {
  return lockers.value.filter(l => l.areaId === areaId)
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
