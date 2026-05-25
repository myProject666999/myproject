<template>
  <div>
    <div class="page-header">
      <h2>添加商品监控</h2>
    </div>
    
    <div class="card-container form-container">
      <el-steps :active="step" finish-status="success" style="margin-bottom: 30px;">
        <el-step title="输入商品链接" />
        <el-step title="确认商品信息" />
        <el-step title="设置监控参数" />
      </el-steps>
      
      <div v-if="step === 0">
        <el-form :model="form" label-width="100px" style="max-width: 600px;">
          <el-form-item label="商品链接" required>
            <el-input
              v-model="form.product_url"
              placeholder="请粘贴商品链接"
              size="large"
              @keyup.enter="handleFetchInfo"
            >
              <template #append>
                <el-button type="primary" :loading="loading" @click="handleFetchInfo">
                  获取信息
                </el-button>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item label="选择平台">
            <el-select v-model="form.platform" placeholder="请选择平台" style="width: 200px;">
              <el-option label="自动识别" value="" />
              <el-option label="淘宝" value="taobao" />
              <el-option label="京东" value="jd" />
              <el-option label="拼多多" value="pdd" />
              <el-option label="天猫" value="tmall" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-alert
              title="支持的网站"
              type="info"
              :closable="false"
              description="目前支持淘宝、京东、拼多多等主流电商平台的商品链接，其他网站可能需要手动填写信息。"
            />
          </el-form-item>
        </el-form>
      </div>
      
      <div v-if="step === 1">
        <el-row :gutter="24">
          <el-col :span="8">
            <div style="border: 1px solid #e4e7ed; border-radius: 8px; overflow: hidden;">
              <img
                v-if="form.image_url"
                :src="form.image_url"
                style="width: 100%; height: 300px; object-fit: contain;"
              />
              <div v-else style="height: 300px; display: flex; align-items: center; justify-content: center; background: #f5f7fa;">
                <el-icon :size="64" style="color: #c0c4cc;"><Picture /></el-icon>
              </div>
            </div>
          </el-col>
          <el-col :span="16">
            <el-form :model="form" label-width="100px">
              <el-form-item label="商品标题" required>
                <el-input v-model="form.title" placeholder="请输入商品标题" />
              </el-form-item>
              
              <el-form-item label="当前价格" required>
                <el-input-number
                  v-model="form.current_price"
                  :precision="2"
                  :min="0"
                  size="large"
                  style="width: 200px;"
                />
                <span style="margin-left: 10px; color: #909399;">元</span>
              </el-form-item>
              
              <el-form-item label="原价">
                <el-input-number
                  v-model="form.original_price"
                  :precision="2"
                  :min="0"
                  style="width: 200px;"
                />
                <span style="margin-left: 10px; color: #909399;">元</span>
              </el-form-item>
              
              <el-form-item label="货币">
                <el-select v-model="form.currency" style="width: 120px;">
                  <el-option label="人民币 CNY" value="CNY" />
                  <el-option label="美元 USD" value="USD" />
                  <el-option label="欧元 EUR" value="EUR" />
                </el-select>
              </el-form-item>
            </el-form>
          </el-col>
        </el-row>
        
        <div style="text-align: right; margin-top: 20px;">
          <el-button @click="step = 0">上一步</el-button>
          <el-button type="primary" @click="step = 2">下一步</el-button>
        </div>
      </div>
      
      <div v-if="step === 2">
        <el-form :model="form" label-width="120px" style="max-width: 600px;">
          <el-form-item label="商品分组">
            <el-select v-model="form.group_id" placeholder="请选择分组" clearable style="width: 200px;">
              <el-option
                v-for="group in groups"
                :key="group.id"
                :label="`${group.icon || '📁'} ${group.name}`"
                :value="group.id"
              />
            </el-select>
            <el-button link type="primary" @click="showAddGroup = true" style="margin-left: 10px;">
              新建分组
            </el-button>
          </el-form-item>
          
          <el-form-item label="抓取间隔">
            <el-select v-model="form.crawl_interval" style="width: 200px;">
              <el-option label="每 5 分钟" :value="300" />
              <el-option label="每 15 分钟" :value="900" />
              <el-option label="每 30 分钟" :value="1800" />
              <el-option label="每 1 小时" :value="3600" />
              <el-option label="每 6 小时" :value="21600" />
              <el-option label="每天" :value="86400" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="添加到收藏">
            <el-switch v-model="form.is_favorite" :active-value="1" :inactive-value="0" />
          </el-form-item>
          
          <el-form-item label="备注">
            <el-input
              v-model="form.remark"
              type="textarea"
              :rows="3"
              placeholder="可添加一些备注信息（可选）"
            />
          </el-form-item>
        </el-form>
        
        <div style="text-align: right; margin-top: 20px;">
          <el-button @click="step = 1">上一步</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            完成添加
          </el-button>
        </div>
      </div>
    </div>
    
    <el-dialog v-model="showAddGroup" title="新建分组" width="400px">
      <el-form :model="newGroup" label-width="80px">
        <el-form-item label="分组名称">
          <el-input v-model="newGroup.name" placeholder="请输入分组名称" />
        </el-form-item>
        <el-form-item label="分组图标">
          <el-select v-model="newGroup.icon" style="width: 100%;">
            <el-option label="📦 箱子" value="📦" />
            <el-option label="💻 电脑" value="💻" />
            <el-option label="👔 服装" value="👔" />
            <el-option label="📚 图书" value="📚" />
            <el-option label="🍔 食品" value="🍔" />
            <el-option label="🎮 游戏" value="🎮" />
            <el-option label="🎁 礼物" value="🎁" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddGroup = false">取消</el-button>
        <el-button type="primary" @click="handleCreateGroup">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { productApi, groupApi } from '@/api'
import { Picture } from '@element-plus/icons-vue'

const router = useRouter()
const step = ref(0)
const loading = ref(false)
const submitting = ref(false)
const groups = ref([])
const showAddGroup = ref(false)

const form = ref({
  product_url: '',
  platform: '',
  title: '',
  image_url: '',
  current_price: null,
  original_price: null,
  currency: 'CNY',
  group_id: null,
  crawl_interval: 3600,
  is_favorite: 0,
  remark: ''
})

const newGroup = ref({
  name: '',
  icon: '📦'
})

onMounted(() => {
  loadGroups()
})

const loadGroups = async () => {
  try {
    const res = await groupApi.getList()
    groups.value = res.data || []
  } catch (e) {
    console.error(e)
  }
}

const handleFetchInfo = async () => {
  if (!form.value.product_url) {
    ElMessage.warning('请先输入商品链接')
    return
  }
  
  loading.value = true
  try {
    // 这里模拟获取信息，实际应该调用后端接口
    // 或者直接跳转到下一步让用户手动填写
    ElMessage.info('请确认商品信息')
    step.value = 1
  } catch (e) {
    ElMessage.error('获取商品信息失败，请手动填写')
    step.value = 1
  } finally {
    loading.value = false
  }
}

const handleCreateGroup = async () => {
  if (!newGroup.value.name) {
    ElMessage.warning('请输入分组名称')
    return
  }
  
  try {
    await groupApi.create(newGroup.value)
    ElMessage.success('分组创建成功')
    showAddGroup.value = false
    loadGroups()
  } catch (e) {
    console.error(e)
  }
}

const handleSubmit = async () => {
  if (!form.value.title) {
    ElMessage.warning('请输入商品标题')
    return
  }
  if (!form.value.current_price) {
    ElMessage.warning('请输入商品价格')
    return
  }
  
  submitting.value = true
  try {
    const res = await productApi.create(form.value)
    ElMessage.success('添加成功')
    router.push(`/products/${res.data.id}`)
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}
</script>
