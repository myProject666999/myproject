<template>
    <div class="page-container">
        <div class="card" style="max-width: 800px; margin: 0 auto;">
            <h2 class="page-title" style="margin-bottom: 20px;">
                {{ isEdit ? '编辑订阅' : '添加订阅' }}
            </h2>
            <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
                <el-form-item label="订阅名称" prop="name">
                    <el-input v-model="form.name" placeholder="请输入订阅名称" />
                </el-form-item>
                <el-form-item label="描述">
                    <el-input v-model="form.description" type="textarea" :rows="2" placeholder="请输入描述" />
                </el-form-item>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="分类" prop="category">
                            <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%;">
                                <el-option label="视频" value="视频" />
                                <el-option label="音乐" value="音乐" />
                                <el-option label="云存储" value="云存储" />
                                <el-option label="工具" value="工具" />
                                <el-option label="云服务" value="云服务" />
                                <el-option label="其他" value="其他" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="价格" prop="price">
                            <el-input-number v-model="form.price" :min="0" :precision="2" style="width: 100%;" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="币种" prop="currency">
                            <el-select v-model="form.currency" style="width: 100%;">
                                <el-option label="人民币 CNY" value="CNY" />
                                <el-option label="美元 USD" value="USD" />
                                <el-option label="欧元 EUR" value="EUR" />
                                <el-option label="英镑 GBP" value="GBP" />
                                <el-option label="日元 JPY" value="JPY" />
                                <el-option label="港币 HKD" value="HKD" />
                                <el-option label="新台币 TWD" value="TWD" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="周期类型" prop="cycleType">
                            <el-select v-model="form.cycleType" style="width: 100%;" @change="onCycleTypeChange">
                                <el-option label="月付" value="MONTHLY" />
                                <el-option label="年付" value="YEARLY" />
                                <el-option label="自定义" value="CUSTOM" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item v-if="form.cycleType === 'CUSTOM'" label="周期天数" prop="cycleDays">
                    <el-input-number v-model="form.cycleDays" :min="1" style="width: 200px;" />
                </el-form-item>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="开始日期" prop="startDate">
                            <el-date-picker v-model="form.startDate" type="date" style="width: 100%;" value-format="YYYY-MM-DD" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="下次续费日期" prop="nextRenewalDate">
                            <el-date-picker v-model="form.nextRenewalDate" type="date" style="width: 100%;" value-format="YYYY-MM-DD" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="提前提醒天数" prop="reminderDays">
                            <el-input-number v-model="form.reminderDays" :min="1" :max="30" style="width: 200px;" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="状态">
                            <el-switch v-model="form.isActive" active-text="有效" inactive-text="已取消" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="支付方式">
                            <el-input v-model="form.paymentMethod" placeholder="如：支付宝、微信、信用卡等" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="绑定账号">
                            <el-input v-model="form.account" placeholder="绑定的邮箱或手机号" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item>
                    <el-button type="primary" @click="handleSubmit">保存</el-button>
                    <el-button @click="handleCancel">取消</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createSubscription, updateSubscription, getSubscriptionById } from '../api'

const router = useRouter()
const route = useRoute()
const formRef = ref(null)

const isEdit = computed(() => !!route.params.id)

const form = reactive({
    name: '',
    description: '',
    category: '',
    price: 0,
    currency: 'CNY',
    cycleType: 'MONTHLY',
    cycleDays: null,
    startDate: '',
    nextRenewalDate: '',
    isActive: true,
    reminderDays: 7,
    paymentMethod: '',
    account: ''
})

const rules = {
    name: [{ required: true, message: '请输入订阅名称', trigger: 'blur' }],
    category: [{ required: true, message: '请选择分类', trigger: 'change' }],
    price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
    currency: [{ required: true, message: '请选择币种', trigger: 'change' }],
    cycleType: [{ required: true, message: '请选择周期类型', trigger: 'change' }],
    startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
    nextRenewalDate: [{ required: true, message: '请选择下次续费日期', trigger: 'change' }],
    cycleDays: [{ required: true, message: '请输入周期天数', trigger: 'blur' }]
}

const onCycleTypeChange = (val) => {
    if (val === 'CUSTOM') {
        form.cycleDays = 30
    } else {
        form.cycleDays = null
    }
}

const loadSubscription = async (id) => {
    try {
        const data = await getSubscriptionById(id)
        Object.assign(form, data)
    } catch (e) {
        console.error(e)
    }
}

const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
        if (valid) {
            try {
                if (isEdit.value) {
                    await updateSubscription(route.params.id, form)
                    ElMessage.success('更新成功')
                } else {
                    await createSubscription(form)
                    ElMessage.success('添加成功')
                }
                router.push('/subscriptions')
            } catch (e) {
                console.error(e)
            }
        }
    })
}

const handleCancel = () => {
    router.push('/subscriptions')
}

onMounted(() => {
    if (isEdit.value) {
        loadSubscription(route.params.id)
    }
})
</script>
