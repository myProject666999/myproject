<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon patient">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.patients }}</div>
              <div class="stat-label">患者总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon appointment">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.todayAppointments }}</div>
              <div class="stat-label">今日预约</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon treatment">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.treatmentPlans }}</div>
              <div class="stat-label">治疗计划</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon reminder">
              <el-icon><Bell /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.reminders }}</div>
              <div class="stat-label">待处理提醒</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="primary" @click="$router.push('/patients')">
              <el-icon><Plus /></el-icon> 新增患者
            </el-button>
            <el-button type="success" @click="$router.push('/appointments')">
              <el-icon><CalendarPlus /></el-icon> 新建预约
            </el-button>
            <el-button type="warning" @click="$router.push('/schedules')">
              <el-icon><Clock /></el-icon> 排班设置
            </el-button>
            <el-button type="info" @click="$router.push('/medical-images')">
              <el-icon><Upload /></el-icon> 上传影像
            </el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>系统功能</span>
            </div>
          </template>
          <div class="features">
            <div class="feature-item">
              <el-icon><DataLine /></el-icon>
              <span>牙位图(FDI编号)</span>
            </div>
            <div class="feature-item">
              <el-icon><Picture /></el-icon>
              <span>影像X光片管理</span>
            </div>
            <div class="feature-item">
              <el-icon><Money /></el-icon>
              <span>分期结算</span>
            </div>
            <div class="feature-item">
              <el-icon><Bell /></el-icon>
              <span>复诊提醒</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const stats = reactive({
  patients: 0,
  todayAppointments: 0,
  treatmentPlans: 0,
  reminders: 0
})
</script>

<style lang="scss" scoped>
.dashboard {
  .stat-card {
    border-radius: 8px;

    .stat-content {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      color: #fff;

      &.patient { background: #409EFF; }
      &.appointment { background: #67C23A; }
      &.treatment { background: #E6A23C; }
      &.reminder { background: #F56C6C; }
    }

    .stat-info {
      .stat-value {
        font-size: 28px;
        font-weight: bold;
        color: #333;
      }
      .stat-label {
        color: #999;
        font-size: 14px;
        margin-top: 5px;
      }
    }
  }

  .card-header {
    font-weight: bold;
  }

  .quick-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;

    .el-button {
      flex: 1;
      min-width: 140px;
    }
  }

  .features {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;

    .feature-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 15px;
      background: #f5f7fa;
      border-radius: 4px;
      color: #666;
    }
  }
}
</style>
