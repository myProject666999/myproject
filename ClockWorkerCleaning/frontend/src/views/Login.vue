<template>
  <div class="login-page">
    <div class="login-header">
      <h2>钟点工保洁预约</h2>
      <p>专业保洁，省心到家</p>
    </div>

    <van-form @submit="onLogin">
      <van-cell-group inset>
        <van-field
          v-model="form.phone"
          type="tel"
          label="手机号"
          placeholder="请输入手机号"
        />
        <van-field
          v-model="form.password"
          type="password"
          label="密码"
          placeholder="请输入密码"
        />
      </van-cell-group>

      <div style="margin: 16px">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          登录
        </van-button>
      </div>
    </van-form>

    <div class="login-footer">
      <router-link to="/register">没有账号？去注册</router-link>
      <van-divider>测试账号</van-divider>
      <div class="test-accounts">
        <div class="account-item" @click="quickLogin('13800000001')">用户: 13800000001 / 123456</div>
        <div class="account-item" @click="quickLogin('13900000001')">阿姨: 13900000001 / 123456</div>
        <div class="account-item" @click="quickLogin('13800000000')">管理员: 13800000000 / 123456</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { showToast } from 'vant';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const form = reactive({
  phone: '',
  password: '',
});

const loading = ref(false);

async function onLogin() {
  if (!form.phone || !form.password) {
    showToast('请输入手机号和密码');
    return;
  }

  loading.value = true;
  try {
    await userStore.login(form.phone, form.password);
    showToast('登录成功');
    const redirect = route.query.redirect || (userStore.isWorker ? '/worker' : '/home');
    router.replace(redirect);
  } catch (e) {
  } finally {
    loading.value = false;
  }
}

function quickLogin(phone) {
  form.phone = phone;
  form.password = '123456';
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #07c160 0%, #10b981 100%);
  padding-top: 60px;
}

.login-header {
  text-align: center;
  color: #fff;
  margin-bottom: 40px;
}

.login-header h2 {
  font-size: 28px;
  margin-bottom: 8px;
}

.login-header p {
  opacity: 0.9;
  font-size: 14px;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  color: #fff;
}

.login-footer a {
  color: #fff;
  text-decoration: underline;
}

.test-accounts {
  padding: 0 20px;
}

.account-item {
  padding: 8px 0;
  font-size: 12px;
  opacity: 0.85;
  cursor: pointer;
}
</style>
