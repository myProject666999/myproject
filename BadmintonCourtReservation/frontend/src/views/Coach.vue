<template>
  <div class="coach-page">
    <el-card>
      <div slot="header" style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 18px; font-weight: bold;">教练课程</span>
        <el-button type="primary" v-if="isAdmin" @click="showCoachDialog">添加教练</el-button>
      </div>

      <div style="margin-bottom: 20px;">
        <el-select v-model="filter.sportType" placeholder="全部" style="width: 150px;" @change="loadData">
          <el-option label="全部" value=""></el-option>
          <el-option label="羽毛球" value="BADMINTON"></el-option>
          <el-option label="网球" value="TENNIS"></el-option>
        </el-select>
      </div>

      <el-row :gutter="20">
        <el-col :span="8" v-for="coach in coaches" :key="coach.id" style="margin-bottom: 20px;">
          <el-card class="coach-card" shadow="hover">
            <div style="text-align: center; margin-bottom: 15px;">
              <el-avatar :size="80" icon="el-icon-user"></el-avatar>
            </div>
            <div style="text-align: center; margin-bottom: 10px;">
              <h3 style="margin: 0;">{{ coach.name }}</h3>
              <el-tag :type="coach.sportType === 'BADMINTON' ? 'success' : 'warning'" size="small" style="margin-top: 5px;">
                {{ coach.sportType === 'BADMINTON' ? '羽毛球' : '网球' }}
              </el-tag>
            </div>
            <div style="margin-bottom: 10px;">
              <p><strong>级别：</strong>{{ coach.level }}</p>
              <p><strong>价格：</strong><span style="color: #f56c6c;">¥{{ coach.pricePerHour }}/小时</span></p>
              <p><strong>电话：</strong>{{ coach.phone }}</p>
              <p v-if="coach.description"><strong>简介：</strong>{{ coach.description }}</p>
            </div>
            <div style="text-align: center;">
              <el-button type="primary" size="small" @click="bookCourse(coach)">预约课程</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-empty v-if="coaches.length === 0" description="暂无教练"></el-empty>
    </el-card>

    <el-dialog title="添加教练" :visible.sync="coachDialogVisible" width="500px">
      <el-form :model="coachForm" label-width="80px">
        <el-form-item label="姓名">
          <el-input v-model="coachForm.name"></el-input>
        </el-form-item>
        <el-form-item label="运动类型">
          <el-select v-model="coachForm.sportType" style="width: 100%;">
            <el-option label="羽毛球" value="BADMINTON"></el-option>
            <el-option label="网球" value="TENNIS"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="级别">
          <el-input v-model="coachForm.level"></el-input>
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number v-model="coachForm.pricePerHour" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="coachForm.phone"></el-input>
        </el-form-item>
        <el-form-item label="简介">
          <el-input type="textarea" v-model="coachForm.description" :rows="3"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="coachDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCoach">确认</el-button>
      </span>
    </el-dialog>

    <el-dialog title="预约课程" :visible.sync="bookDialogVisible" width="500px">
      <el-form :model="bookForm" label-width="80px">
        <el-form-item label="教练">
          <span>{{ currentCoach ? currentCoach.name : '' }}</span>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="bookForm.date"
            type="date"
            style="width: 100%;"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOptions">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="时段">
          <el-select v-model="bookForm.timeSlot" placeholder="选择时段" style="width: 100%;">
            <el-option v-for="slot in timeSlots" :key="slot" :label="slot" :value="slot"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="费用">
          <span style="color: #f56c6c; font-weight: bold; font-size: 18px;">
            ¥{{ currentCoach ? currentCoach.pricePerHour : 0 }}
          </span>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="bookDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBooking">确认预约</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '../utils/request'

export default {
  name: 'Coach',
  data() {
    return {
      coaches: [],
      filter: {
        sportType: ''
      },
      coachDialogVisible: false,
      coachForm: {
        name: '',
        sportType: 'BADMINTON',
        level: '',
        pricePerHour: 0,
        phone: '',
        description: ''
      },
      bookDialogVisible: false,
      currentCoach: null,
      bookForm: {
        date: '',
        timeSlot: ''
      },
      timeSlots: [
        '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
        '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00',
        '16:00-17:00', '17:00-18:00', '18:00-19:00', '19:00-20:00',
        '20:00-21:00', '21:00-22:00'
      ],
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
    },
    isAdmin() {
      return this.userInfo.role === 'ADMIN'
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      try {
        const params = {}
        if (this.filter.sportType) {
          params.sportType = this.filter.sportType
        }
        this.coaches = await request.get('/coach/list', { params })
        this.coaches = this.coaches || []
      } catch (error) {
        console.error(error)
      }
    },
    showCoachDialog() {
      this.coachForm = {
        name: '',
        sportType: 'BADMINTON',
        level: '',
        pricePerHour: 0,
        phone: '',
        description: ''
      }
      this.coachDialogVisible = true
    },
    async submitCoach() {
      try {
        await request.post('/coach', this.coachForm)
        this.$message.success('添加成功')
        this.coachDialogVisible = false
        this.loadData()
      } catch (error) {
        console.error(error)
      }
    },
    bookCourse(coach) {
      this.currentCoach = coach
      this.bookForm = {
        date: '',
        timeSlot: ''
      }
      this.bookDialogVisible = true
    },
    async submitBooking() {
      if (!this.bookForm.date || !this.bookForm.timeSlot) {
        this.$message.warning('请选择日期和时段')
        return
      }
      try {
        await request.post('/coach/course', {
          coachId: this.currentCoach.id,
          userId: this.userInfo.id,
          ...this.bookForm
        })
        this.$message.success('预约成功')
        this.bookDialogVisible = false
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>

<style scoped>
.coach-page {
  padding: 20px;
}
.coach-card {
  height: 100%;
}
</style>