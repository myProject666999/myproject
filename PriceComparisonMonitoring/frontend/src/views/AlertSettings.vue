<template>
  <div>
    <div class="page-header">
      <h2>提醒设置</h2>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        添加提醒
      </el-button>
    </div>
    
    <div class="card-container">
      <div class="search-bar">
        <el-select v-model="filterProduct" placeholder="选择商品" clearable style="width: 200px;" @change="loadAlerts">
          <el-option
            v-for="product in products"
            :key="product.id"
            :label="product.title"
            :value="product.id"
          />
        </el-select>
        
        <el-select v-model="filterType" placeholder="提醒类型" clearable style="width: 150px;" @change="loadAlerts">
          <el-option label="降价提醒" value="price_drop" />
          <el-option label="价格阈值" value="below_threshold" />
          <el-option label="每日提醒" value="daily" />
          <el-option label="每周提醒" value="weekly" />
        </el-select>
      </div>
      
      <div v-if="alerts.length === 0" class="empty-state">
        <el-icon class="empty-icon"><Bell /></el-icon>
        <p class="empty-text">暂无提醒设置</p>
        <el-button type="primary" style="margin-top: 16px;" @click="showAddDialog = true">
          添加第一个提醒
        </el-button>
      </div>
      
      <div v-else>
        <div v-for="alert in alerts" :key="alert.id" class="alert-item">
          <div>
            <div class="alert-type">
              <el-tag :type="getAlertTypeTag(alert.alert_type)">
                {{ getAlertTypeName(alert.alert_type) }}
              </el-tag>
              <span style="margin-left: 10px;">
                {{ getProductTitle(alert.product_id) }}
              </span>
            </div>
            <div class="alert-config" style="margin-top: 8px;">
              <span v-if="alert.threshold_price">
                价格阈值: ¥{{ alert.threshold_price.toFixed(2) }}
              </span>
              <span v-if="alert.threshold_percent">
                降价幅度: {{ alert.threshold_percent }}%
              </span>
              <span style="margin-left: 10px;">
                通知:
                <el-tag v-if="alert.notify_email" size="small" style="margin-left: 4px;">邮件</el-tag>
                <el-tag v-if="alert.notify_sms" size="small" style="margin-left: 4px;">短信</el-tag>
                <el-tag v-if="alert.notify_wechat" size="small" style="margin-left: 4px;">微信</el-tag>
                <el-tag v-if="alert.notify_webpush" size="small" style="margin-left: 4px;">网页</el-tag>
              </span>
            </div>
          </div>
          
          <div>
            <el-switch
              v-model="alert.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleToggleStatus(alert)"
              style="margin-right: 16px;"
            />
            <el-button link type="danger" @click="handleDelete(alert)">
              删除
            </el-button>
          </div>
        </div>
      </div>
    </div>
    
    <el-dialog v-model="showAddDialog" title="添加提醒" width="500px">
      <el-form :model="alertForm" label-width="100px">
        <el-form-item label="选择商品" required>
          <el-select v-model="alertForm.product_id" placeholder="请选择商品" style="width: 100%;">
            <el-option
              v-for="product in products"
              :key="product.id"
              :label="product.title"
              :value="product.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="提醒类型" required>
          <el-select v-model="alertForm.alert_type" placeholder="请选择提醒类型" style="width: 100%;">
            <el-option label="降价提醒" value="price_drop" />
            <el-option label="价格阈值" value="below_threshold" />
            <el-option label="每日提醒" value="daily" />
            <el-option label="每周提醒" value="weekly" />
          </el-select>
        </el-form-item>
        
        <el-form-item v-if="alertForm.alert_type === 'below_threshold'" label="价格阈值" required>
          <el-input-number
            v-model="alertForm.threshold_price"
            :precision="2"
            :min="0"
            placeholder="低于此价格时提醒"
            style="width: 200px;"
          />
          <span style="margin-left: 10px;">元</span>
        </el-form-item>
        
        <el-form-item v-if="alertForm.alert_type === 'price_drop'" label="降价幅度">
          <el-input-number
            v-model="alertForm.threshold_percent"
            :precision="1"
            :min="0"
            :max="100"
            placeholder="降价超过此百分比时提醒"
            style="width: 200px;"
          />
          <span style="margin-left: 10px;">%</span>
        </el-form-item>
        
        <el-form-item label="通知方式">
          <el-checkbox-group v-model="notifyChannels">
            <el-checkbox label="email">邮件</el-checkbox>
            <el-checkbox label="webpush">网页推送</el-checkbox>
            <el-checkbox label="wechat">微信</el-checkbox>
            <el-checkbox label="sms">短信</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { alertApi, productApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const alerts = ref([])
const products = ref([])
const filterProduct = ref('')
const filterType = ref('')
const showAddDialog = ref(false)

const alertForm = ref({
  product_id: null,
  alert_type: '',
  threshold_price: null,
  threshold_percent: null,
  notify_email: 1,
  notify_sms: 0,
  notify_wechat: 0,
  notify_webpush: 1
})

const notifyChannels = ref(['email', 'webpush'])

onMounted(() => {
  loadProducts()
  loadAlerts()
})

const loadProducts = async () => {
  try {
    const res = await productApi.getList({ page: 1, page_size: 100 })
    products.value = res.data?.list || []
  } catch (e) {
    console.error(e)
  }
}

const loadAlerts = async () => {
  try {
    const params = {}
    if (filterProduct.value) {
      params.product_id = filterProduct.value
    }
    if (filterType.value) {
      params.alert_type = filterType.value
    }
    const res = await alertApi.getList(params)
    alerts.value = res.data || []
  } catch (e) {
    console.error(e)
  }
}

const getProductTitle = (productId) => {
  const product = products.value.find(p => p.id === productId)
  return product ? product.title : '未知商品'
}

const getAlertTypeName = (type) => {
  const map = {
    price_drop: '降价提醒',
    below_threshold: '价格阈值',
    daily: '每日提醒',
    weekly: '每周提醒'
  }
  return map[type] || type
}

const getAlertTypeTag = (type) => {
  const map = {
    price_drop: 'danger',
    below_threshold: 'warning',
    daily: 'info',
    weekly: 'success'
  }
  return map[type] || ''
}

const handleToggleStatus = async (alert) => {
  try {
    await alertApi.update(alert.id, { status: alert.status })
    ElMessage.success(alert.status === 1 ? '已启用' : '已禁用')
  } catch (e) {
    console.error(e)
  }
}

const handleDelete = (alert) => {
  ElMessageBox.confirm('确定要删除这个提醒吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await alertApi.delete(alert.id)
      ElMessage.success('删除成功')
      loadAlerts()
    } catch (e) {
      console.error(e)
    }
  }).catch(() => {})
}

const handleCreate = async () => {
  if (!alertForm.value.product_id) {
    ElMessage.warning('请选择商品')
    return
  }
  if (!alertForm.value.alert_type) {
    ElMessage.warning('请选择提醒类型')
    return
  }
  
  const channels = notifyChannels.value
  alertForm.value.notify_email = channels.includes('email') ? 1 : 0
  alertForm.value.notify_sms = channels.includes('sms') ? 1 : 0
  alertForm.value.notify_wechat = channels.includes('wechat') ? 1 : 0
  alertForm.value.notify_webpush = channels.includes('webpush') ? 1 : 0
  
  try {
    await alertApi.create(alertForm.value)
    ElMessage.success('提醒创建成功')
    showAddDialog.value = false
    loadAlerts()
    
    alertForm.value = {
      product_id: null,
      alert_type: '',
      threshold_price: null,
      threshold_percent: null,
      notify_email: 1,
      notify_sms: 0,
      notify_wechat: 0,
      notify_webpush: 1
    }
    notifyChannels.value = ['email', 'webpush']
  } catch (e) {
    console.error(e)
  }
}
</script>
