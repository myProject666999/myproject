<template>
  <div class="register-page">
    <div class="register-header">
      <h2>用户注册</h2>
    </div>

    <van-form @submit="onRegister">
      <van-cell-group inset>
        <van-field
          v-model="form.phone"
          type="tel"
          label="手机号"
          placeholder="请输入手机号"
        />
        <van-field
          v-model="form.nickName"
          label="昵称"
          placeholder="请输入昵称（选填）"
        />
        <van-field
          v-model="form.password"
          type="password"
          label="密码"
          placeholder="请输入密码"
        />
        <van-field
          v-model="form.password2"
          type="password"
          label="确认密码"
          placeholder="请再次输入密码"
        />
      </van-cell-group>

      <div style="margin: 16px">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          注册
        </van-button>
      </div>
    </van-form>

    <div class="register-footer">
      <router-link to="/login">已有账号？去登录</router-link>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { showToast } from 'vant';

const router = useRouter();
const userStore = useUserStore();

const form = reactive({
  phone: '',
  nickName: '',
  password: '',
  password2: '',
});

const loading = ref(false);

async function onRegister() {
  if (!form.phone) {
    showToast('请输入手机号');
    return;
  }
  if (!form.password) {
    showToast('请输入密码');
    return;
  }
  if (form.password !== form.password2) {
    showToast('两次密码输入不一致');
    return;
  }

  loading.value = true;
  try {
    await userStore.register({
      phone: form.phone,
      password: form.password,
      nickName: form.nickName,
      role: 'user',
    });
    showToast('注册成功');
    router.replace('/home');
  } catch (e) {
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #07c160 0%, #10b981 100%);
  padding-top: 60px;
}

.register-header {
  text-align: center;
  color: #fff;
  margin-bottom: 40px;
}

.register-footer {
  text-align: center;
  margin-top: 20px;
}

.register-footer a {
  color: #fff;
  text-decoration: underline;
}
</style>
