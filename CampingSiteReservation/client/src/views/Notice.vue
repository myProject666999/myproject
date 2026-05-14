<template>
  <div class="page-container">
    <van-nav-bar title="预订须知" left-arrow @click-left="router.back()" />
    
    <div class="content">
      <van-cell-group inset>
        <van-cell title="预订规则" is-link @click="showSection('rules')" />
        <van-cell title="取消政策" is-link @click="showSection('cancel')" />
        <van-cell title="入住须知" is-link @click="showSection('checkin')" />
        <van-cell title="装备租赁" is-link @click="showSection('equipment')" />
      </van-cell-group>

      <div class="notice-section">
        <h3>重要提示</h3>
        <ul>
          <li>入住时间：14:00后，退房时间：12:00前</li>
          <li>请携带有效身份证件办理入住</li>
          <li>禁止携带宠物进入营地</li>
          <li>营地内禁止吸烟</li>
          <li>请遵守营地区域的安静时间（22:00-次日7:00）</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()

const showSection = (section) => {
  showToast('查看' + section + '详情')
}
</script>

<style scoped>
.content {
  padding: 12px;
}

.notice-section {
  background: #fff;
  margin-top: 12px;
  padding: 16px;
  border-radius: 12px;
}

.notice-section h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #323233;
}

.notice-section ul {
  margin: 0;
  padding-left: 20px;
}

.notice-section li {
  margin-bottom: 8px;
  font-size: 14px;
  color: #646566;
  line-height: 1.6;
}
</style>
