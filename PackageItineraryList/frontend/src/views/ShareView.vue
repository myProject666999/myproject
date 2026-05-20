<template>
  <div class="share-container">
    <div class="share-card" v-if="share">
      <div class="share-header">
        <h2>📋 共享行程清单</h2>
        <p class="share-info">邀请你一同准备行程物品</p>
      </div>
      
      <div v-if="!joined" class="join-section">
        <el-input v-model="nickname" placeholder="请输入你的昵称" />
        <el-button type="primary" style="width: 100%; margin-top: 12px;" @click="handleJoin">
          加入行程
        </el-button>
      </div>

      <div v-else class="items-section">
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
                <el-checkbox :model-value="row.isChecked === 1" @change="(val) => handleCheck(row, val)" :disabled="!canEdit" />
              </template>
            </el-table-column>
            <el-table-column prop="name" label="物品名称">
              <template #default="{ row }">
                <span :class="{ 'item-checked': row.isChecked === 1 }">{{ row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="100" />
            <el-table-column prop="description" label="备注" />
          </el-table>
        </div>
      </div>
    </div>

    <el-empty v-else description="分享链接无效或已过期" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getShare, joinShare, getItineraryItems, checkItem, getCategories } from '@/api'

const route = useRoute()
const shareCode = route.params.code
const share = ref(null)
const items = ref([])
const categories = ref([])
const nickname = ref('')
const joined = ref(false)
const canEdit = ref(false)

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
  loadShare()
  loadCategories()
})

async function loadShare() {
  try {
    share.value = await getShare(shareCode)
    canEdit.value = share.value.canEdit === 1
  } catch (e) {
    share.value = null
  }
}

async function loadCategories() {
  categories.value = await getCategories()
}

async function loadItems() {
  if (share.value) {
    items.value = await getItineraryItems(share.value.itineraryId)
  }
}

async function handleJoin() {
  if (!nickname.value) {
    ElMessage.warning('请输入昵称')
    return
  }
  try {
    await joinShare({ shareCode, nickname: nickname.value })
    joined.value = true
    loadItems()
  } catch (e) {
    console.error(e)
  }
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
  if (!canEdit.value) return
  await checkItem(row.id, checked)
  row.isChecked = checked ? 1 : 0
}
</script>

<style scoped>
.share-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.share-card {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  max-width: 800px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.share-header {
  text-align: center;
  margin-bottom: 30px;
}

.share-header h2 {
  margin: 0 0 8px 0;
}

.share-info {
  color: #909399;
  margin: 0;
}

.join-section {
  max-width: 400px;
  margin: 0 auto;
}

.items-section {
  margin-top: 20px;
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
</style>
