<template>
  <div class="new-card-page">
    <el-card>
      <template #header>
        <span>新建卡片</span>
      </template>

      <el-form :model="cardForm" label-width="100px" style="max-width: 800px; margin: 0 auto;">
        <el-form-item label="所属牌组">
          <el-select v-model="cardForm.deckId" placeholder="请选择牌组" style="width: 100%;">
            <el-option
              v-for="deck in decks"
              :key="deck.id"
              :label="deck.name"
              :value="deck.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="正面">
          <el-input
            v-model="cardForm.front"
            type="textarea"
            :rows="4"
            placeholder="请输入卡片正面内容（问题）"
          />
        </el-form-item>

        <el-form-item label="背面">
          <el-input
            v-model="cardForm.back"
            type="textarea"
            :rows="4"
            placeholder="请输入卡片背面内容（答案）"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="saveCard">保存卡片</el-button>
          <el-button @click="addAnother">保存并继续添加</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-top: 20px;">
      <template #header>
        <span>批量导入</span>
      </template>
      <p style="color: #606266; margin-bottom: 15px;">
        支持 CSV 格式，每行格式：正面内容,背面内容
      </p>
      <el-select v-model="importDeckId" placeholder="选择导入的牌组" style="width: 300px; margin-right: 10px;">
        <el-option
          v-for="deck in decks"
          :key="deck.id"
          :label="deck.name"
          :value="deck.id"
        />
      </el-select>
      <el-upload
        :show-file-list="false"
        :before-upload="handleImport"
        accept=".csv"
        :disabled="!importDeckId"
        style="display: inline-block;">
        <el-button type="success" :disabled="!importDeckId">
          <el-icon><Upload /></el-icon> 选择CSV文件
        </el-button>
      </el-upload>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { deckApi, cardApi } from '../services/api'
import { ElMessage } from 'element-plus'

const decks = ref([])
const importDeckId = ref(null)
const cardForm = ref({
  deckId: null,
  front: '',
  back: ''
})

const loadDecks = async () => {
  try {
    const response = await deckApi.getAllDecks()
    decks.value = response.data
    if (decks.value.length > 0) {
      cardForm.value.deckId = decks.value[0].id
    }
  } catch (error) {
    ElMessage.error('加载牌组失败')
  }
}

const saveCard = async () => {
  if (!validateForm()) return

  try {
    await cardApi.createCard(cardForm.value)
    ElMessage.success('卡片创建成功')
    resetForm()
  } catch (error) {
    ElMessage.error('创建卡片失败')
  }
}

const addAnother = async () => {
  if (!validateForm()) return

  try {
    await cardApi.createCard(cardForm.value)
    ElMessage.success('卡片创建成功，继续添加下一张')
    cardForm.value.front = ''
    cardForm.value.back = ''
  } catch (error) {
    ElMessage.error('创建卡片失败')
  }
}

const validateForm = () => {
  if (!cardForm.value.deckId) {
    ElMessage.warning('请选择牌组')
    return false
  }
  if (!cardForm.value.front.trim()) {
    ElMessage.warning('请输入卡片正面内容')
    return false
  }
  if (!cardForm.value.back.trim()) {
    ElMessage.warning('请输入卡片背面内容')
    return false
  }
  return true
}

const handleImport = async (file) => {
  if (!importDeckId.value) {
    ElMessage.warning('请先选择导入的牌组')
    return false
  }

  try {
    await cardApi.importCards(importDeckId.value, file)
    ElMessage.success('导入成功')
  } catch (error) {
    ElMessage.error('导入失败')
  }
  return false
}

const resetForm = () => {
  cardForm.value = {
    deckId: decks.value.length > 0 ? decks.value[0].id : null,
    front: '',
    back: ''
  }
}

onMounted(() => {
  loadDecks()
})
</script>

<style scoped>
.new-card-page {
  max-width: 900px;
  margin: 0 auto;
}
</style>
