<template>
    <div class="login-container">
        <el-card class="login-card">
            <div class="login-header">
                <h2>会议室预订系统</h2>
                <p>请登录您的账号</p>
            </div>
            <el-form :model="form" :rules="rules" ref="formRef" @submit.prevent="handleLogin">
                <el-form-item prop="username">
                    <el-input v-model="form.username" placeholder="请输入用户名" size="large">
                        <template #prefix>
                            <el-icon><User /></el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input v-model="form.password" type="password" placeholder="请输入密码" size="large" show-password>
                        <template #prefix>
                            <el-icon><Lock /></el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" size="large" :loading="loading" @click="handleLogin" style="width: 100%">
                        登 录
                    </el-button>
                </el-form-item>
            </el-form>
            <div class="login-footer">
                <p>演示账号：admin / 123456</p>
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { login } from '@/api/auth'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
    username: '',
    password: ''
})

const rules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
    ]
}

const handleLogin = async () => {
    if (!formRef.value) return
    
    await formRef.value.validate(async (valid) => {
        if (valid) {
            loading.value = true
            try {
                const res = await login(form)
                userStore.setUser(res.data)
                ElMessage.success('登录成功')
                router.push('/')
            } catch (error) {
                // 错误已在拦截器中处理
            } finally {
                loading.value = false
            }
        }
    })
}
</script>

<style scoped>
.login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
    width: 400px;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.login-header {
    text-align: center;
    margin-bottom: 30px;
}

.login-header h2 {
    color: #303133;
    margin-bottom: 8px;
}

.login-header p {
    color: #909399;
    font-size: 14px;
}

.login-footer {
    text-align: center;
    margin-top: 20px;
}

.login-footer p {
    color: #909399;
    font-size: 12px;
}
</style>
