<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import type { FormInstance, FormRules } from 'element-plus';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const formRef = ref<FormInstance>();
const loading = ref(false);
const errorMessage = ref('');

const formData = ref({
  username: '',
  password: '',
});

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
  ],
};

async function handleSubmit() {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    
    loading.value = true;
    errorMessage.value = '';
    
    try {
      await authStore.login(formData.value.username, formData.value.password);
      const redirect = route.query.redirect as string || '/admin';
      router.push(redirect);
    } catch (err: any) {
      errorMessage.value = err.response?.data?.message || '登录失败，请检查用户名和密码';
    } finally {
      loading.value = false;
    }
  });
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">博客管理系统</h1>
        <p class="text-white/80">请登录以继续</p>
      </div>
      
      <el-card class="shadow-2xl rounded-xl">
        <el-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-position="top"
          @submit.prevent="handleSubmit"
        >
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="formData.username"
              placeholder="请输入用户名"
              size="large"
              :prefix-icon="User"
            />
          </el-form-item>
          
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="formData.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              :prefix-icon="Lock"
              @keyup.enter="handleSubmit"
            />
          </el-form-item>
          
          <el-alert
            v-if="errorMessage"
            :title="errorMessage"
            type="error"
            show-icon
            class="mb-4"
            :closable="false"
          />
          
          <el-button
            type="primary"
            size="large"
            class="w-full"
            :loading="loading"
            @click="handleSubmit"
          >
            登 录
          </el-button>
        </el-form>
      </el-card>
      
      <p class="text-center text-white/60 text-sm mt-6">
        © 2024 个人博客管理系统
      </p>
    </div>
  </div>
</template>
