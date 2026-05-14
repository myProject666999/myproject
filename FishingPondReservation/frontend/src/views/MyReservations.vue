<template>
  <div class="reservations-page">
    <el-card>
      <div slot="header">
        <span style="font-size: 18px; font-weight: bold;">我的预订</span>
      </div>

      <el-table :data="reservations" border>
        <el-table-column prop="pondId" label="塘位ID" width="100"></el-table-column>
        <el-table-column prop="reservationDate" label="预订日期" width="150"></el-table-column>
        <el-table-column prop="price" label="费用" width="120">
          <template slot-scope="scope">
            ¥{{ scope.row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="paymentType" label="支付方式" width="120">
          <template slot-scope="scope">
            {{ scope.row.paymentType === 'cash' ? '现金' : '余额' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="qrCode" label="预订码" width="200"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button 
              v-if="scope.row.status === 0" 
              type="danger" 
              size="small" 
              @click="cancelReservation(scope.row.id)">
              取消预订
            </el-button>
            <el-tag v-else type="info" size="small">已处理</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <el-empty description="暂无预订记录" v-if="reservations.length === 0"></el-empty>
    </el-card>
  </div>
</template>

<script>
import request from '../utils/request'

export default {
  name: 'MyReservations',
  data() {
    return {
      reservations: []
    }
  },
  computed: {
    user() {
      return this.$store.state.user || {}
    }
  },
  mounted() {
    this.loadReservations()
  },
  methods: {
    async loadReservations() {
      try {
        const res = await request.get('/reservation/list', {
          params: { userId: this.user.id }
        })
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
        '2': 'danger'
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
    async cancelReservation(id) {
      this.$confirm('确定要取消该预订吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await request.delete('/reservation/' + id)
          this.$message.success('已取消预订')
          this.loadReservations()
        } catch (error) {
          console.error(error)
        }
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.reservations-page {
  padding: 10px;
}
</style>
