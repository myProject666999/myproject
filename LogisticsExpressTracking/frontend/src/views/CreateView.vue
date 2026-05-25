<template>
  <div class="create-container">
    <div class="back-link" @click="goBack">
      <el-icon><ArrowLeft /></el-icon>
      <span>返回管理</span>
    </div>

    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <span>创建运单</span>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        class="waybill-form"
      >
        <el-row :gutter="24">
          <el-col :span="12">
            <div class="form-section">
              <h3>寄件人信息</h3>
              <el-form-item label="姓名" prop="senderName">
                <el-input v-model="formData.senderName" placeholder="请输入寄件人姓名" />
              </el-form-item>
              <el-form-item label="电话" prop="senderPhone">
                <el-input v-model="formData.senderPhone" placeholder="请输入寄件人电话" />
              </el-form-item>
              <el-form-item label="地址" prop="senderAddress">
                <el-input v-model="formData.senderAddress" placeholder="请输入寄件人地址" />
              </el-form-item>
            </div>
          </el-col>

          <el-col :span="12">
            <div class="form-section">
              <h3>收件人信息</h3>
              <el-form-item label="姓名" prop="receiverName">
                <el-input v-model="formData.receiverName" placeholder="请输入收件人姓名" />
              </el-form-item>
              <el-form-item label="电话" prop="receiverPhone">
                <el-input v-model="formData.receiverPhone" placeholder="请输入收件人电话" />
              </el-form-item>
              <el-form-item label="地址" prop="receiverAddress">
                <el-input v-model="formData.receiverAddress" placeholder="请输入收件人地址" />
              </el-form-item>
            </div>
          </el-col>
        </el-row>

        <div class="form-section">
          <h3>物品信息</h3>
          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="物品名称" prop="goodsName">
                <el-input v-model="formData.goodsName" placeholder="请输入物品名称" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="重量(kg)">
                <el-input-number v-model="formData.goodsWeight" :min="0" :precision="2" :step="0.1" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="运费(¥)">
                <el-input-number v-model="formData.freight" :min="0" :precision="2" :step="1" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            创建运单
          </el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-dialog v-model="showResult" title="创建成功" width="500px">
      <div class="result-content">
        <el-icon class="success-icon" :size="64" color="#67c23a"><CircleCheckFilled /></el-icon>
        <h3>运单创建成功！</h3>
        <p class="waybill-no">运单号：<strong>{{ newWaybillNo }}</strong></p>
      </div>
      <template #footer>
        <el-button @click="goBack">返回列表</el-button>
        <el-button type="primary" @click="viewDetail">查看详情</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createWaybill } from '../api/waybill'

const router = useRouter()
const formRef = ref(null)
const submitting = ref(false)
const showResult = ref(false)
const newWaybillNo = ref('')

const formData = reactive({
  senderName: '',
  senderPhone: '',
  senderAddress: '',
  receiverName: '',
  receiverPhone: '',
  receiverAddress: '',
  goodsName: '',
  goodsWeight: 0,
  freight: 0
})

const formRules = {
  senderName: [{ required: true, message: '请输入寄件人姓名', trigger: 'blur' }],
  senderPhone: [{ required: true, message: '请输入寄件人电话', trigger: 'blur' }],
  senderAddress: [{ required: true, message: '请输入寄件人地址', trigger: 'blur' }],
  receiverName: [{ required: true, message: '请输入收件人姓名', trigger: 'blur' }],
  receiverPhone: [{ required: true, message: '请输入收件人电话', trigger: 'blur' }],
  receiverAddress: [{ required: true, message: '请输入收件人地址', trigger: 'blur' }],
  goodsName: [{ required: true, message: '请输入物品名称', trigger: 'blur' }]
}

const goBack = () => {
  router.push('/admin')
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const res = await createWaybill(formData)
    if (res.code === 200) {
      newWaybillNo.value = res.data.waybillNo
      showResult.value = true
      ElMessage.success('创建成功')
    } else {
      ElMessage.error(res.message)
    }
  } catch (e) {
    ElMessage.error('创建失败')
  } finally {
    submitting.value = false
  }
}

const viewDetail = () => {
  router.push(`/tracking/${newWaybillNo.value}`)
}
</script>

<style scoped>
.create-container {
  max-width: 1200px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #409eff;
  cursor: pointer;
  margin-bottom: 20px;
  font-size: 14px;
}

.back-link:hover {
  text-decoration: underline;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
}

.form-section {
  margin-bottom: 24px;
}

.form-section h3 {
  font-size: 15px;
  color: #303133;
  margin-bottom: 16px;
  padding-left: 10px;
  border-left: 3px solid #409eff;
}

.waybill-form {
  padding-top: 20px;
}

.result-content {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  margin-bottom: 16px;
}

.result-content h3 {
  color: #67c23a;
  margin-bottom: 12px;
}

.waybill-no {
  font-size: 16px;
  color: #606266;
}

.waybill-no strong {
  color: #409eff;
  font-size: 18px;
}
</style>
