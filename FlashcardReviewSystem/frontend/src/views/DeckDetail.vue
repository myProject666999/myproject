<template>
  <div class="deck-detail-page">
    <div class="page-header">
      <el-button @click="$router.push('/decks')">
        <el-icon><ArrowLeft /></el-icon> 返回
      </el-button>
      <h2>{{ deck?.name }}</h2>
      <div>
        <el-button type="primary" @click="showAddCardDialog = true">
          <el-icon><Plus /></el-icon> 添加卡片
        </el-button>
        <el-upload
          :show-file-list="false"
          :before-upload="handleImport"
          accept=".csv"
          style="display: inline-block; margin-left: 10px;">
          <el-button type="success">
            <el-icon><Upload /></el-icon> 导入CSV
          </el-button>
        </el-upload>
      </div>
    </div>

    <el-card v-if="deck">
      <template #header>
        <div class="card-header">
          <span>卡片列表</span>
          <span style="color: #909399;">共 {{ cards.length }} 张卡片</span>
        </div>
      </template>

      <el-table :data="cards" style="width: 100%">
        <el-table-column prop="front" label="正面" min-width="200">
          <template #default="{ row }">
            <div class="card-content">{{ row.front }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="back" label="背面" min-width="200">
          <template #default="{ row }">
            <div class="card-content">{{ row.back }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="repetitions" label="复习次数" width="100" />
        <el-table-column prop="easeFactor" label="难度因子" width="100">
          <template #default="{ row }">
            {{ row.easeFactor?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="nextReviewDate" label="下次复习" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" text size="small" @click="editCard(row)">编辑</el-button>
            <el-button type="danger" text size="small" @click="deleteCard(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="showAddCardDialog" :title="editingCard ? '编辑卡片' : '添加卡片'" width="600px">
      <el-form :model="cardForm" label-width="80px">
        <el-form-item label="正面">
          <el-input v-model="cardForm.front" type="textarea" :rows="3" placeholder="请输入卡片正面内容" />
        </el-form-item>
        <el-form-item label="背面">
          <el-input v-model="cardForm.back" type="textarea" :rows="3" placeholder="请输入卡片背面内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddCardDialog = false">取消</el-button>
        <el-button type="primary" @click="saveCard">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { deckApi, cardApi } from '../services/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const deckId = route.params.id
const deck = ref(null)
const cards = ref([])
const showAddCardDialog = ref(false)
const editingCard = ref(null)
const cardForm = ref({
  front: '',
  back: ''
})

const loadDeck = async () => {
  try {
    const response = await deckApi.getDeckById(deckId)
    deck.value = response.data
  } catch (error) {
    ElMessage.error('加载牌组失败')
  }
}

const loadCards = async () => {
  try {
    const response = await cardApi.getCardsByDeckId(deckId)
    cards.value = response.data
  } catch (error) {
    ElMessage.error('加载卡片失败')
  }
}

const editCard = (card) => {
  editingCard.value = card
  cardForm.value = {
    front: card.front,
    back: card.back
  }
  showAddCardDialog.value = true
}

const saveCard = async () => {
  if (!cardForm.value.front.trim() || !cardForm.value.back.trim()) {
    ElMessage.warning('请填写卡片正反面内容')
    return
  }

  try {
    if (editingCard.value) {
      await cardApi.updateCard(editingCard.value.id, { ...cardForm.value, deckId })
      ElMessage.success('卡片更新成功')
    } else {
      await cardApi.createCard({ ...cardForm.value, deckId })
      ElMessage.success('卡片添加成功')
    }
    showAddCardDialog.value = false
    resetCardForm()
    loadCards()
  } catch (error) {
    ElMessage.error('保存卡片失败')
  }
}

const deleteCard = async (cardId) => {
  try {
    await ElMessageBox.confirm('确定要删除这张卡片吗？', '确认删除', {
      type: 'warning'
    })
    await cardApi.deleteCard(cardId)
    ElMessage.success('卡片删除成功')
    loadCards()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除卡片失败')
    }
  }
}

const handleImport = async (file) => {
  try {
    await cardApi.importCards(deckId, file)
    ElMessage.success('导入成功')
    loadCards()
  } catch (error) {
    ElMessage.error('导入失败')
  }
  return false
}

const resetCardForm = () => {
  editingCard.value = null
  cardForm.value = {
    front: '',
    back: ''
  }
}

onMounted(() => {
  loadDeck()
  loadCards()
})
</script>

<style scoped>
.deck-detail-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  flex: 1;
  text-align: center;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
