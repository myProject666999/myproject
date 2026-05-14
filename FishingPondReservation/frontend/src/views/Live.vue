<template>
  <div class="live-page">
    <el-card>
      <div slot="header">
        <span style="font-size: 18px; font-weight: bold;">📺 现场直播</span>
      </div>

      <div v-if="activeStream" class="live-container">
        <div class="live-player">
          <div class="video-placeholder">
            <el-icon class="el-icon-video-camera" style="font-size: 80px; color: #909399;"></el-icon>
            <p style="color: #909399; margin-top: 20px;">直播区域</p>
            <p style="color: #c0c4cc; font-size: 13px;">{{ activeStream.streamUrl }}</p>
          </div>
          <div class="live-info">
            <h3>{{ activeStream.title }}</h3>
            <p>{{ activeStream.description }}</p>
            <div style="display: flex; gap: 20px; margin-top: 10px;">
              <el-tag type="danger">直播中</el-tag>
              <span><i class="el-icon-view"></i> {{ activeStream.viewCount }} 人观看</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="no-live">
        <el-empty description="暂无直播"></el-empty>
      </div>
    </el-card>

    <el-card style="margin-top: 20px;">
      <div slot="header">
        <span style="font-weight: bold;">🎣 实时渔获</span>
      </div>
      <el-table :data="todayCatch" border>
        <el-table-column prop="userId" label="钓友ID" width="100"></el-table-column>
        <el-table-column prop="fishType" label="鱼种" width="120"></el-table-column>
        <el-table-column prop="weight" label="重量(kg)" width="120">
          <template slot-scope="scope">
            <span style="color: #409EFF; font-weight: bold;">{{ scope.row.weight }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="pricePerKg" label="单价(元/kg)" width="120"></el-table-column>
        <el-table-column prop="totalPrice" label="价值(元)" width="120">
          <template slot-scope="scope">
            <span style="color: #f56c6c;">¥{{ scope.row.totalPrice }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="weighTime" label="称重时间" width="180"></el-table-column>
      </el-table>
      <el-empty description="暂无今日渔获" v-if="todayCatch.length === 0"></el-empty>
    </el-card>
  </div>
</template>

<script>
import request from '../utils/request'

export default {
  name: 'Live',
  data() {
    return {
      activeStream: null,
      todayCatch: [],
      timer: null
    }
  },
  mounted() {
    this.loadLive()
    this.loadTodayCatch()
    this.timer = setInterval(() => {
      this.loadTodayCatch()
    }, 10000)
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    async loadLive() {
      try {
        const res = await request.get('/live/active')
        this.activeStream = res.data
      } catch (error) {
        console.error(error)
      }
    },
    async loadTodayCatch() {
      try {
        const res = await request.get('/catch/today')
        this.todayCatch = res.data
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>

<style scoped>
.live-page {
  padding: 10px;
}
.live-container {
  text-align: center;
}
.live-player {
  max-width: 800px;
  margin: 0 auto;
}
.video-placeholder {
  width: 100%;
  height: 400px;
  background: #2c3e50;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}
.live-info {
  text-align: left;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-top: 15px;
}
.live-info h3 {
  margin: 0 0 10px 0;
}
.no-live {
  padding: 50px;
}
</style>
