<template>
  <div class="decks-page">
    <div class="page-header">
      <h2>牌组管理</h2>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon> 新建牌组
      </el-button>
    </div>

    <el-row :gutter="20">
      <el-col :span="8" v-for="deck in decks" :key="deck.id">
        <el-card class="deck-card" @click="goToDeckDetail(deck.id)">
          <template #header>
            <div class="deck-header">
              <span class="deck-name">{{ deck.name }}</span>
              <el-dropdown @click.stop>
                <el-button type="text" size="small" @click.stop>
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click.stop="editDeck(deck)">编辑</el-dropdown-item>
                    <el-dropdown-item @click.stop="deleteDeck(deck.id)" divided>删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
          <p class="deck-desc">{{ deck.description || '暂无描述' }}</p>
          <div class="deck-stats">
            <el-tag type="info">卡片: {{ getDeckCardCount(deck.id) }}</el-tag>
            <el-tag type="warning" v-if="getDeckDueCount(deck.id) > 0">
              待复习: {{ getDeckDueCount(deck.id) }}
            </el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="showAddDialog" :title="editingDeck ? '编辑牌组' : '新建牌组'" width="500px">
      <el-form :model="deckForm" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="deckForm.name" placeholder="请输入牌组名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="deckForm.description" type="textarea" :rows="3" placeholder="请输入牌组描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="saveDeck">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { deckApi, cardApi } from '../services/api'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const decks = ref([])
const showAddDialog = ref(false)
const editingDeck = ref(null)
const deckForm = ref({
  name: '',
  description: ''
})
const deckStats = ref({})

const loadDecks = async () => {
  try {
    const response = await deckApi.getAllDecks()
    decks.value = response.data
    for (const deck of decks.value) {
      await loadDeckStats(deck.id)
    }
  } catch (error) {
    ElMessage.error('加载牌组失败')
  }
}

const loadDeckStats = async (deckId) => {
  try {
    const [cardsResponse, dueResponse] = await Promise.all([
      cardApi.getCardsByDeckId(deckId),
      cardApi.getDueCardsByDeckId(deckId)
    ])
    deckStats.value[deckId] = {
      total: cardsResponse.data.length,
      due: dueResponse.data.length
    }
  } catch (error) {
    deckStats.value[deckId] = { total: 0, due: 0 }
  }
}

const getDeckCardCount = (deckId) => {
  return deckStats.value[deckId]?.total || 0
}

const getDeckDueCount = (deckId) => {
  return deckStats.value[deckId]?.due || 0
}

const goToDeckDetail = (deckId) => {
  router.push(`/deck/${deckId}`)
}

const editDeck = (deck) => {
  editingDeck.value = deck
  deckForm.value = {
    name: deck.name,
    description: deck.description || ''
  }
  showAddDialog.value = true
}

const saveDeck = async () => {
  if (!deckForm.value.name.trim()) {
    ElMessage.warning('请输入牌组名称')
    return
  }

  try {
    if (editingDeck.value) {
      await deckApi.updateDeck(editingDeck.value.id, deckForm.value)
      ElMessage.success('牌组更新成功')
    } else {
      await deckApi.createDeck(deckForm.value)
      ElMessage.success('牌组创建成功')
    }
    showAddDialog.value = false
    resetForm()
    loadDecks()
  } catch (error) {
    ElMessage.error('保存牌组失败')
  }
}

const deleteDeck = async (deckId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个牌组吗？删除后所有卡片也将被删除。', '确认删除', {
      type: 'warning'
    })
    await deckApi.deleteDeck(deckId)
    ElMessage.success('牌组删除成功')
    loadDecks()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除牌组失败')
    }
  }
}

const resetForm = () => {
  editingDeck.value = null
  deckForm.value = {
    name: '',
    description: ''
  }
}

onMounted(() => {
  loadDecks()
})
</script>

<style scoped>
.decks-page {
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
}

.deck-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.deck-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.deck-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.deck-name {
  font-weight: bold;
  font-size: 16px;
}

.deck-desc {
  color: #606266;
  min-height: 40px;
  margin-bottom: 15px;
}

.deck-stats {
  display: flex;
  gap: 10px;
}
</style>
