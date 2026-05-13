<template>
  <div class="my-reservations">
    <el-card>
      <div slot="header">
        <span style="font-size: 18px; font-weight: bold;">我的预约</span>
      </div>
      
      <el-table :data="reservations" style="width: 100%;">
        <el-table-column prop="date" label="日期" width="120"></el-table-column>
        <el-table-column prop="timeSlot" label="时段" width="120"></el-table-column>
        <el-table-column label="场地" width="150">
          <template slot-scope="scope">
            <span>{{ scope.row.courtName || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="费用" width="100">
          <template slot-scope="scope">
            <span style="color: #f56c6c;">¥{{ scope.row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column label="支付方式" width="100">
          <template slot-scope="scope">
            <el-tag :type="getPaymentTypeTag(scope.row.paymentType)">
              {{ getPaymentTypeLabel(scope.row.paymentType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusTag(scope.row.status)">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button v-if="scope.row.status === 0" type="text" @click="showQrCode(scope.row)">
              查看二维码
            </el-button>
            <el-button v-if="scope.row.status === 0" type="text" style="color: #f56c6c;" @click="cancelReservation(scope.row)">
              取消预约
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog title="入场二维码" :visible.sync="qrDialogVisible" width="300px">
        <div style="display: flex; justify-content: center; padding: 20px;">
          <div v-if="currentReservation">
            <canvas ref="qrcode"></canvas>
            <div style="text-align: center; margin-top: 10px;">
              <p>预约号: {{ currentReservation.id }}</p>
              <p>日期: {{ currentReservation.date }}</p>
              <p>时段: {{ currentReservation.timeSlot }}</p>
            </div>
          </div>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import request from '../utils/request'
import QRCode from 'qrcode'

export default {
  name: 'MyReservations',
  data() {
    return {
      reservations: [],
      qrDialogVisible: false,
      currentReservation: null
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo || {}
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      try {
        const data = await request.get('/reservation/list', {
          params: { userId: this.userInfo.id }
        })
        this.reservations = data || []
      } catch (error) {
        console.error(error)
      }
    },
    getPaymentTypeLabel(type) {
      const map = {
        'balance': '余额',
        'card': '会员卡',
        'cash': '现金'
      }
      return map[type] || type
    },
    getPaymentTypeTag(type) {
      const map = {
        'balance': 'primary',
        'card': 'success',
        'cash': 'warning'
      }
      return map[type] || 'info'
    },
    getStatusLabel(status) {
      const map = {
        0: '已预约',
        1: '已入场',
        2: '已取消',
        3: '已完成'
      }
      return map[status] || '未知'
    },
    getStatusTag(status) {
      const map = {
        0: 'warning',
        1: 'success',
        2: 'info',
        3: 'primary'
      }
      return map[status] || 'info'
    },
    async showQrCode(reservation) {
      this.currentReservation = reservation
      this.qrDialogVisible = true
      await this.$nextTick()
      if (this.$refs.qrcode) {
        await QRCode.toCanvas(this.$refs.qrcode, reservation.qrCode, {
          width: 200,
          margin: 1
        })
      }
    },
    async cancelReservation(reservation) {
      this.$confirm('确定要取消该预约吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await request.put(`/reservation/${reservation.id}/cancel`)
          this.$message.success('取消成功')
          this.loadData()
        } catch (error) {
          console.error(error)
        }
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.my-reservations {
  padding: 20px;
}
</style>