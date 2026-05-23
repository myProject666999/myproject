<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">{{ isEdit ? '编辑菜谱' : '发布菜谱' }}</h1>
      <el-button @click="$router.back()">返回</el-button>
    </div>

    <div class="form-section">
      <el-form
        ref="recipeFormRef"
        :model="recipeForm"
        :rules="recipeRules"
        label-position="top"
      >
        <el-form-item label="菜谱标题" prop="title">
          <el-input v-model="recipeForm.title" placeholder="请输入菜谱标题" />
        </el-form-item>

        <el-form-item label="菜谱描述">
          <el-input
            v-model="recipeForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入菜谱描述（选填）"
          />
        </el-form-item>

        <el-form-item label="封面图片URL">
          <el-input v-model="recipeForm.cover_image" placeholder="请输入图片URL（选填）" />
        </el-form-item>

        <div class="form-row">
          <el-form-item label="分类" prop="category">
            <el-select v-model="recipeForm.category" placeholder="请选择分类" style="width: 100%">
              <el-option label="家常菜" value="家常菜" />
              <el-option label="川菜" value="川菜" />
              <el-option label="粤菜" value="粤菜" />
              <el-option label="甜品" value="甜品" />
              <el-option label="汤羹" value="汤羹" />
              <el-option label="主食" value="主食" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>

          <el-form-item label="口味" prop="flavor">
            <el-select v-model="recipeForm.flavor" placeholder="请选择口味" style="width: 100%">
              <el-option label="清淡" value="清淡" />
              <el-option label="微辣" value="微辣" />
              <el-option label="中辣" value="中辣" />
              <el-option label="麻辣" value="麻辣" />
              <el-option label="酸甜" value="酸甜" />
              <el-option label="咸鲜" value="咸鲜" />
            </el-select>
          </el-form-item>
        </div>

        <div class="form-row">
          <el-form-item label="难度" prop="difficulty">
            <el-select v-model="recipeForm.difficulty" placeholder="请选择难度" style="width: 100%">
              <el-option label="简单" value="简单" />
              <el-option label="中等" value="中等" />
              <el-option label="困难" value="困难" />
            </el-select>
          </el-form-item>

          <el-form-item label="烹饪时间（分钟）" prop="cook_time">
            <el-input-number
              v-model="recipeForm.cook_time"
              :min="1"
              :max="600"
              style="width: 100%"
            />
          </el-form-item>
        </div>

        <el-form-item label="份量（人份）" prop="servings">
          <el-input-number
            v-model="recipeForm.servings"
            :min="1"
            :max="20"
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item label="食材清单">
          <div class="ingredients-list">
            <div
              v-for="(ing, index) in recipeForm.ingredients"
              :key="index"
              class="ingredient-form-item"
            >
              <el-input
                v-model="ing.name"
                placeholder="食材名称"
                style="width: 150px"
              />
              <el-input
                v-model="ing.amount"
                placeholder="用量"
                style="width: 100px"
              />
              <el-input
                v-model="ing.unit"
                placeholder="单位（可选）"
                style="width: 120px"
              />
              <el-checkbox v-model="ing.is_optional">可选</el-checkbox>
              <el-button
                type="danger"
                link
                :icon="Delete"
                @click="removeIngredient(index)"
              />
            </div>
            <el-button type="primary" :icon="Plus" @click="addIngredient">
              添加食材
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="做法步骤">
          <div class="steps-list">
            <div
              v-for="(step, index) in recipeForm.steps"
              :key="index"
              class="step-form-item"
            >
              <div class="step-form-header">
                <span>
                  <el-icon class="drag-handle"><Rank /></el-icon>
                  步骤 {{ index + 1 }}
                </span>
                <el-button
                  type="danger"
                  link
                  :icon="Delete"
                  @click="removeStep(index)"
                />
              </div>
              <el-input
                v-model="step.content"
                type="textarea"
                :rows="2"
                placeholder="请输入步骤内容"
              />
              <el-input
                v-model="step.image"
                placeholder="步骤图片URL（可选）"
                style="margin-top: 8px"
              />
            </div>
            <el-button type="primary" :icon="Plus" @click="addStep">
              添加步骤
            </el-button>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleSubmit"
          >
            {{ isEdit ? '保存修改' : '发布菜谱' }}
          </el-button>
          <el-button size="large" @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Delete, Rank } from '@element-plus/icons-vue'
import { recipeAPI } from '../api'

const route = useRoute()
const router = useRouter()
const recipeFormRef = ref()
const loading = ref(false)

const isEdit = computed(() => !!route.params.id)

const recipeForm = ref({
  title: '',
  description: '',
  cover_image: '',
  category: '',
  flavor: '',
  difficulty: '',
  cook_time: 30,
  servings: 2,
  ingredients: [{ name: '', amount: '', unit: '', is_optional: false }],
  steps: [{ content: '', image: '' }]
})

const recipeRules = {
  title: [{ required: true, message: '请输入菜谱标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  flavor: [{ required: true, message: '请选择口味', trigger: 'change' }],
  difficulty: [{ required: true, message: '请选择难度', trigger: 'change' }],
  cook_time: [{ required: true, message: '请输入烹饪时间', trigger: 'blur' }],
  servings: [{ required: true, message: '请输入份量', trigger: 'blur' }]
}

const addIngredient = () => {
  recipeForm.value.ingredients.push({ name: '', amount: '', unit: '', is_optional: false })
}

const removeIngredient = (index) => {
  if (recipeForm.value.ingredients.length > 1) {
    recipeForm.value.ingredients.splice(index, 1)
  }
}

const addStep = () => {
  recipeForm.value.steps.push({ content: '', image: '' })
}

const removeStep = (index) => {
  if (recipeForm.value.steps.length > 1) {
    recipeForm.value.steps.splice(index, 1)
  }
}

const fetchRecipe = async () => {
  try {
    const res = await recipeAPI.getDetail(route.params.id)
    const data = res.data
    recipeForm.value = {
      title: data.title,
      description: data.description || '',
      cover_image: data.cover_image || '',
      category: data.category,
      flavor: data.flavor,
      difficulty: data.difficulty,
      cook_time: data.cook_time,
      servings: data.servings,
      ingredients: data.ingredients.map(ing => ({
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit || '',
        is_optional: ing.is_optional
      })),
      steps: data.steps.map(step => ({
        content: step.content,
        image: step.image || ''
      }))
    }
  } catch (error) {
    console.error(error)
  }
}

const handleSubmit = async () => {
  if (!recipeFormRef.value) return

  await recipeFormRef.value.validate(async (valid) => {
    if (!valid) return

    const ingredients = recipeForm.value.ingredients.filter(ing => ing.name.trim())
    const steps = recipeForm.value.steps.filter(step => step.content.trim())

    if (ingredients.length === 0) {
      ElMessage.warning('请添加至少一种食材')
      return
    }

    if (steps.length === 0) {
      ElMessage.warning('请添加至少一个步骤')
      return
    }

    loading.value = true
    try {
      const data = {
        ...recipeForm.value,
        ingredients,
        steps
      }

      if (isEdit.value) {
        await recipeAPI.update(route.params.id, data)
        ElMessage.success('修改成功')
      } else {
        const res = await recipeAPI.create(data)
        ElMessage.success('发布成功')
        router.push(`/recipe/${res.data.id}`)
        return
      }
      router.back()
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  })
}

onMounted(() => {
  if (isEdit.value) {
    fetchRecipe()
  }
})
</script>

<style scoped>
.ingredients-list {
  width: 100%;
}

.ingredient-form-item {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.steps-list {
  width: 100%;
}
</style>
