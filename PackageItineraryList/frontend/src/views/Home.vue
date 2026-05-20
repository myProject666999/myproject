<template>
  <div class="page-container">
    <div class="page-header">
      <h2>我的行程清单</h2>
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>
        新建行程
      </el-button>
    </div>

    <el-empty v-if="itineraries.length === 0" description="还没有行程清单，点击上方按钮创建一个吧" />

    <el-row v-else :gutter="20">
      <el-col :xs="24" :sm="12" :md="8" v-for="item in itineraries" :key="item.id">
        <el-card class="card-hover itinerary-card" @click="goToDetail(item.id)">
          <template #header>
            <div class="card-header">
              <span class="card-title">{{ item.name }}</span>
              <el-dropdown @command="(cmd) => handleCardAction(cmd, item)">
                <el-icon class="more-icon"><MoreFilled /></el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="share">
                      <el-icon><Share /></el-icon> 共享
                    </el-dropdown-item>
                    <el-dropdown-item command="delete" divided>
                      <el-icon><Delete /></el-icon> 删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
          <div class="card-content">
            <p v-if="item.destination">
              <el-icon><Location /></el-icon> {{ item.destination }}
            </p>
            <p v-if="item.days">
              <el-icon><Calendar /></el-icon> {{ item.days }} 天
            </p>
            <p class="create-time">
              创建于: {{ formatDate(item.createdAt) }}
            </p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="showCreateDialog" title="新建行程清单" width="500px">
      <el-form :model="createForm" label-width="80px">
        <el-form-item label="行程名称">
          <el-input v-model="createForm.name" placeholder="请输入行程名称" />
        </el-form-item>
        <el-form-item label="选择模板">
          <el-select v-model="createForm.templateId" placeholder="请选择场景模板" clearable>
            <el-option v-for="tpl in templates" :key="tpl.id" :label="`${tpl.icon} ${tpl.name}`" :value="tpl.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="天数">
          <el-input-number v-model="createForm.days" :min="1" :max="30" />
        </el-form-item>
        <el-form-item label="目的地">
          <el-input v-model="createForm.destination" placeholder="请输入目的地" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="createForm.notes" type="textarea" :rows="3" placeholder="备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">创建</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showShareDialog" title="共享行程" width="400px">
      <el-form :model="shareForm" label-width="80px">
        <el-form-item label="可编辑">
          <el-switch v-model="shareForm.canEdit" />
        </el-form-item>
        <el-form-item label="有效期">
          <el-select v-model="shareForm.expireDays" placeholder="选择有效期">
            <el-option label="永久有效" :value="null" />
            <el-option label="7天" :value="7" />
            <el-option label="30天" :value="30" />
          </el-select>
        </el-form-item>
      </el-form>
      <el-button type="primary" style="width: 100%" @click="handleCreateShare">生成共享链接</el-button>
      <div v-if="shareResult" class="share-result">
        <el-input :value="shareResult.shareUrl" readonly>
          <template #append>
            <el-button @click="copyShareLink">复制</el-button>
          </template>
        </el-input>
        <p class="share-code">分享码: {{ shareResult.shareCode }}</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import {
  getUserItineraries,
  getPublicTemplates,
  createItinerary,
  createShare,
  deleteItinerary
} from '@/api'

const router = useRouter()
const itineraries = ref([])
const templates = ref([])
const showCreateDialog = ref(false)
const showShareDialog = ref(false)
const currentItinerary = ref(null)
const shareResult = ref(null)

const createForm = ref({
  name: '',
  templateId: null,
  days: 3,
  destination: '',
  notes: ''
})

const shareForm = ref({
  canEdit: false,
  expireDays: null
})

onMounted(() => {
  loadItineraries()
  loadTemplates()
})

async function loadItineraries() {
  itineraries.value = await getUserItineraries()
}

async function loadTemplates() {
  templates.value = await getPublicTemplates()
}

function formatDate(date) {
  return dayjs(date).format('YYYY-MM-DD')
}

function goToDetail(id) {
  router.push(`/itinerary/${id}`)
}

async function handleCreate() {
  if (!createForm.value.name) {
    ElMessage.warning('请输入行程名称')
    return
  }
  const res = await createItinerary(createForm.value)
  ElMessage.success('创建成功')
  showCreateDialog.value = false
  loadItineraries()
  createForm.value = { name: '', templateId: null, days: 3, destination: '', notes: '' }
  router.push(`/itinerary/${res.id}`)
}

function handleCardAction(cmd, item) {
  if (cmd === 'share') {
    currentItinerary.value = item
    shareResult.value = null
    showShareDialog.value = true
  } else if (cmd === 'delete') {
    ElMessageBox.confirm('确定要删除这个行程清单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await deleteItinerary(item.id)
      ElMessage.success('删除成功')
      loadItineraries()
    }).catch(() => {})
  }
}

async function handleCreateShare() {
  const res = await createShare({
    itineraryId: currentItinerary.value.id,
    canEdit: shareForm.value.canEdit,
    expireDays: shareForm.value.expireDays
  })
  res.shareUrl = `${window.location.origin}/share/${res.shareCode}`
  shareResult.value = res
}

function copyShareLink() {
  navigator.clipboard.writeText(shareResult.value.shareUrl)
  ElMessage.success('已复制到剪贴板')
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.itinerary-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-weight: 600;
  font-size: 16px;
}

.more-icon {
  cursor: pointer;
  font-size: 18px;
}

.card-content p {
  margin: 8px 0;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 6px;
}

.create-time {
  font-size: 12px;
  color: #909399 !important;
  margin-top: 12px !important;
}

.share-result {
  margin-top: 20px;
}

.share-code {
  text-align: center;
  margin-top: 12px;
  color: #606266;
}
</style>
