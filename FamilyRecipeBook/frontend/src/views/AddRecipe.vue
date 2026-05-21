<template>
  <div class="add-recipe">
    <div class="page-header">
      <h2>{{ isEdit ? '编辑菜谱' : '录入新菜谱' }}</h2>
      <el-button @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
    </div>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" v-loading="loading">
      <el-card>
        <template #header>基本信息</template>
        <el-form-item label="菜谱名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入菜谱名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="简单描述一下这道菜" />
        </el-form-item>
        <el-form-item label="封面图片">
          <el-upload
            :show-file-list="false"
            :before-upload="beforeCoverUpload"
            :http-request="uploadCover">
            <div class="upload-cover">
              <img v-if="form.coverImage" :src="form.coverImage" class="cover-preview" />
              <div v-else class="upload-placeholder">
                <el-icon :size="48"><Plus /></el-icon>
                <p>点击上传封面图片</p>
              </div>
            </div>
          </el-upload>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="烹饪时间">
              <el-input-number v-model="form.cookingTime" :min="0" :max="480" />
              <span style="margin-left: 10px;">分钟</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="难度">
              <el-select v-model="form.difficulty" placeholder="请选择难度">
                <el-option label="简单" value="简单" />
                <el-option label="中等" value="中等" />
                <el-option label="困难" value="困难" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="份量">
              <el-input-number v-model="form.servings" :min="1" :max="20" />
              <span style="margin-left: 10px;">人份</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="适合季节">
          <el-checkbox-group v-model="form.seasonNames">
            <el-checkbox v-for="s in seasons" :key="s.name" :label="s.name">
              {{ s.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-card>

      <el-card style="margin-top: 20px;">
        <template #header>
          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <span>食材清单</span>
            <el-button type="primary" size="small" @click="addIngredient">
              <el-icon><Plus /></el-icon>
              添加食材
            </el-button>
          </div>
        </template>
        <div class="ingredient-list">
          <div v-for="(ing, idx) in form.ingredients" :key="idx" class="ingredient-row">
            <el-form-item :label="`食材${idx + 1}`" :prop="`ingredients.${idx}.ingredientName`"
              :rules="[{ required: true, message: '请输入食材名称', trigger: 'blur' }]">
              <div class="ingredient-inputs">
                <el-autocomplete
                  v-model="ing.ingredientName"
                  :fetch-suggestions="queryIngredients"
                  placeholder="食材名称"
                  style="width: 150px;" />
                <el-input-number v-model="ing.quantity" :min="0" :precision="1" :step="1" style="width: 120px;" />
                <el-input v-model="ing.unit" placeholder="单位" style="width: 80px;" />
                <el-checkbox v-model="ing.isRequired">必需</el-checkbox>
                <el-button type="danger" circle @click="removeIngredient(idx)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </el-form-item>
          </div>
          <el-empty v-if="form.ingredients.length === 0" description="暂无食材，点击上方添加食材" :image-size="80" />
        </div>
      </el-card>

      <el-card style="margin-top: 20px;">
        <template #header>
          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <span>烹饪步骤</span>
            <el-button type="primary" size="small" @click="addStep">
              <el-icon><Plus /></el-icon>
              添加步骤
            </el-button>
          </div>
        </template>
        <div class="step-list">
          <div v-for="(step, idx) in form.steps" :key="idx" class="step-row">
            <div class="step-header">
              <span class="step-number">步骤 {{ idx + 1 }}</span>
              <el-button type="danger" circle size="small" @click="removeStep(idx)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <el-input
              v-model="step.description"
              type="textarea"
              :rows="2"
              placeholder="描述这一步的操作" />
            <el-upload
              :show-file-list="false"
              :before-upload="(file) => beforeStepUpload(file, idx)"
              :http-request="(req) => uploadStepImage(req, idx)">
              <div class="step-upload">
                <img v-if="step.imageUrl" :src="step.imageUrl" class="step-preview" />
                <div v-else class="step-upload-placeholder">
                  <el-icon><Picture /></el-icon>
                  <span>上传步骤图片</span>
                </div>
              </div>
            </el-upload>
          </div>
          <el-empty v-if="form.steps.length === 0" description="暂无步骤，点击上方添加步骤" :image-size="80" />
        </div>
      </el-card>

      <div class="form-actions">
        <el-button size="large" @click="$router.back()">取消</el-button>
        <el-button type="primary" size="large" @click="handleSubmit" :loading="submitting">
          {{ isEdit ? '保存修改' : '录入菜谱' }}
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Plus, Delete, Picture } from '@element-plus/icons-vue'
import { recipeApi, seasonApi, uploadApi } from '../api'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const submitting = ref(false)
const seasons = ref([])

const isEdit = computed(() => !!route.params.id)

const form = reactive({
  id: null,
  name: '',
  description: '',
  coverImage: '',
  cookingTime: 30,
  difficulty: '简单',
  servings: 2,
  seasonNames: [],
  ingredients: [],
  steps: []
})

const rules = {
  name: [{ required: true, message: '请输入菜谱名称', trigger: 'blur' }]
}

const loadSeasons = async () => {
  try {
    seasons.value = await seasonApi.getAll()
  } catch (e) {
    console.error('加载季节失败')
  }
}

const loadRecipeForEdit = async () => {
  loading.value = true
  try {
    const data = await recipeApi.getById(route.params.id)
    form.id = data.id
    form.name = data.name
    form.description = data.description || ''
    form.coverImage = data.coverImage || ''
    form.cookingTime = data.cookingTime || 30
    form.difficulty = data.difficulty || '简单'
    form.servings = data.servings || 2
    form.seasonNames = [...(data.seasonNames || [])]
    form.ingredients = (data.ingredients || []).map(i => ({ ...i }))
    form.steps = (data.steps || []).map(s => ({ ...s }))
  } catch (e) {
    ElMessage.error('加载菜谱失败')
  } finally {
    loading.value = false
  }
}

const addIngredient = () => {
  form.ingredients.push({
    ingredientName: '',
    quantity: 1,
    unit: '',
    isRequired: true
  })
}

const removeIngredient = (idx) => {
  form.ingredients.splice(idx, 1)
}

const addStep = () => {
  form.steps.push({
    stepNumber: form.steps.length + 1,
    description: '',
    imageUrl: ''
  })
}

const removeStep = (idx) => {
  form.steps.splice(idx, 1)
  form.steps.forEach((s, i) => s.stepNumber = i + 1)
}

const queryIngredients = (queryString, cb) => {
  cb([])
}

const beforeCoverUpload = (file) => {
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请上传图片文件')
    return false
  }
  return true
}

const uploadCover = async (req) => {
  try {
    const result = await uploadApi.upload(req.file)
    form.coverImage = result.url
    ElMessage.success('封面上传成功')
  } catch (e) {
    ElMessage.error('上传失败')
  }
}

const beforeStepUpload = (file) => {
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请上传图片文件')
    return false
  }
  return true
}

const uploadStepImage = async (req, idx) => {
  try {
    const result = await uploadApi.upload(req.file)
    form.steps[idx].imageUrl = result.url
    ElMessage.success('图片上传成功')
  } catch (e) {
    ElMessage.error('上传失败')
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
  } catch (e) {
    ElMessage.warning('请填写必填项')
    return
  }

  if (form.ingredients.length === 0) {
    ElMessage.warning('请至少添加一种食材')
    return
  }
  if (form.steps.length === 0) {
    ElMessage.warning('请至少添加一个步骤')
    return
  }

  submitting.value = true
  try {
    const payload = {
      ...form,
      steps: form.steps.map((s, i) => ({ ...s, stepNumber: i + 1 }))
    }
    if (isEdit.value) {
      await recipeApi.update(form.id, payload)
      ElMessage.success('修改成功')
    } else {
      await recipeApi.create(payload)
      ElMessage.success('录入成功')
    }
    router.push('/')
  } catch (e) {
    ElMessage.error(isEdit.value ? '修改失败' : '录入失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadSeasons()
  if (isEdit.value) {
    loadRecipeForEdit()
  }
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.page-header h2 {
  color: #333;
  margin: 0;
}

.upload-cover {
  width: 200px;
  height: 150px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-cover:hover {
  border-color: #ff6b6b;
}

.cover-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-placeholder {
  text-align: center;
  color: #999;
}

.upload-placeholder p {
  margin: 10px 0 0 0;
  font-size: 14px;
}

.ingredient-list {
  padding: 10px 0;
}

.ingredient-row {
  margin-bottom: 10px;
}

.ingredient-inputs {
  display: flex;
  gap: 10px;
  align-items: center;
}

.step-list {
  padding: 10px 0;
}

.step-row {
  margin-bottom: 20px;
  padding: 15px;
  background: #fafafa;
  border-radius: 8px;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.step-number {
  font-weight: bold;
  color: #ff6b6b;
  font-size: 16px;
}

.step-upload {
  margin-top: 10px;
  width: 150px;
  height: 100px;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-upload:hover {
  border-color: #ff6b6b;
}

.step-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.step-upload-placeholder {
  text-align: center;
  color: #999;
  font-size: 12px;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  bottom: 0;
}
</style>
