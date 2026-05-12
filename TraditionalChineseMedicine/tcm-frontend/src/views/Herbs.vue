<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>中药材管理</span>
          <el-button type="primary" @click="openDialog()">
            <el-icon><Plus /></el-icon>新增药材
          </el-button>
        </div>
      </template>

      <div class="search-bar">
        <el-input v-model="searchKeyword" placeholder="搜索药材名称或拼音" clearable style="width: 300px">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="searchCategory" placeholder="按分类筛选" clearable style="width: 200px">
          <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
        </el-select>
        <el-button type="primary" @click="loadData">搜索</el-button>
      </div>

      <el-table :data="tableData" border stripe>
        <el-table-column prop="name" label="名称" width="120" />
        <el-table-column prop="pinyin" label="拼音" width="120" />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="nature" label="性味" width="120" />
        <el-table-column prop="meridian" label="归经" width="150" />
        <el-table-column prop="dosageRange" label="用量" width="120" />
        <el-table-column prop="efficacy" label="功效" show-overflow-tooltip />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="formData.id ? '编辑药材' : '新增药材'" width="600px">
      <el-form :model="formData" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="名称">
              <el-input v-model="formData.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="拼音">
              <el-input v-model="formData.pinyin" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类">
              <el-select v-model="formData.category" placeholder="选择分类" allow-create style="width: 100%">
                <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用量">
              <el-input v-model="formData.dosageRange" placeholder="如：3-10g" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性味">
              <el-input v-model="formData.nature" placeholder="如：甘、温" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="归经">
              <el-input v-model="formData.meridian" placeholder="如：脾、胃经" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="功效">
          <el-input v-model="formData.efficacy" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="禁忌">
          <el-input v-model="formData.contraindication" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formData.description" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { herbApi } from '../api'

const searchKeyword = ref('')
const searchCategory = ref('')
const tableData = ref([])
const dialogVisible = ref(false)
const categories = ['解表药', '清热药', '泻下药', '祛风湿药', '化湿药', '利水渗湿药', '温里药', '理气药', '消食药', '驱虫药', '止血药', '活血化瘀药', '化痰止咳平喘药', '安神药', '平肝息风药', '开窍药', '补虚药', '收涩药', '涌吐药', '攻毒杀虫止痒药']
const formData = ref({
  id: null,
  name: '',
  pinyin: '',
  alias: '',
  category: '',
  nature: '',
  meridian: '',
  efficacy: '',
  dosageRange: '',
  contraindication: '',
  description: ''
})

const loadData = async () => {
  tableData.value = await herbApi.list(searchKeyword.value, searchCategory.value) || []
}

const openDialog = (row = null) => {
  if (row) {
    formData.value = { ...row }
  } else {
    formData.value = {
      id: null,
      name: '',
      pinyin: '',
      alias: '',
      category: '',
      nature: '',
      meridian: '',
      efficacy: '',
      dosageRange: '',
      contraindication: '',
      description: ''
    }
  }
  dialogVisible.value = true
}

const handleSave = async () => {
  if (!formData.value.name) {
    ElMessage.warning('请输入药材名称')
    return
  }
  if (formData.value.id) {
    await herbApi.update(formData.value)
    ElMessage.success('更新成功')
  } else {
    await herbApi.save(formData.value)
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
  loadData()
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该药材吗？', '提示', { type: 'warning' }).then(async () => {
    await herbApi.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  }).catch(() => {})
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page-container { padding-bottom: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.search-bar { margin-bottom: 20px; display: flex; gap: 10px; }
</style>
