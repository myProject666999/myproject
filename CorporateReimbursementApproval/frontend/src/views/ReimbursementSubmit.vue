<template>
  <div class="submit-page">
    <el-card class="submit-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon :size="20" color="#409EFF"><DocumentAdd /></el-icon>
          <span class="card-title">{{ isEdit ? '编辑报销单' : '新建报销单' }}</span>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="submit-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="报销标题" prop="title">
              <el-input
                v-model="form.title"
                placeholder="请输入报销标题"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="报销类型" prop="type">
              <el-select
                v-model="form.type"
                placeholder="请选择报销类型"
                style="width: 100%"
                :loading="typeLoading"
              >
                <el-option
                  v-for="item in typeOptions"
                  :key="item.code"
                  :label="item.name"
                  :value="item.code"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="报销事由" prop="reason">
          <el-input
            v-model="form.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入报销事由"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-divider content-position="left">报销明细</el-divider>

        <div class="table-wrapper">
          <el-table
            :data="form.items"
            border
            stripe
            size="default"
            style="width: 100%"
          >
            <el-table-column label="序号" type="index" width="60" align="center" />
            <el-table-column label="费用名称" prop="name" min-width="160">
              <template #default="{ row }">
                <el-input v-model="row.name" placeholder="请输入费用名称" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="费用类型" prop="itemType" min-width="140">
              <template #default="{ row }">
                <el-select
                  v-model="row.itemType"
                  placeholder="请选择"
                  size="small"
                  style="width: 100%"
                  :loading="typeLoading"
                >
                  <el-option
                    v-for="item in typeOptions"
                    :key="item.code"
                    :label="item.name"
                    :value="item.code"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="数量" prop="quantity" width="120" align="center">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.quantity"
                  :min="1"
                  :precision="2"
                  :step="1"
                  size="small"
                  @change="calcAmount(row)"
                  style="width: 100%"
                />
              </template>
            </el-table-column>
            <el-table-column label="单价(元)" prop="unitPrice" width="140" align="center">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.unitPrice"
                  :min="0"
                  :precision="2"
                  :step="0.1"
                  size="small"
                  @change="calcAmount(row)"
                  style="width: 100%"
                />
              </template>
            </el-table-column>
            <el-table-column label="金额(元)" prop="amount" width="140" align="center">
              <template #default="{ row }">
                <el-input
                  :model-value="formatMoney(row.amount)"
                  disabled
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column label="消费日期" prop="expenseDate" width="170" align="center">
              <template #default="{ row }">
                <el-date-picker
                  v-model="row.expenseDate"
                  type="date"
                  placeholder="选择日期"
                  value-format="YYYY-MM-DD"
                  size="small"
                  style="width: 100%"
                />
              </template>
            </el-table-column>
            <el-table-column label="备注" prop="description" min-width="180">
              <template #default="{ row }">
                <el-input
                  v-model="row.description"
                  placeholder="备注"
                  size="small"
                  maxlength="100"
                  show-word-limit
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center" fixed="right">
              <template #default="{ $index }">
                <el-button
                  type="danger"
                  link
                  size="small"
                  :disabled="form.items.length <= 1"
                  @click="removeItem($index)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="add-row-wrapper">
            <el-button type="primary" plain :icon="Plus" @click="addItem">
              新增明细行
            </el-button>
            <div class="total-amount">
              <span>合计金额：</span>
              <span class="total-value">¥ {{ formatMoney(totalAmount) }}</span>
            </div>
          </div>
        </div>

        <el-divider content-position="left">发票附件</el-divider>

        <el-upload
          class="upload-wrapper"
          v-model:file-list="fileList"
          :action="uploadAction"
          :headers="uploadHeaders"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :on-remove="handleFileRemove"
          :before-upload="beforeUpload"
          multiple
          :limit="20"
          :on-exceed="handleExceed"
        >
          <el-button type="primary" plain :icon="Upload">
            点击上传发票
          </el-button>
          <template #tip>
            <div class="upload-tip">
              支持 jpg、png、pdf 格式，单个文件不超过 10MB，最多上传 20 个文件
            </div>
          </template>
        </el-upload>

        <div class="form-footer">
          <el-button
            :icon="Document"
            :loading="savingDraft"
            @click="handleSaveDraft"
          >
            保存草稿
          </el-button>
          <el-button
            type="primary"
            :icon="Check"
            :loading="submitting"
            @click="handleSubmit"
          >
            提交审批
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  DocumentAdd,
  Plus,
  Delete,
  Upload,
  Document,
  Check
} from '@element-plus/icons-vue'
import { getReimbursementTypes, uploadFile } from '@/api/common'
import { createReimbursement, submitReimbursement, getDetail, updateReimbursement } from '@/api/reimbursement'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const editId = ref(null)
const isEdit = computed(() => !!editId.value)

const formRef = ref(null)
const typeLoading = ref(false)
const typeOptions = ref([])
const savingDraft = ref(false)
const submitting = ref(false)

const fileList = ref([])
const uploadAction = '/api/file/upload'
const uploadHeaders = computed(() => ({
  Authorization: userStore.token ? `Bearer ${userStore.token}` : ''
}))

const form = reactive({
  title: '',
  type: '',
  reason: '',
  items: [
    {
      name: '',
      itemType: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      expenseDate: '',
      description: ''
    }
  ],
  attachments: []
})

const rules = {
  title: [
    { required: true, message: '请输入报销标题', trigger: 'blur' },
    { max: 100, message: '标题长度不超过 100 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择报销类型', trigger: 'change' }
  ],
  reason: [
    { required: true, message: '请输入报销事由', trigger: 'blur' },
    { max: 500, message: '事由长度不超过 500 个字符', trigger: 'blur' }
  ]
}

const totalAmount = computed(() => {
  return form.items.reduce((sum, item) => {
    const amt = Number(item.amount) || 0
    return sum + amt
  }, 0)
})

const calcAmount = (row) => {
  const qty = Number(row.quantity) || 0
  const price = Number(row.unitPrice) || 0
  row.amount = Number((qty * price).toFixed(2))
}

const addItem = () => {
  form.items.push({
    name: '',
    itemType: '',
    quantity: 1,
    unitPrice: 0,
    amount: 0,
    expenseDate: '',
    description: ''
  })
}

const removeItem = (index) => {
  if (form.items.length <= 1) return
  form.items.splice(index, 1)
}

const formatMoney = (val) => {
  const n = Number(val) || 0
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const fetchTypes = async () => {
  typeLoading.value = true
  try {
    const res = await getReimbursementTypes()
    if (res.code === 200) {
      typeOptions.value = (res.data || []).map(item => ({
        code: item.typeCode,
        name: item.typeName,
        maxAmount: item.maxAmount
      }))
    }
  } catch (e) {
    ElMessage.error('获取报销类型失败')
  } finally {
    typeLoading.value = false
  }
}

const beforeUpload = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
  const isAllowed = allowedTypes.includes(file.type)
  if (!isAllowed) {
    ElMessage.error('仅支持 jpg、png、pdf 格式的文件')
    return false
  }
  if (file.size / 1024 / 1024 > 10) {
    ElMessage.error('单个文件大小不能超过 10MB')
    return false
  }
  return true
}

const handleUploadSuccess = (response, uploadFile, uploadList) => {
  if (response && response.code === 200) {
    const data = response.data || {}
    const existing = form.attachments.find(a => a.fileName === data.fileName)
    if (!existing) {
      form.attachments.push({
        fileName: data.fileName || uploadFile.name,
        fileUrl: data.fileUrl || data.filePath || data.url || '',
        originalName: data.originalName || uploadFile.name
      })
    }
    ElMessage.success(`${uploadFile.name} 上传成功`)
  } else {
    ElMessage.error(response?.message || `${uploadFile.name} 上传失败`)
    const idx = uploadList.findIndex(f => f.uid === uploadFile.uid)
    if (idx > -1) uploadList.splice(idx, 1)
  }
}

const handleUploadError = (err, uploadFile, uploadList) => {
  ElMessage.error(`${uploadFile.name} 上传失败`)
  const idx = uploadList.findIndex(f => f.uid === uploadFile.uid)
  if (idx > -1) uploadList.splice(idx, 1)
}

const handleFileRemove = (file) => {
  form.attachments = form.attachments.filter(a => a.fileName !== file.name && a.originalName !== file.name)
}

const handleExceed = () => {
  ElMessage.warning('最多只能上传 20 个文件')
}

const validateItems = () => {
  for (let i = 0; i < form.items.length; i++) {
    const item = form.items[i]
    if (!item.name || !item.name.trim()) {
      ElMessage.warning(`第 ${i + 1} 行：请输入费用名称`)
      return false
    }
    if (!item.itemType) {
      ElMessage.warning(`第 ${i + 1} 行：请选择费用类型`)
      return false
    }
    if (!item.unitPrice || item.unitPrice <= 0) {
      ElMessage.warning(`第 ${i + 1} 行：请输入有效的单价`)
      return false
    }
    if (!item.expenseDate) {
      ElMessage.warning(`第 ${i + 1} 行：请选择消费日期`)
      return false
    }
  }
  return true
}

const buildPayload = () => ({
  title: form.title,
  type: form.type,
  reason: form.reason,
  items: form.items.map(it => ({
    name: it.name,
    itemType: it.itemType,
    quantity: it.quantity,
    unitPrice: it.unitPrice,
    amount: it.amount,
    expenseDate: it.expenseDate,
    description: it.description
  })),
  attachments: form.attachments
})

const handleSaveDraft = async () => {
  try {
    await formRef.value.validate()
    if (!validateItems()) return
    savingDraft.value = true
    const payload = { ...buildPayload(), status: 'DRAFT' }
    const res = isEdit.value
      ? await updateReimbursement(editId.value, payload)
      : await createReimbursement(payload)
    if (res.code === 200) {
      ElMessage.success('草稿已保存')
      router.push('/my')
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (e) {
    if (e && e.code !== 200) {
      ElMessage.error(e.message || '保存失败')
    }
  } finally {
    savingDraft.value = false
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    if (!validateItems()) return
    await ElMessageBox.confirm(
      `提交后将进入审批流程，合计金额 ¥${formatMoney(totalAmount)}，确认提交？`,
      '提交确认',
      { confirmButtonText: '确认提交', cancelButtonText: '取消', type: 'warning' }
    )
    submitting.value = true
    const payload = { ...buildPayload(), status: 'DRAFT' }
    let id
    if (isEdit.value) {
      const res = await updateReimbursement(editId.value, payload)
      if (res.code !== 200) {
        ElMessage.error(res.message || '保存失败')
        return
      }
      id = editId.value
    } else {
      const res = await createReimbursement(payload)
      if (res.code !== 200) {
        ElMessage.error(res.message || '提交失败')
        return
      }
      id = res.data?.id
    }
    if (id) {
      try {
        await submitReimbursement(id)
      } catch (_) {
      }
    }
    ElMessage.success('提交成功，已进入审批流程')
    router.push('/my')
  } catch (e) {
    if (e === 'cancel') return
    if (e && e.code !== 200) {
      ElMessage.error(e.message || '提交失败')
    }
  } finally {
    submitting.value = false
  }
}

const loadDetail = async (id) => {
  try {
    const res = await getDetail(id)
    if (res.code === 200) {
      const data = res.data || {}
      form.title = data.title || ''
      form.type = data.typeCode || ''
      form.reason = data.reason || ''
      form.items = (data.items || []).map(item => ({
        name: item.itemName || item.name || '',
        itemType: item.itemType || '',
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        amount: item.amount || 0,
        expenseDate: item.expenseDate || '',
        description: item.description || ''
      }))
      form.attachments = (data.attachments || []).map(att => ({
        fileName: att.fileName || '',
        fileUrl: att.fileUrl || att.filePath || '',
        originalName: att.fileName || ''
      }))
      fileList.value = form.attachments.map((att, idx) => ({
        uid: idx,
        name: att.fileName,
        url: att.fileUrl,
        status: 'success'
      }))
    }
  } catch (e) {
    ElMessage.error('加载报销单失败')
  }
}

onMounted(() => {
  fetchTypes()
  const id = route.query.id
  if (id) {
    editId.value = id
    loadDetail(id)
  }
})
</script>

<style scoped>
.submit-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 40px);
}

.submit-card {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.submit-form {
  padding: 0 10px;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.add-row-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding: 0 4px;
}

.total-amount {
  font-size: 15px;
  color: #606266;
}

.total-value {
  color: #f56c6c;
  font-weight: 600;
  font-size: 18px;
  margin-left: 8px;
}

.upload-wrapper {
  margin: 8px 0 20px;
}

.upload-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 8px;
}

.form-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
</style>
