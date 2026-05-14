<template>
  <div class="cards-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>卡类型管理</span>
          <el-button type="primary" @click="openDialog">
            <el-icon><Plus /></el-icon>
            新增卡类型
          </el-button>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="8" v-for="item in cardTypes" :key="item.id" class="mb-20">
          <el-card class="card-item" :class="{ disabled: !item.status }">
            <template #header>
              <div class="item-header">
                <el-tag :type="getCardTypeTag(item.card_type)" size="large">
                  {{ getCardTypeText(item.card_type) }}
                </el-tag>
                <el-tag v-if="!item.status" type="info">已下架</el-tag>
              </div>
            </template>
            <div class="item-content">
              <div class="item-name">{{ item.card_name }}</div>
              <div class="item-price">
                <span class="symbol">¥</span>
                <span class="amount">{{ item.price }}</span>
              </div>
              <div class="item-info" v-if="item.duration_days">
                <el-icon><Timer /></el-icon>
                <span>有效期：{{ item.duration_days }} 天</span>
              </div>
              <div class="item-info" v-if="item.duration_hours">
                <el-icon><Clock /></el-icon>
                <span>时长：{{ item.duration_hours }} 小时</span>
              </div>
              <div class="item-info">
                <el-icon><Money /></el-icon>
                <span>折扣：{{ item.discount }}%</span>
              </div>
              <div class="item-desc" v-if="item.description">
                {{ item.description }}
              </div>
            </div>
            <template #footer>
              <div class="item-footer">
                <el-button type="primary" link @click="openDialog(item)">编辑</el-button>
                <el-button type="danger" link @click="handleDelete(item)">删除</el-button>
              </div>
            </template>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" @close="handleDialogClose">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="卡名称" prop="card_name">
              <el-input v-model="form.card_name" placeholder="请输入卡名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="卡类型" prop="card_type">
              <el-select v-model="form.card_type" placeholder="请选择类型" style="width: 100%" @change="onCardTypeChange">
                <el-option label="月卡" value="monthly" />
                <el-option label="时长卡" value="duration" />
                <el-option label="储值卡" value="stored" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="售价" prop="price">
              <el-input-number v-model="form.price" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="折扣(%)" prop="discount">
              <el-input-number v-model="form.discount" :min="0" :max="100" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="有效期(天)" v-if="form.card_type !== 'stored'">
          <el-input-number v-model="form.duration_days" :min="1" :precision="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="时长(小时)" v-if="form.card_type === 'duration'">
          <el-input-number v-model="form.duration_hours" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" active-text="上架" inactive-text="下架" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../utils/request'

const cardTypes = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const formRef = ref(null)
const isEdit = ref(false)
const submitting = ref(false)

const form = reactive({
  id: null,
  card_name: '',
  card_type: 'monthly',
  duration_days: 30,
  duration_hours: null,
  price: 0,
  discount: 100,
  status: true,
  description: ''
})

const rules = {
  card_name: [{ required: true, message: '请输入卡名称', trigger: 'change' }],
  card_type: [{ required: true, message: '请选择卡类型', trigger: 'change' }],
  price: [{ required: true, message: '请输入售价', trigger: 'change' }]
}

const dialogTitle = computed(() => isEdit.value ? '编辑卡类型' : '新增卡类型')

const getCardTypeText = (type) => {
  const map = { monthly: '月卡', duration: '时长卡', stored: '储值卡' }
  return map[type] || type
}

const getCardTypeTag = (type) => {
  const map = { monthly: 'primary', duration: 'success', stored: 'warning' }
  return map[type] || 'info'
}

const onCardTypeChange = (val) => {
  if (val === 'monthly') {
    form.duration_days = 30
    form.duration_hours = null
  } else if (val === 'duration') {
    form.duration_days = 365
    form.duration_hours = 10
  } else {
    form.duration_days = 365
    form.duration_hours = null
  }
}

const loadCardTypes = async () => {
  loading.value = true
  try {
    const res = await request.get('/card-types')
    cardTypes.value = (res.data || []).map(item => ({
      ...item,
      status: item.status === 1 || item.status === true
    }))
  } catch (error) {
    ElMessage.error('加载卡类型列表失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

const openDialog = (row = null) => {
  if (row) {
    isEdit.value = true
    Object.assign(form, {
      id: row.id,
      card_name: row.card_name,
      card_type: row.card_type,
      duration_days: row.duration_days ? Number(row.duration_days) : null,
      duration_hours: row.duration_hours ? Number(row.duration_hours) : null,
      price: Number(row.price),
      discount: Number(row.discount),
      status: row.status === 1 || row.status === true,
      description: row.description || ''
    })
  } else {
    isEdit.value = false
    Object.assign(form, {
      id: null,
      card_name: '',
      card_type: 'monthly',
      duration_days: 30,
      duration_hours: null,
      price: 0,
      discount: 100,
      status: true,
      description: ''
    })
  }
  dialogVisible.value = true
}

const handleDialogClose = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

const handleSubmit = async () => {
  try {
    const valid = await formRef.value.validate().catch(err => {
      console.error('表单验证失败:', err)
      return false
    })
    
    if (!valid) {
      ElMessage.warning('请填写必填项')
      return
    }
    
    submitting.value = true
    
    if (isEdit.value) {
      await request.put(`/card-types/${form.id}`, form)
      ElMessage.success('编辑成功')
    } else {
      await request.post('/card-types', form)
      ElMessage.success('新增成功')
    }
    
    dialogVisible.value = false
    await loadCardTypes()
  } catch (error) {
    console.error('提交失败:', error)
    if (error.response) {
      ElMessage.error('提交失败: ' + (error.response.data?.message || error.response.data?.error || '服务器错误'))
    } else if (error.request) {
      ElMessage.error('提交失败: 网络错误，请检查后端服务是否运行')
    } else {
      ElMessage.error('提交失败: ' + (error.message || '未知错误'))
    }
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该卡类型吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await request.delete(`/card-types/${row.id}`)
    ElMessage.success('删除成功')
    loadCardTypes()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadCardTypes()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mb-20 {
  margin-bottom: 20px;
}

.card-item {
  transition: all 0.3s;
}

.card-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-item.disabled {
  opacity: 0.6;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.item-price {
  margin-bottom: 16px;
}

.item-price .symbol {
  font-size: 16px;
  color: #f56c6c;
  font-weight: 500;
}

.item-price .amount {
  font-size: 32px;
  color: #f56c6c;
  font-weight: bold;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
}

.item-desc {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
  color: #909399;
  font-size: 13px;
  line-height: 1.5;
}

.item-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}
</style>
