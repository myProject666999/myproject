<template>
  <div class="page-container">
    <van-nav-bar title="关于我们" left-arrow @click-left="router.back()" />
    
    <div class="content">
      <div class="about-header">
        <div class="logo">
          <van-icon name="location-o" size="48" color="#07c160" />
        </div>
        <h2>露营地预订平台</h2>
        <p>让露营更简单</p>
      </div>

      <van-cell-group inset>
        <van-cell title="版本号" value="1.0.0" />
        <van-cell title="官网" is-link @click="showWebsite" />
        <van-cell title="用户协议" is-link @click="showAgreement" />
        <van-cell title="隐私政策" is-link @click="showPrivacy" />
      </van-cell-group>

      <div class="about-content">
        <h3>关于我们</h3>
        <p>
          我们致力于为露营爱好者提供便捷的营地预订服务。
          我们精选优质营地，提供透明的价格和完善的服务，
          让您的露营之旅更加轻松愉快。
        </p>
        
        <h3>联系我们</h3>
        <p>电话：400-123-4567</p>
        <p>邮箱：service@camping.com</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()

const showWebsite = () => {
  showToast('官网即将上线')
}

const showAgreement = () => {
  showToast('用户协议')
}

const showPrivacy = () => {
  showToast('隐私政策')
}
</script>

<style scoped>
.content {
  padding: 12px;
}

.about-header {
  background: linear-gradient(135deg, #07c160 0%, #06ad56 100%);
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  color: #fff;
}

.logo {
  background: rgba(255, 255, 255, 0.2);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.about-header h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
}

.about-header p {
  margin: 0;
  opacity: 0.9;
}

.about-content {
  background: #fff;
  margin-top: 12px;
  padding: 16px;
  border-radius: 12px;
}

.about-content h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #323233;
}

.about-content p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #646566;
  line-height: 1.6;
}
</style>
