<template>
  <div class="page-container">
    <van-nav-bar title="联系客服" left-arrow @click-left="router.back()" />
    
    <div class="content">
      <div class="contact-card">
        <van-icon name="phone-o" size="40" color="#07c160" />
        <div class="contact-info">
          <h3>客服热线</h3>
          <p>400-123-4567</p>
          <span class="service-time">服务时间：9:00-21:00</span>
        </div>
      </div>

      <van-cell-group inset style="margin-top: 12px">
        <van-cell title="微信客服" is-link @click="copyWechat">
          <template #value>
            <span class="wechat-id">CampingService</span>
          </template>
        </van-cell>
        <van-cell title="邮箱" is-link @click="copyEmail">
          <template #value>
            <span class="email">service@camping.com</span>
          </template>
        </van-cell>
      </van-cell-group>

      <div class="faq-section">
        <h3>常见问题</h3>
        <van-accordion>
          <van-accordion-item title="如何修改预订信息？">
            <p>请联系客服修改，提前24小时可免费修改。</p>
          </van-accordion-item>
          <van-accordion-item title="可以开具发票吗？">
            <p>可以，联系客服提供发票信息即可。</p>
          </van-accordion-item>
          <van-accordion-item title="营位可以提前多久预订？">
            <p>最多可提前30天预订。</p>
          </van-accordion-item>
        </van-accordion>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()

const copyWechat = () => {
  showToast('微信号已复制')
}

const copyEmail = () => {
  showToast('邮箱已复制')
}
</script>

<style scoped>
.content {
  padding: 12px;
}

.contact-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
}

.contact-info {
  margin-left: 16px;
}

.contact-info h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #323233;
}

.contact-info p {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 600;
  color: #07c160;
}

.service-time {
  font-size: 12px;
  color: #969799;
}

.wechat-id, .email {
  color: #1989fa;
  font-size: 14px;
}

.faq-section {
  margin-top: 20px;
}

.faq-section h3 {
  margin: 0 0 12px 0;
  padding: 0 4px;
  font-size: 16px;
  color: #323233;
}
</style>
