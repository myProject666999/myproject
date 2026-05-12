<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>方剂模板库</span>
          <div>
            <el-tag type="success" style="margin-right: 15px">经典方剂学习库</el-tag>
            <el-button type="primary" @click="openDialog()">
              <el-icon><Plus /></el-icon>新增模板
            </el-button>
          </div>
        </div>
      </template>

      <div class="search-bar">
        <el-input v-model="searchKeyword" placeholder="搜索方剂名称" clearable style="width: 250px">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="searchCategory" placeholder="按分类筛选" clearable style="width: 200px">
          <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
        </el-select>
        <el-checkbox v-model="onlyClassic" style="margin-left: 20px">只显示经典方剂</el-checkbox>
        <el-button type="primary" @click="loadData">搜索</el-button>
      </div>

      <el-row :gutter="20">
        <el-col :span="8" v-for="t in tableData" :key="t.id" style="margin-bottom: 20px">
          <el-card shadow="hover" class="template-card">
            <template #header>
              <div class="template-header">
                <span class="template-name">{{ t.name }}</span>
                <el-tag v-if="t.isClassic === 1" type="success" effect="dark" size="small">经典</el-tag>
              </div>
            </template>
            <div class="template-info">
              <p><strong>来源：</strong>{{ t.source || '-' }}</p>
              <p><strong>分类：</strong>{{ t.category || '-' }}</p>
              <p><strong>功效：</strong>{{ t.efficacy || '-' }}</p>
              <p><strong>主治：</strong>{{ t.indication || '-' }}</p>
            </div>
            <template #footer>
              <div class="template-footer">
                <el-button type="primary" link @click="viewDetail(t)">查看组成</el-button>
                <el-button type="primary" link @click="openDialog(t)">编辑</el-button>
                <el-button type="danger" link @click="handleDelete(t)">删除</el-button>
              </div>
            </template>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="formData.id ? '编辑模板' : '新增模板'" width="800px">
      <el-form :model="formData" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="方剂名称">
              <el-input v-model="formData.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="来源">
              <el-input v-model="formData.source" placeholder="如：《伤寒论》" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类">
              <el-select v-model="formData.category" allow-create style="width: 100%">
                <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="经典方剂">
              <el-switch v-model="formData.isClassic" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="功效">
              <el-input v-model="formData.efficacy" type="textarea" :rows="2" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主治">
              <el-input v-model="formData.indication" type="textarea" :rows="2" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider content-position="left">药材组成</el-divider>
        <div class="herb-add-row">
          <el-autocomplete v-model="newHerb.name" :fetch-suggestions="queryHerbs" placeholder="输入药材名称" style="width: 200px" @select="handleHerbSelect" />
          <el-input-number v-model="newHerb.dosage" :min="0.1" :step="0.5" placeholder="剂量" />
          <el-input v-model="newHerb.note" placeholder="备注" style="width: 120px" />
          <el-button type="primary" @click="addHerb">添加</el-button>
        </div>
        <el-table :data="herbList" border size="small">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="herbName" label="药材" width="150" />
          <el-table-column prop="dosage" label="剂量(g)" width="100" />
          <el-table-column prop="note" label="备注" />
          <el-table-column label="操作" width="100">
            <template #default="{ $index }">
              <el-button type="danger" link @click="removeHerb($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" :title="currentTemplate?.name" width="700px">
      <div v-if="currentTemplate">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="来源">{{ currentTemplate.source }}</el-descriptions-item>
          <el-descriptions-item label="分类">{{ currentTemplate.category }}</el-descriptions-item>
          <el-descriptions-item label="功效" :span="2">{{ currentTemplate.efficacy }}</el-descriptions-item>
          <el-descriptions-item label="主治" :span="2">{{ currentTemplate.indication }}</el-descriptions-item>
        </el-descriptions>
        <el-divider />
        <h4>组成：</h4>
        <el-table :data="currentHerbs" border size="small">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="herbName" label="药材" width="150" />
          <el-table-column prop="dosage" label="剂量(g)" width="100" />
          <el-table-column prop="note" label="备注" />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { templateApi, herbApi } from '../api'

const searchKeyword = ref('')
const searchCategory = ref('')
const onlyClassic = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const currentTemplate = ref(null)
const currentHerbs = ref([])
const categories = ['解表剂', '泻下剂', '和解剂', '清热剂', '祛暑剂', '温里剂', '补益剂', '固涩剂', '安神剂', '开窍剂', '理气剂', '理血剂', '治风剂', '治燥剂', '祛湿剂', '祛痰剂', '消导化积剂', '驱虫剂']
const allHerbs = ref([])

const newHerb = ref({ herbId: null, name: '', dosage: 10, note: '' })
const herbList = ref([])
const formData = ref({
  id: null,
  name: '',
  source: '',
  category: '',
  efficacy: '',
  indication: '',
  usage: '',
  contraindication: '',
  isClassic: 0
})

const loadData = async () => {
  tableData.value = await templateApi.list(searchKeyword.value, searchCategory.value, onlyClassic.value) || []
}

const loadHerbs = async () => {
  allHerbs.value = await herbApi.list('', '') || []
}

const queryHerbs = (queryString, cb) => {
  const results = allHerbs.value.filter(h => h.name.includes(queryString)).map(h => ({ value: h.name, id: h.id }))
  cb(results)
}

const handleHerbSelect = (item) => {
  newHerb.value.herbId = item.id
}

const addHerb = () => {
  if (!newHerb.value.name) {
    ElMessage.warning('请选择药材')
    return
  }
  herbList.value.push({ ...newHerb.value, sortOrder: herbList.value.length + 1 })
  newHerb.value = { herbId: null, name: '', dosage: 10, note: '' }
}

const removeHerb = (index) => {
  herbList.value.splice(index, 1)
}

const openDialog = async (row = null) => {
  herbList.value = []
  if (row) {
    formData.value = { ...row }
    herbList.value = await templateApi.getHerbs(row.id) || []
  } else {
    formData.value = {
      id: null,
      name: '',
      source: '',
      category: '',
      efficacy: '',
      indication: '',
      usage: '',
      contraindication: '',
      isClassic: 0
    }
  }
  dialogVisible.value = true
}

const viewDetail = async (row) => {
  currentTemplate.value = row
  currentHerbs.value = await templateApi.getHerbs(row.id) || []
  const herbMap = {}
  for (const h of allHerbs.value) {
    herbMap[h.id] = h.name
  }
  currentHerbs.value = currentHerbs.value.map(h => ({
    ...h,
    herbName: herbMap[h.herbId] || ''
  }))
  detailDialogVisible.value = true
}

const handleSave = async () => {
  if (!formData.value.name) {
    ElMessage.warning('请输入方剂名称')
    return
  }
  const herbs = herbList.value.map(h => ({
    herbId: h.herbId,
    dosage: h.dosage,
    note: h.note
  }))
  if (formData.value.id) {
    await templateApi.update({ template: formData.value, herbs })
    ElMessage.success('更新成功')
  } else {
    await templateApi.save({ template: formData.value, herbs })
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
  loadData()
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该模板吗？', '提示', { type: 'warning' }).then(async () => {
    await templateApi.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  }).catch(() => {})
}

onMounted(() => {
  loadData()
  loadHerbs()
})
</script>

<style scoped>
.page-container { padding-bottom: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.search-bar { margin-bottom: 20px; display: flex; gap: 10px; align-items: center; }
.template-card { height: 100%; }
.template-header { display: flex; justify-content: space-between; align-items: center; }
.template-name { font-weight: bold; font-size: 16px; }
.template-info p { margin: 8px 0; }
.template-footer { display: flex; justify-content: flex-end; gap: 10px; }
.herb-add-row { display: flex; gap: 10px; margin-bottom: 15px; align-items: flex-end; }
</style>
