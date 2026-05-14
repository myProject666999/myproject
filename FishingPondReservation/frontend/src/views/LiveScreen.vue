<template>
  <div class="live-screen">
    <div class="screen-header">
      <h1>🎣 钓鱼场实时大屏</h1>
      <div class="header-info">
        <span>{{ currentTime }}</span>
        <span class="live-badge">LIVE</span>
      </div>
    </div>

    <div class="screen-content">
      <div class="left-panel">
        <el-card class="panel-card">
          <div slot="header">
            <span class="panel-title">🏆 今日钓友排行榜</span>
          </div>
          <div class="leaderboard-list">
            <div v-for="(item, index) in leaderboard" :key="item.userId" class="rank-item" :class="'rank-' + (index + 1)">
              <div class="rank-num">
                <span v-if="index === 0">🥇</span>
                <span v-else-if="index === 1">🥈</span>
                <span v-else-if="index === 2">🥉</span>
                <span v-else>{{ index + 1 }}</span>
              </div>
              <div class="rank-info">
                <div class="rank-name">{{ item.nickname }}</div>
                <div class="rank-detail">
                  <span class="weight">{{ item.totalWeight }}kg</span>
                  <span class="value">¥{{ item.totalValue }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <div class="center-panel">
        <el-card class="panel-card">
          <div slot="header">
            <span class="panel-title">📺 现场直播</span>
          </div>
          <div class="live-area">
            <div v-if="activeStream" class="live-video">
              <div class="video-placeholder">
                <el-icon class="el-icon-video-camera" style="font-size: 60px;"></el-icon>
                <p>{{ activeStream.title }}</p>
                <p class="viewers"><i class="el-icon-view"></i> {{ activeStream.viewCount }} 观看</p>
              </div>
            </div>
            <div v-else class="no-live">
              <el-empty description="暂无直播"></el-empty>
            </div>
          </div>
        </el-card>
      </div>

      <div class="right-panel">
        <el-card class="panel-card">
          <div slot="header">
            <span class="panel-title">🎣 实时渔获</span>
          </div>
          <div class="catch-list">
            <div v-for="catchItem in todayCatch" :key="catchItem.id" class="catch-item">
              <div class="catch-fish">{{ catchItem.fishType }}</div>
              <div class="catch-weight">{{ catchItem.weight }}kg</div>
              <div class="catch-price">¥{{ catchItem.totalPrice }}</div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import request from '../utils/request'

export default {
  name: 'LiveScreen',
  data() {
    return {
      currentTime: '',
      leaderboard: [],
      todayCatch: [],
      activeStream: null,
      timer: null,
      timeTimer: null
    }
  },
  mounted() {
    this.updateTime()
    this.loadData()
    this.timeTimer = setInterval(() => this.updateTime(), 1000)
    this.timer = setInterval(() => this.loadData(), 5000)
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer)
    if (this.timeTimer) clearInterval(this.timeTimer)
  },
  methods: {
    updateTime() {
      const now = new Date()
      this.currentTime = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    },
    async loadData() {
      try {
        const [lb, tc, ls] = await Promise.all([
          request.get('/leaderboard/today'),
          request.get('/catch/today'),
          request.get('/live/active')
        ])
        this.leaderboard = lb.data.slice(0, 10)
        this.todayCatch = tc.data.slice(0, 15)
        this.activeStream = ls.data
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>

<style scoped>
.live-screen {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
  padding: 20px;
}
.screen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  margin-bottom: 20px;
}
.screen-header h1 {
  margin: 0;
  font-size: 32px;
}
.header-info {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 20px;
}
.live-badge {
  background: #f56c6c;
  padding: 5px 15px;
  border-radius: 20px;
  font-weight: bold;
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
.screen-content {
  display: flex;
  gap: 20px;
  height: calc(100vh - 140px);
}
.left-panel, .right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.center-panel {
  flex: 1.5;
  display: flex;
  flex-direction: column;
}
.panel-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}
.panel-card >>> .el-card__header {
  background: rgba(64, 158, 255, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
}
.panel-title {
  font-size: 18px;
  font-weight: bold;
}
.leaderboard-list {
  overflow-y: auto;
  max-height: calc(100vh - 250px);
}
.rank-item {
  display: flex;
  align-items: center;
  padding: 12px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.rank-num {
  width: 50px;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
}
.rank-info {
  flex: 1;
}
.rank-name {
  font-size: 16px;
  margin-bottom: 5px;
}
.rank-detail {
  display: flex;
  gap: 15px;
}
.rank-detail .weight {
  color: #409EFF;
  font-weight: bold;
}
.rank-detail .value {
  color: #f56c6c;
}
.live-area {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.live-video {
  width: 100%;
  height: 100%;
}
.video-placeholder {
  width: 100%;
  height: 100%;
  min-height: 400px;
  background: #2c3e50;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}
.video-placeholder p {
  margin: 10px 0;
}
.video-placeholder .viewers {
  color: #909399;
}
.catch-list {
  overflow-y: auto;
  max-height: calc(100vh - 250px);
}
.catch-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.catch-fish {
  font-weight: bold;
}
.catch-weight {
  color: #409EFF;
  font-weight: bold;
}
.catch-price {
  color: #f56c6c;
}
</style>
