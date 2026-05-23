<template>
  <div class="page-container">
    <div class="page-header">
      <h2>{{ isEdit ? '编辑题目' : '新建题目' }}</h2>
      <el-button @click="$router.back()">返回</el-button>
    </div>
    <div class="card">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="题目标题" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="5" placeholder="题目描述" />
        </el-form-item>
        <el-form-item label="输入描述">
          <el-input v-model="form.inputDesc" type="textarea" :rows="3" placeholder="输入描述" />
        </el-form-item>
        <el-form-item label="输出描述">
          <el-input v-model="form.outputDesc" type="textarea" :rows="3" placeholder="输出描述" />
        </el-form-item>
        <el-form-item label="样例输入">
          <el-input v-model="form.sampleInput" type="textarea" :rows="2" placeholder="样例输入" />
        </el-form-item>
        <el-form-item label="样例输出">
          <el-input v-model="form.sampleOutput" type="textarea" :rows="2" placeholder="样例输出" />
        </el-form-item>
        <el-form-item label="提示">
          <el-input v-model="form.hint" type="textarea" :rows="2" placeholder="提示(可选)" />
        </el-form-item>
        <el-form-item label="难度" prop="difficulty">
          <el-select v-model="form.difficulty">
            <el-option label="简单" :value="1" />
            <el-option label="中等" :value="2" />
            <el-option label="困难" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间限制">
          <el-input-number v-model="form.timeLimit" :min="100" :max="10000" :step="100" />
          <span style="margin-left: 10px;">ms</span>
        </el-form-item>
        <el-form-item label="内存限制">
          <el-input-number v-model="form.memoryLimit" :min="16" :max="1024" :step="16" />
          <span style="margin-left: 10px;">MB</span>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status">
            <el-option label="公开" :value="1" />
            <el-option label="隐藏" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="selectedTagIds" multiple placeholder="选择标签">
            <el-option v-for="tag in allTags" :key="tag.id" :label="tag.name" :value="tag.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="测试用例">
          <div style="width: 100%;">
            <el-button type="primary" size="small" @click="addCase">添加测试用例</el-button>
            <div v-for="(c, i) in form.cases" :key="i" style="border: 1px solid #dcdfe6; border-radius: 4px; padding: 10px; margin-top: 10px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <strong>测试用例 {{ i + 1 }}</strong>
                <el-button type="danger" size="small" @click="removeCase(i)">删除</el-button>
              </div>
              <el-checkbox v-model="c.isSample">样例用例</el-checkbox>
              <div style="margin-top: 10px;">
                <label>输入:</label>
                <el-input v-model="c.input" type="textarea" :rows="2" placeholder="测试输入" />
              </div>
              <div style="margin-top: 10px;">
                <label>输出:</label>
                <el-input v-model="c.output" type="textarea" :rows="2" placeholder="期望输出" />
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">保存</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const allTags = ref([])
const selectedTagIds = ref([])

const isEdit = computed(() => !!route.params.id)

const form = ref({
  id: null,
  title: '',
  description: '',
  inputDesc: '',
  outputDesc: '',
  sampleInput: '',
  sampleOutput: '',
  hint: '',
  difficulty: 1,
  timeLimit: 1000,
  memoryLimit: 256,
  status: 1,
  tags: [],
  cases: []
})

const rules = {
  title: [{ required: true, message: '请输入题目标题', trigger: 'blur' }],
  description: [{ required: true, message: '请输入题目描述', trigger: 'blur' }],
  difficulty: [{ required: true, message: '请选择难度', trigger: 'change' }]
}

const fetchTags = async () => {
  const res = await request.get('/tag/list')
  allTags.value = res.data
}

const fetchProblem = async () => {
  const res = await request.get(`/problem/detail/${route.params.id}`)
  Object.assign(form.value, res.data)
  selectedTagIds.value = (res.data.tags || []).map(t => t.id)
}

const addCase = () => {
  form.value.cases.push({ input: '', output: '', isSample: false })
}

const removeCase = (i) => {
  form.value.cases.splice(i, 1)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const submitData = { ...form.value }
        submitData.tags = selectedTagIds.value.map(id => ({ id }))
        if (isEdit.value) {
          await request.put('/problem/update', submitData)
          ElMessage.success('更新成功')
        } else {
          await request.post('/problem/create', submitData)
          ElMessage.success('创建成功')
        }
        router.push('/admin/problem/list')
      } catch (e) {
        // error handled
      } finally {
        loading.value = false
      }
    }
  })
}

onMounted(() => {
  fetchTags()
  if (isEdit.value) {
    fetchProblem()
  }
})
</script>
