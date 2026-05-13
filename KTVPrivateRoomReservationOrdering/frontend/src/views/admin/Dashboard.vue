
<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #409EFF;">🏠</div>
            <div class="stat-info">
              <div class="stat-value">{{ roomStats.total }}</div>
              <div class="stat-label">包厢总数</div>
            </div>
          </div>
          <div class="stat-detail">
            可用: {{ roomStats.available }} | 使用中: {{ roomStats.occupied }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #67C23A;">📅</div>
            <div class="stat-info">
              <div class="stat-value">{{ bookingStats.today }}</div>
              <div class="stat-label">今日预订</div>
            </div>
          </div>
          <div class="stat-detail">
            待确认: {{ bookingStats.pending }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #E6A23C;">💰</div>
            <div class="stat-info">
              <div class="stat-value">¥{{ revenueStats.today }}</div>
              <div class="stat-label">今日营收</div>
            </div>
          </div>
          <div class="stat-detail">
            本月累计: ¥{{ revenueStats.month }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #F56C6C;">👥</div>
            <div class="stat-info">
              <div class="stat-value">{{ userStats.members }}</div>
              <div class="stat-label">会员总数</div>
            </div>
          </div>
          <div class="stat-detail">
            今日新增: {{ userStats.todayNew }}
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="16">
        <el-card>
          <div slot="header">
            <span>最近预订记录</span>
          </div>
          <el-table :data="recentBookings" style="width: 100%">
            <el-table-column prop="bookingNo" label="预订编号" width="150"></el-table-column>
            <el-table-column prop="roomNo" label="包厢号" width="100"></el-table-column>
            <el-table-column prop="customer" label="客户" width="100"></el-table-column>
            <el-table-column prop="date" label="预订日期" width="120"></el-table-column>
            <el-table-column prop="time" label="时段" width="100"></el-table-column>
            <el-table-column prop="amount" label="金额" width="100"></el-table-column>
            <el-table-column label="状态" width="100">
              <template slot-scope="scope">
                <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <div slot="header">
            <span>包厢使用情况</span>
          </div>
          <div class="room-status">
            <div class="room-item" v-for="room in rooms" :key="room.id">
              <div class="room-no">{{ room.no }}</div>
              <div class="room-type">{{ room.type }}</div>
              <div class="room-status-badge" :class="'status-' + room.status">
                {{ getStatusText(room.status) }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    return {
      roomStats: {
        total: 18,
        available: 15,
        occupied: 3
      },
      bookingStats: {
        today: 12,
        pending: 3
      },
      revenueStats: {
        today: 5680,
        month: 156800
      },
      userStats: {
        members: 256,
        todayNew: 5
      },
      recentBookings: [
        { bookingNo: 'BK20240115001', roomNo: '201', customer: '张三', date: '2024-01-15', time: '晚场', amount: 360, status: '已确认' },
        { bookingNo: 'BK20240115002', roomNo: '103', customer: '李四', date: '2024-01-15', time: '午场', amount: 150, status: '待确认' },
        { bookingNo: 'BK20240115003', roomNo: '301', customer: '王五', date: '2024-01-15', time: '晚场', amount: 540, status: '已入住' },
        { bookingNo: 'BK20240115004', roomNo: '501', customer: '赵六', date: '2024-01-15', time: '夜场', amount: 880, status: '已完成' },
        { bookingNo: 'BK20240115005', roomNo: '203', customer: '孙七', date: '2024-01-15', time: '晚场', amount: 360, status: '已确认' }
      ],
      rooms: [
        { id: 1, no: '101', type: '小包', status: 'available' },
        { id: 2, no: '102', type: '小包', status: 'available' },
        { id: 3, no: '103', type: '小包', status: 'occupied' },
        { id: 4, no: '201', type: '中包', status: 'occupied' },
        { id: 5, no: '202', type: '中包', status: 'available' },
        { id: 6, no: '203', type: '中包', status: 'available' },
        { id: 7, no: '301', type: '大包', status: 'occupied' },
        { id: 8, no: '302', type: '大包', status: 'available' },
        { id: 9, no: '501', type: 'VIP', status: 'available' },
        { id: 10, no: '502', type: 'VIP', status: 'maintenance' }
      ]
    }
  },
  methods: {
    getStatusType(status) {
      const typeMap = {
        '待确认': 'warning',
        '已确认': 'primary',
        '已入住': 'success',
        '已完成': 'info',
        '已取消': 'danger'
      }
      return typeMap[status] || 'info'
    },
    getStatusText(status) {
      const textMap = {
        'available': '可用',
        'occupied': '使用中',
        'maintenance': '维护'
      }
      return textMap[status] || status
    }
  }
}
</script>

<style scoped>
.dashboard {
  min-height: 100%;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
  margin-right: 15px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.stat-detail {
  font-size: 12px;
  color: #909399;
  padding-top: 10px;
  border-top: 1px solid #EBEEF5;
}

.room-status {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.room-item {
  border: 1px solid #EBEEF5;
  border-radius: 4px;
  padding: 10px;
  text-align: center;
}

.room-no {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.room-type {
  font-size: 12px;
  color: #909399;
  margin: 5px 0;
}

.room-status-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
}

.status-available {
  background-color: #f0f9eb;
  color: #67C23A;
}

.status-occupied {
  background-color: #fef0f0;
  color: #F56C6C;
}

.status-maintenance {
  background-color: #fdf6ec;
  color: #E6A23C;
}
</style>
