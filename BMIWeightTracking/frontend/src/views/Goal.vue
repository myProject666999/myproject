<template>
  <div class="goal-page">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <div slot="header" class="card-header"><span>🎯 目标体重设置</span></div>
          <el-form label-width="100px">
            <el-form-item label="目标体重(kg)">
              <el-input-number v-model="form.targetWeight" :min="30" :max="200" :step="0.1" :precision="1"></el-input-number>
            </el-form-item>
            <el-form-item label="目标日期">
              <el-date-picker v-model="form.targetDate" type="date" value-format="yyyy-MM-dd" placeholder="选填"></el-date-picker>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveGoal">保存目标</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div slot="header" class="card-header"><span>📊 目标进度</span></div>
          <div v-if="progress.goal">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="目标体重">{{ progress.goal.targetWeight }} kg</el-descriptions-item>
              <el-descriptions-item label="目标日期">{{ progress.goal.targetDate || '未设定' }}</el-descriptions-item>
              <el-descriptions-item label="起始体重">{{ progress.startWeight }} kg</el-descriptions-item>
              <el-descriptions-item label="当前体重">{{ progress.currentWeight }} kg</el-descriptions-item>
              <el-descriptions-item label="距目标">{{ progress.diffToGoal > 0 ? '还有 ' + progress.diffToGoal + ' kg' : '已达成目标!' }}</el-descriptions-item>
              <el-descriptions-item label="剩余天数">{{ progress.daysLeft != null ? progress.daysLeft + ' 天' : '未设定' }}</el-descriptions-item>
            </el-descriptions>
            <div class="progress-bar" style="margin-top:20px">
              <div class="progress-label">进度: {{ progressPercent }}%</div>
              <el-progress :percentage="progressPercent" :status="progressStatus"></el-progress>
            </div>
          </div>
          <el-empty v-else description="请先设置目标和录入体重"></el-empty>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { setGoal, getGoal, getGoalProgress } from '../api'

export default {
  data() {
    return {
      form: { targetWeight: 60, targetDate: '' },
      progress: {}
    }
  },
  computed: {
    progressPercent() {
      if (this.progress.progressPercent != null) {
        return Math.min(100, Math.round(this.progress.progressPercent))
      }
      return 0
    },
    progressStatus() {
      if (this.progressPercent >= 100) return 'success'
      if (this.progressPercent >= 50) return ''
      return 'warning'
    }
  },
  async created() {
    await this.loadGoal()
    await this.loadProgress()
  },
  methods: {
    async loadGoal() {
      const res = await getGoal()
      if (res.data) {
        this.form.targetWeight = parseFloat(res.data.targetWeight)
        this.form.targetDate = res.data.targetDate
      }
    },
    async loadProgress() {
      const res = await getGoalProgress()
      this.progress = res.data || {}
    },
    async saveGoal() {
      await setGoal(this.form.targetWeight, this.form.targetDate)
      this.$message.success('目标已保存')
      this.loadProgress()
    }
  }
}
</script>

<style scoped>
.goal-page { max-width: 1100px; margin: 0 auto; }
.card-header { font-weight: bold; }
.progress-label { margin-bottom: 8px; color: #606266; font-weight: bold; }
</style>
