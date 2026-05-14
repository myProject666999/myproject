<template>
  <div class="ponds-page">
    <el-card>
      <div slot="header">
        <span style="font-size: 18px; font-weight: bold;">🎣 塘位预订</span>
      </div>

      <div style="margin-bottom: 20px;">
        <el-form :inline="true">
          <el-form-item label="塘位类型">
            <el-select v-model="pondType" placeholder="全部" style="width: 150px;">
              <el-option label="全部" value=""></el-option>
              <el-option label="综合塘" value="综合塘"></el-option>
              <el-option label="鲫鱼塘" value="鲫鱼塘"></el-option>
              <el-option label="鲤鱼塘" value="鲤鱼塘"></el-option>
              <el-option label="青鱼塘" value="青鱼塘"></el-option>
              <el-option label="竞技塘" value="竞技塘"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <el-row :gutter="20">
        <el-col :span="8" v-for="pond in filteredPonds" :key="pond.id" style="margin-bottom: 20px;">
          <el-card class="pond-card" shadow="hover">
            <div class="pond-header">
              <el-tag :type="getPondTagType(pond.type)" size="small">{{ pond.type }}</el-tag>
              <span class="pond-no">{{ pond.pondNo }}</span>
            </div>
            <h3 class="pond-name">{{ pond.name }}</h3>
            <p class="pond-desc">{{ pond.description }}</p>
            <div class="pond-footer">
              <span class="price">¥{{ pond.pricePerDay }}/天</span>
              <span class="capacity">可容纳 {{ pond.capacity }} 人</span>
            </div>
            <el-button 
              type="primary" 
              style="width: 100%; margin-top: 15px;"
              @click="openReservation(pond)">
              立即预订
            </el-button>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <el-dialog
      title="预订塘位"
      :visible.sync="dialogVisible"
      width="500px">
      <el-form :model="reservationForm" label-width="100px">
        <el-form-item label="塘位">
          <span>{{ selectedPond ? selectedPond.name : '' }}</span>
        </el-form-item>
        <el-form-item label="预订日期">
          <el-date-picker
            v-model="reservationForm.reservationDate"
            type="date"
            placeholder="选择日期"
            :picker-options="pickerOptions"
            value-format="yyyy-MM-dd"
            style="width: 100%;">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="费用">
          <span style="color: #f56c6c; font-weight: bold; font-size: 20px;">
            ¥{{ selectedPond ? selectedPond.pricePerDay : 0 }}
          </span>
        </el-form-item>
        <el-form-item label="支付方式">
          <el-radio-group v-model="reservationForm.paymentType">
            <el-radio value="cash">现金支付</el-radio>
            <el-radio value="balance">余额支付</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReservation" :loading="submitting">确认预订</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '../utils/request'

export default {
  name: 'Ponds',
  data() {
    return {
      pondType: '',
      ponds: [],
      selectedPond: null,
      dialogVisible: false,
      reservationForm: {
        reservationDate: new Date().toISOString().split('T')[0],
        paymentType: 'cash'
      },
      submitting: false,
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7
        }
      }
    }
  },
  computed: {
    filteredPonds() {
      if (!this.pondType) return this.ponds
      return this.ponds.filter(p => p.type === this.pondType)
    },
    user() {
      return this.$store.state.user || {}
    }
  },
  mounted() {
    this.loadPonds()
  },
  methods: {
    async loadPonds() {
      try {
        const res = await request.get('/pond/list')
        this.ponds = res.data
      } catch (error) {
        console.error(error)
      }
    },
    getPondTagType(type) {
      const types = {
        '综合塘': 'primary',
        '鲫鱼塘': 'success',
        '鲤鱼塘': 'warning',
        '青鱼塘': 'danger',
        '竞技塘': 'info'
      }
      return types[type] || 'primary'
    },
    openReservation(pond) {
      this.selectedPond = pond
      this.reservationForm.reservationDate = new Date().toISOString().split('T')[0]
      this.dialogVisible = true
    },
    async submitReservation() {
      if (!this.reservationForm.reservationDate) {
        this.$message.warning('请选择预订日期')
        return
      }

      try {
        const available = await request.get('/reservation/check', {
          params: {
            pondId: this.selectedPond.id,
            date: this.reservationForm.reservationDate
          }
        })

        if (!available.data) {
          this.$message.warning('该日期塘位已被预订，请选择其他日期')
          return
        }
      } catch (error) {
        console.error(error)
      }

      this.submitting = true
      try {
        await request.post('/reservation', {
          userId: this.user.id,
          pondId: this.selectedPond.id,
          reservationDate: this.reservationForm.reservationDate,
          price: this.selectedPond.pricePerDay,
          paymentType: this.reservationForm.paymentType
        })
        this.$message.success('预订成功！')
        this.dialogVisible = false
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
.ponds-page {
  padding: 10px;
}
.pond-card {
  transition: all 0.3s;
}
.pond-card:hover {
  transform: translateY(-5px);
}
.pond-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.pond-no {
  color: #909399;
  font-size: 14px;
}
.pond-name {
  margin: 10px 0;
  color: #303133;
}
.pond-desc {
  color: #606266;
  font-size: 14px;
  margin-bottom: 15px;
  min-height: 40px;
}
.pond-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.price {
  color: #f56c6c;
  font-weight: bold;
  font-size: 18px;
}
.capacity {
  color: #909399;
  font-size: 14px;
}
</style>
