
<template>
  <div class="booking">
    <el-header>
      <div class="header-content">
        <div class="logo" @click="goHome">🎤 KTV包厢预订与点歌系统</div>
      </div>
    </el-header>
    
    <el-main>
      <h2>包厢预订</h2>
      <el-card class="booking-card">
        <el-form :model="bookingForm" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="包厢类型">
                <el-select v-model="bookingForm.roomType" placeholder="请选择包厢类型">
                  <el-option label="小包 (1-4人)" value="1"></el-option>
                  <el-option label="中包 (5-8人)" value="2"></el-option>
                  <el-option label="大包 (9-12人)" value="3"></el-option>
                  <el-option label="VIP包 (15-20人)" value="4"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="预订日期">
                <el-date-picker
                  v-model="bookingForm.bookingDate"
                  type="date"
                  placeholder="选择日期"
                  :disabled-date="disabledDate">
                </el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="时段">
                <el-select v-model="bookingForm.timeSlot" placeholder="请选择时段">
                  <el-option label="早场 (08:00-12:00)" value="1"></el-option>
                  <el-option label="午场 (12:00-18:00)" value="2"></el-option>
                  <el-option label="晚场 (18:00-23:00)" value="3"></el-option>
                  <el-option label="夜场 (23:00-06:00)" value="4"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="预订时长">
                <el-select v-model="bookingForm.hours" placeholder="请选择时长">
                  <el-option label="1小时" :value="1"></el-option>
                  <el-option label="2小时" :value="2"></el-option>
                  <el-option label="3小时" :value="3"></el-option>
                  <el-option label="4小时" :value="4"></el-option>
                  <el-option label="包场" :value="5"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="联系电话">
            <el-input v-model="bookingForm.phone" placeholder="请输入联系电话"></el-input>
          </el-form-item>
          <el-form-item label="备注">
            <el-input type="textarea" v-model="bookingForm.remark" placeholder="备注信息（可选）"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="large" @click="submitBooking">提交预订</el-button>
            <el-button size="large" @click="goHome">返回首页</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </el-main>
  </div>
</template>

<script>
export default {
  name: 'Booking',
  data() {
    return {
      bookingForm: {
        roomType: '',
        bookingDate: '',
        timeSlot: '',
        hours: 2,
        phone: '',
        remark: ''
      }
    }
  },
  methods: {
    disabledDate(time) {
      return time.getTime() < Date.now() - 8.64e7
    },
    submitBooking() {
      if (!this.bookingForm.roomType || !this.bookingForm.bookingDate || !this.bookingForm.timeSlot) {
        this.$message.warning('请填写完整的预订信息')
        return
      }
      if (!this.bookingForm.phone) {
        this.$message.warning('请输入联系电话')
        return
      }
      this.$message.success('预订提交成功！请等待确认。')
    },
    goHome() {
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.booking {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.el-header {
  background-color: #409EFF;
  color: white;
  padding: 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
}

.el-main {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 40px 20px;
}

h2 {
  margin-bottom: 20px;
  color: #303133;
}

.booking-card {
  padding: 20px;
}
</style>
