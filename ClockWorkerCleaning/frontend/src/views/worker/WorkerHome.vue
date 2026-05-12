<template>
  <div class="page-container">
    <div class="worker-header">
      <div class="avatar-wrapper">
        <div class="avatar">
          <van-icon name="user-o" size="48" color="#1989fa" />
        </div>
      </div>
      <div class="user-info">
        <h2>{{ worker?.realName || '阿姨' }}</h2>
        <p class="text-secondary">状态：<van-tag :type="worker?.status === 1 ? 'success' : 'danger'">
          {{ worker?.status === 1 ? '接单中' : '休息中' }}
        </van-tag></p>
      </div>
    </div>

    <van-grid :column-num="3" border="false">
      <van-grid-item icon="orders-o" text="待接订单" badge="0" @click="router.push('/worker/bookings')" />
      <van-grid-item icon="clock-o" text="工时统计" @click="router.push('/worker/hours')" />
      <van-grid-item icon="gold-coin-o" text="薪资结算" @click="router.push('/worker/salaries')" />
    </van-grid>

    <van-cell-group inset>
      <van-cell title="今日待服务" is-link @click="router.push('/worker/bookings?status=2')" />
      <van-cell title="我的评价" is-link @click="showToast('功能开发中')" />
      <van-cell title="设置" is-link @click="showToast('功能开发中')" />
    </van-cell-group>

    <div class="footer-btn">
      <van-button block type="danger" @click="logout">退出登录</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { showToast, showConfirmDialog } from 'vant';

const router = useRouter();
const userStore = useUserStore();

const worker = ref(null);

onMounted(() => {
  worker.value = userStore.userInfo;
});

async function logout() {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定退出登录？',
    });
    userStore.logout();
    router.replace('/login');
  } catch (e) {}
}
</script>

<style scoped>
.worker-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 24px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info h2 {
  margin: 0 0 4px;
  font-size: 20px;
}

.footer-btn {
  padding: 24px;
}
</style>
