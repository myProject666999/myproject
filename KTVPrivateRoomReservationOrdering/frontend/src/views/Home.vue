
<template>
  <div class="home">
    <el-header>
      <div class="header-content">
        <div class="logo">🎤 KTV包厢预订与点歌系统</div>
        <div class="nav">
          <el-button type="primary" @click="goToBooking">在线预订</el-button>
          <el-button @click="goToOrder">酒水点单</el-button>
          <el-button @click="goToSong">点歌系统</el-button>
          <el-button @click="goToLogin">登录/注册</el-button>
        </div>
      </div>
    </el-header>
    
    <el-main>
      <div class="hero">
        <h1>欢迎来到 KTV 包厢预订与点歌系统</h1>
        <p>在线预订 · 酒水点单 · 多端点歌 · 会员折扣</p>
        <el-button type="primary" size="large" @click="goToBooking">立即预订</el-button>
      </div>
      
      <div class="features">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="feature-card">
              <div class="icon">🏠</div>
              <h3>多种包厢类型</h3>
              <p>小包、中包、大包、VIP包，满足不同需求</p>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="feature-card">
              <div class="icon">🎵</div>
              <h3>多端点歌</h3>
              <p>手机、平板、点歌屏，多设备同步控制</p>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="feature-card">
              <div class="icon">🍺</div>
              <h3>酒水点单</h3>
              <p>在线点单，快速送达包厢</p>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="feature-card">
              <div class="icon">💰</div>
              <h3>会员折扣</h3>
              <p>会员等级折扣，积分兑换</p>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-main>
    
    <el-footer>
      <p>&copy; 2024 KTV包厢预订与点歌系统 - 版权所有</p>
    </el-footer>
  </div>
</template>

<script>
export default {
  name: 'Home',
  methods: {
    goToBooking() {
      this.$router.push('/booking')
    },
    goToOrder() {
      this.$router.push('/order')
    },
    goToSong() {
      this.$router.push('/song')
    },
    goToLogin() {
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.home {
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
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
}

.nav .el-button {
  margin-left: 10px;
}

.el-main {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 40px 20px;
}

.hero {
  text-align: center;
  padding: 80px 0;
}

.hero h1 {
  font-size: 42px;
  color: #303133;
  margin-bottom: 20px;
}

.hero p {
  font-size: 18px;
  color: #909399;
  margin-bottom: 40px;
}

.features {
  margin-top: 60px;
}

.feature-card {
  text-align: center;
  padding: 40px 20px;
  border: 1px solid #EBEEF5;
  border-radius: 8px;
  transition: all 0.3s;
}

.feature-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-5px);
}

.feature-card .icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 20px;
  color: #303133;
  margin-bottom: 10px;
}

.feature-card p {
  font-size: 14px;
  color: #909399;
}

.el-footer {
  background-color: #f5f7fa;
  text-align: center;
  padding: 20px;
  color: #909399;
}
</style>
