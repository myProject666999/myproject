<template>
  <div class="reservation-page">
    <el-card>
      <div slot="header">
        <span style="font-size: 18px; font-weight: bold;">在线预约</span>
      </div>
      
      <div style="margin-bottom: 20px; display: flex; gap: 20px; align-items: center;">
        <el-form :inline="true">
          <el-form-item label="场地类型">
            <el-select v-model="courtType" placeholder="全部" style="width: 150px;" @change="loadData">
              <el-option label="全部" value=""></el-option>
              <el-option label="羽毛球" value="BADMINTON"></el-option>
              <el-option label="网球" value="TENNIS"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="预约日期">
            <el-date-picker
              v-model="selectedDate"
              type="date"
              placeholder="选择日期"
              :picker-options="pickerOptions"
              value-format="yyyy-MM-dd"
              @change="loadData">
            </el-date-picker>
          </el-form-item>
        </el-form>
      </div>

      <div v-for="courtData in courtsData" :key="courtData.court.id" style="margin-bottom: 30px;">
        <el-card style="background: #f5f7fa;">
          <div slot="header" style="display: flex; justify-content: space-between; align-items: center;">
            <span>
              <el-tag :type="courtData.court.type === 'BADMINTON' ? 'success' : 'warning'">
                {{ courtData.court.type === 'BADMINTON' ? '羽毛球' : '网球' }}
              </el-tag>
              <span style="margin-left: 10px; font-weight: bold;">{{ courtData.court.name }} ({{ courtData.court.courtNo }})</span>
            </span>
            <span style="color: #409EFF; font-weight: bold;">¥{{ courtData.court.price }}/小时</span>
          </div>
          
          <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            <div
              v-for="slot in courtData.slots"
              :key="slot.timeSlot"
              class="time-slot"
              :class="{
                'available': slot.status === 'available',
                'booked': slot.status === 'booked',
                'selected': isSelected(courtData.court.id, slot.timeSlot)
              }"
              @click="selectSlot(courtData.court, slot)">
              {{ slot.timeSlot }}
            </div>
          </div>
        </el-card>
      </div>

      <el-dialog
        title="确认预约"
        :visible.sync="dialogVisible"
        width="500px">
        <el-form :model="reservationForm" label-width="100px">
          <el-form-item label="场地">
            <span>{{ selectedCourt ? selectedCourt.name : '' }}</span>
          </el-form-item>
          <el-form-item label="日期">
            <span>{{ selectedDate }}</span>
          </el-form-item>
          <el-form-item label="时段">
            <span>{{ selectedSlot ? selectedSlot.timeSlot : '' }}</span>
          </el-form-item>
          <el-form-item label="费用">
            <span style="color: #f56c6c; font-weight: bold; font-size: 18px;">¥{{ selectedCourt ? selectedCourt.price : 0 }}</span>
          </el-form-item>
          <el-form-item label="支付方式">
            <el-radio-group v-model="reservationForm.paymentType">
              <el-radio value="balance">余额支付 (¥{{ userInfo.balance || 0 }})</el-radio>
              <el-radio value="card">会员卡</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="reservationForm.paymentType === 'card'" label="选择卡片">
            <el-select v-model="reservationForm.cardId" placeholder="请选择会员卡" style="width: 100%;">
              <el-option
                v-for="card in userCards"
                :key="card.id"
                :label="getCardLabel(card)"
                :value="card.id">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitReservation" :loading="submitting">确认预约</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import request from '../utils/request'

export default {
  name: 'Reservation',
  data() {
    return {
      courtType: '',
      selectedDate: new Date().toISOString().split('T')[0],
      courtsData: [],
      dialogVisible: false,
      selectedCourt: null,
      selectedSlot: null,
      reservationForm: {
        paymentType: 'balance',
        cardId: null
      },
      submitting: false,
      userCards: [],
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7
        }
      }
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo || {}
    }
  },
  mounted() {
    this.loadData()
    this.loadUserCards()
  },
  methods: {
    async loadData() {
      try {
        const params = { date: this.selectedDate }
        if (this.courtType) {
          params.courtType = this.courtType
        }
        this.courtsData = await request.get('/reservation/slots', { params })
        if (this.courtsData && this.courtsData.courts) {
          this.courtsData = this.courtsData.courts
        } else {
          this.courtsData = []
        }
      } catch (error) {
        console.error(error)
      }
    },
    async loadUserCards() {
      try {
        if (this.userInfo.id) {
          this.userCards = await request.get('/card/list', { params: { userId: this.userInfo.id } })
        }
      } catch (error) {
        console.error(error)
      }
    },
    isSelected(courtId, timeSlot) {
      return this.selectedCourt && this.selectedCourt.id === courtId &&
             this.selectedSlot && this.selectedSlot.timeSlot === timeSlot
    },
    selectSlot(court, slot) {
      if (slot.status === 'booked') {
        this.$message.warning('该时段已被预约')
        return
      }
      this.selectedCourt = court
      this.selectedSlot = slot
      this.reservationForm.cardId = null
      this.dialogVisible = true
    },
    getCardLabel(card) {
      if (card.cardType === 'MONTHLY') {
        return `月卡 - 剩余${card.remainingTimes}次 (有效期至: ${card.expireDate})`
      } else {
        return `储值卡 - 余额¥${card.balance}`
      }
    },
    async submitReservation() {
      if (this.reservationForm.paymentType === 'card' && !this.reservationForm.cardId) {
        this.$message.warning('请选择会员卡')
        return
      }
      this.submitting = true
      try {
        await request.post('/reservation', {
          userId: this.userInfo.id,
          courtId: this.selectedCourt.id,
          date: this.selectedDate,
          timeSlot: this.selectedSlot.timeSlot,
          paymentType: this.reservationForm.paymentType,
          cardId: this.reservationForm.cardId
        })
        this.$message.success('预约成功！')
        this.dialogVisible = false
        this.loadData()
      } catch (error) {
        console.error(error)
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.reservation-page {
  padding: 20px;
}
.time-slot {
  padding: 8px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}
.time-slot.available {
  background: #fff;
  color: #606266;
}
.time-slot.available:hover {
  border-color: #409EFF;
  color: #409EFF;
}
.time-slot.booked {
  background: #f5f7fa;
  color: #c0c4cc;
  cursor: not-allowed;
}
.time-slot.selected {
  background: #409EFF;
  color: #fff;
  border-color: #409EFF;
}
</style>