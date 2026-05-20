<template>
  <div class="game-management">
    <div class="page-header">
      <h2>游戏管理</h2>
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon>
        添加游戏
      </el-button>
    </div>

    <el-table :data="games" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="游戏名称" min-width="180" />
      <el-table-column prop="genre" label="类型" width="120" />
      <el-table-column prop="developer" label="开发商" width="150" />
      <el-table-column prop="publisher" label="发行商" width="150" />
      <el-table-column prop="price" label="价格" width="100">
        <template #default="{ row }">
          ¥{{ row.price }}
        </template>
      </el-table-column>
      <el-table-column prop="platform" label="平台" width="100" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="editGame(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteGame(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑游戏' : '添加游戏'" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="游戏名称">
          <el-input v-model="form.name" placeholder="请输入游戏名称" />
        </el-form-item>
        <el-form-item label="Steam App ID">
          <el-input-number v-model="form.steamAppId" :min="0" />
        </el-form-item>
        <el-form-item label="类型">
          <el-input v-model="form.genre" placeholder="如：动作RPG" />
        </el-form-item>
        <el-form-item label="开发商">
          <el-input v-model="form.developer" placeholder="请输入开发商" />
        </el-form-item>
        <el-form-item label="发行商">
          <el-input v-model="form.publisher" placeholder="请输入发行商" />
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number v-model="form.price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="平台">
          <el-input v-model="form.platform" placeholder="如：PC" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveGame">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { gameApi } from '../api'

const games = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)

const form = reactive({
  id: null,
  name: '',
  steamAppId: null,
  genre: '',
  developer: '',
  publisher: '',
  price: 0,
  platform: 'PC',
  description: ''
})

const loadGames = async () => {
  try {
    const res = await gameApi.getGames()
    if (res.code === 200) {
      games.value = res.data
    }
  } catch (error) {
    ElMessage.error('加载游戏列表失败')
  }
}

const openAddDialog = () => {
  isEdit.value = false
  Object.assign(form, {
    id: null,
    name: '',
    steamAppId: null,
    genre: '',
    developer: '',
    publisher: '',
    price: 0,
    platform: 'PC',
    description: ''
  })
  dialogVisible.value = true
}

const editGame = (row) => {
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

const saveGame = async () => {
  try {
    let res
    if (isEdit.value) {
      res = await gameApi.updateGame(form)
    } else {
      res = await gameApi.addGame(form)
    }
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
      dialogVisible.value = false
      loadGames()
    }
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const deleteGame = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个游戏吗？', '提示', {
      type: 'warning'
    })
    const res = await gameApi.deleteGame(id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadGames()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadGames()
})
</script>

<style scoped>
.game-management {
  padding: 20px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>
