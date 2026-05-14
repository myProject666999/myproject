<template>
  <div class="reservations-admin">
    <el-card>
      <div slot="header">
        <span style="font-weight: bold;">预订管理</span>
      </div>

      <el-table :data="reservations" border>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="userId" label="用户ID" width="100"></el-table-column>
        <el-table-column prop="pondId" label="塘位ID" width="100"></el-table-column>
        <el-table-column prop="reservationDate" label="预订日期" width="150"></el-table-column>
        <el-table-column prop="price" label="费用" width="100">
          <template slot-scope="scope">
            <span style="color: #f56c6c; font-weight: bold;">¥{{ scope.row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="qrCode" label="预订码" width="200"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button 
              v-if="scope.row.status === 0" 
              type="success" 
              size="small" 
              @click="updateStatus(scope.row.id, 1)">
              确认
            </el-button>
            <el-button 
              v-if="scope.row.status === 1" 
              type="primary" 
              size="small" 
              @click="updateStatus(scope.row.id, 2)">
              完成
            </el-button>
            <el-button 
              v-if="scope.row.status === 0 || scope.row.status === 1"
              type="danger" 
              size="small" 
              @click="updateStatus(scope.row.id, -1)">
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import request from '../../utils/request'

export default {
  name: 'ReservationsAdmin',
  data() {
    return {
      reservations: []
    }
  },
  mounted() {
    this.loadReservations()
  },
  methods: {
    async loadReservations() {
      try {
        const res = await request.get('/reservation/list')
        this.reservations = res.data
      } catch (error) {
        console.error(error)
      }
    },
    getStatusType(status) {
      const types = {
        '-1': 'info',
        '0': 'warning',
        '1': 'success',
        '2': 'primary'
      }
      return types[status] || 'info'
    },
    getStatusText(status) {
      const texts = {
        '-1': '已取消',
        '0': '待确认',
        '1': '已确认',
        '2': '已完成'
      }
      return texts[status] || '未知'
    },
    async updateStatus(id, status) {
      try {
        await request.put('/reservation/' + id + '/status', null, { params: { status } })
        this.$message.success('状态更新成功')
        this.loadReservations()
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>

<style scoped>
.reservations-admin {
  padding: 10px;
}
</style>
