<template>
  <div class="page-container">
    <div class="detail-header" v-if="itinerary">
      <div>
        <el-button @click="$router.back()" plain>
          <el-icon><ArrowLeft /></el-icon> 返回
        </el-button>
        <h2 class="itinerary-name">{{ itinerary.name }}</h2>
        <div class="itinerary-meta">
          <span v-if="itinerary.destination">
            <el-icon><Location /></el-icon> {{ itinerary.destination }}
          </span>
          <span v-if="itinerary.days">
            <el-icon><Calendar /></el-icon> {{ itinerary.days }} 天
          </span>
        </div>
      </div>
      <div class="header-actions">
        <el-button @click="showAddDialog = true">
          <el-icon><Plus /></el-icon> 添加物品
        </el-button>
        <el-button type="primary" @click="showShareDialog = true">
          <el-icon><Share /></el-icon> 共享
        </el-button>
      </div>
    </div>

    <div class="progress-section" v-if="items.length > 0">
      <el-progress :percentage="progressPercent" :status="progressPercent === 100 ? 'success' : ''" />
      <p class="progress-text">{{ checkedCount }} / {{ items.length }} 件物品已准备</p>
    </div>

    <div v-for="category in groupedItems" :key="category.categoryId" class="category-section">
      <div class="category-title">
        <span>{{ getCategoryIcon(category.categoryId) }}</span>
        <span>{{ getCategoryName(category.categoryId) }}</span>
        <span class="category-count">({{ category.items.length }})</span>
      </div>
      <el-table :data="category.items" style="width: 100%">
        <el-table-column width="50">
          <template #default="{ row }">
            <el-checkbox :model-value="row.isChecked === 1" @change="(val) => handleCheck(row, val)" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="物品名称">
          <template #default="{ row }">
            <span :class="{ 'item-checked': row.isChecked === 1 }">{{ row.name }}</span>
            <el-tag v-if="row.isCustom === 1" size="small" type="info" style="margin-left: 8px;">自定义</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="100" />
        <el-table-column prop="description" label="备注" />
        <el-table-column width="80">
          <template #default="{ row }">
            <el-button type="danger" link @click="handleDeleteItem(row)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-empty v-if="items.length === 0" description="清单为空，点击上方按钮添加物品" />

    <el-dialog v-model="showAddDialog" title="添加自定义物品" width="400px">
      <el-form :model="addForm" label-width="80px">
        <el-form-item label="物品名称">
          <el-input v-model="addForm.name" placeholder="请输入物品名称" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="addForm.categoryId" placeholder="请选择分类">
            <el-option v-for="cat in categories" :key="cat.id" :label="`${cat.icon} ${cat.name}`" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="数量">
          <el-input-number v-model="addForm.quantity" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="addForm.description" placeholder="备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddItem">添加</el-button>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getItineraryItems,
  addCustomItem,
  checkItem,
  deleteItem,
  getCategories,
  createShare
} from '@/api'

const route = useRoute()
const itineraryId = route.params.id
const itinerary = ref({})
const items = ref([])
const categories = ref([])
const showAddDialog = ref(false)
const showShareDialog = ref(false)
const shareResult = ref(null)

const addForm = ref({
  name: '',
  categoryId: null,
  quantity: 1,
  description: ''
})

const shareForm = ref({
  canEdit: false,
  expireDays: null
})

const checkedCount = computed(() => items.value.filter(i => i.isChecked === 1).length)
const progressPercent = computed(() => items.value.length > 0 ? Math.round((checkedCount.value / items.value.length) * 100) : 0)

const groupedItems = computed(() => {
  const groups = {}
  items.value.forEach(item => {
    const cid = item.categoryId || 0
    if (!groups[cid]) {
      groups[cid] = { categoryId: cid, items: [] }
    }
    groups[cid].items.push(item)
  })
  return Object.values(groups)
})

onMounted(() => {
  loadItems()
  loadCategories()
})

async function loadItems() {
  items.value = await getItineraryItems(itineraryId)
}

async function loadCategories() {
  categories.value = await getCategories()
}

function getCategoryName(id) {
  const cat = categories.value.find(c => c.id === id)
  return cat?.name || '其他'
}

function getCategoryIcon(id) {
  const cat = categories.value.find(c => c.id === id)
  return cat?.icon || '📦'
}

async function handleCheck(row, checked) {
  await checkItem(row.id, checked)
  row.isChecked = checked ? 1 : 0
}

async function handleAddItem() {
  if (!addForm.value.name) {
    ElMessage.warning('请输入物品名称')
    return
  }
  await addCustomItem(itineraryId, addForm.value)
  ElMessage.success('添加成功')
  showAddDialog.value = false
  loadItems()
  addForm.value = { name: '', categoryId: null, quantity: 1, description: '' }
}

async function handleDeleteItem(row) {
  ElMessageBox.confirm('确定要删除这个物品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await deleteItem(row.id)
    ElMessage.success('删除成功')
    loadItems()
  }).catch(() => {})
}

async function handleCreateShare() {
  const res = await createShare({
    itineraryId,
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
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.itinerary-name {
  margin: 12px 0 8px 0;
}

.itinerary-meta {
  display: flex;
  gap: 20px;
  color: #606266;
}

.itinerary-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.progress-section {
  margin-bottom: 30px;
  text-align: center;
}

.progress-text {
  margin-top: 8px;
  color: #606266;
}

.category-count {
  color: #909399;
  font-weight: normal;
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
