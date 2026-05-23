<template>
  <div class="page-container">
    <div v-if="problem" class="card">
      <div class="page-header">
        <h2>#{{ problem.id }} {{ problem.title }}</h2>
        <div>
          <el-tag :class="getDifficultyClass(problem.difficulty)" size="large">
            {{ getDifficultyText(problem.difficulty) }}
          </el-tag>
          <el-tag type="success" size="large" style="margin-left: 10px;" v-if="problem.acStatus === 1">
            已通过
          </el-tag>
        </div>
      </div>
      <div class="problem-description">
        <h3>题目描述</h3>
        <pre>{{ problem.description }}</pre>
        <h3 v-if="problem.inputDesc">输入描述</h3>
        <pre v-if="problem.inputDesc">{{ problem.inputDesc }}</pre>
        <h3 v-if="problem.outputDesc">输出描述</h3>
        <pre v-if="problem.outputDesc">{{ problem.outputDesc }}</pre>
        <h3>样例</h3>
        <div v-for="(c, i) in sampleCases" :key="i" style="margin-bottom: 10px;">
          <strong>输入:</strong>
          <pre>{{ c.input }}</pre>
          <strong>输出:</strong>
          <pre>{{ c.output }}</pre>
        </div>
        <h3 v-if="problem.hint">提示</h3>
        <pre v-if="problem.hint">{{ problem.hint }}</pre>
      </div>
      <div style="margin-top: 20px; color: #909399;">
        时间限制: {{ problem.timeLimit }}ms | 内存限制: {{ problem.memoryLimit }}MB
      </div>
    </div>

    <div class="card">
      <h3>提交代码</h3>
      <el-form>
        <el-form-item label="编程语言">
          <el-select v-model="submitForm.language" style="width: 200px;">
            <el-option label="C++" value="C++" />
            <el-option label="C" value="C" />
            <el-option label="Java" value="Java" />
            <el-option label="Python" value="Python" />
          </el-select>
        </el-form-item>
        <el-form-item label="代码">
          <div ref="editorRef" class="code-editor"></div>
        </el-form-item>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          提交
        </el-button>
        <el-button @click="showHistory = true">
          查看提交记录
        </el-button>
      </el-form>
    </div>

    <el-dialog v-model="showHistory" title="我的提交记录" width="800px">
      <el-table :data="mySubmissions" stripe>
        <el-table-column label="提交时间" prop="createTime" width="180" />
        <el-table-column label="语言" prop="language" width="100" />
        <el-table-column label="状态" width="150">
          <template #default="scope">
            <span :class="getStatusClass(scope.row.status)">{{ scope.row.statusText }}</span>
          </template>
        </el-table-column>
        <el-table-column label="用时" prop="timeUsed" width="100">
          <template #default="scope">
            {{ scope.row.timeUsed ? scope.row.timeUsed + 'ms' : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="内存" prop="memoryUsed" width="100">
          <template #default="scope">
            {{ scope.row.memoryUsed ? scope.row.memoryUsed + 'MB' : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <router-link :to="`/submission/detail/${scope.row.id}`">查看</router-link>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as monaco from 'monaco-editor'
import request from '@/utils/request'

const route = useRoute()
const router = useRouter()
const editorRef = ref(null)
let editor = null

const problem = ref(null)
const sampleCases = ref([])
const showHistory = ref(false)
const mySubmissions = ref([])
const submitting = ref(false)

const submitForm = ref({
  language: 'C++',
  code: ''
})

const languageMap = {
  'C++': 'cpp',
  'C': 'c',
  'Java': 'java',
  'Python': 'python'
}

const defaultCodes = {
  'C++': '#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}',
  'C': '#include <stdio.h>\n\nint main() {\n    \n    return 0;\n}',
  'Java': 'public class Main {\n    public static void main(String[] args) {\n        \n    }\n}',
  'Python': 'def main():\n    pass\n\nif __name__ == "__main__":\n    main()'
}

const fetchProblem = async () => {
  const res = await request.get(`/problem/detail/${route.params.id}`)
  problem.value = res.data
  sampleCases.value = (res.data.cases || []).filter(c => c.isSample === 1)
  if (editor) {
    editor.setValue(defaultCodes[submitForm.value.language])
  }
}

const initEditor = () => {
  if (editorRef.value && !editor) {
    editor = monaco.editor.create(editorRef.value, {
      value: defaultCodes[submitForm.value.language],
      language: languageMap[submitForm.value.language],
      theme: 'vs-dark',
      fontSize: 14,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true
    })
  }
}

const handleSubmit = async () => {
  if (editor) {
    submitForm.value.code = editor.getValue()
  }
  if (!submitForm.value.code.trim()) {
    ElMessage.warning('代码不能为空')
    return
  }
  submitting.value = true
  try {
    const res = await request.post('/submission/submit', {
      problemId: route.params.id,
      language: submitForm.value.language,
      code: submitForm.value.code
    })
    ElMessage.success('提交成功，正在判题...')
    router.push(`/submission/detail/${res.data.id}`)
  } catch (e) {
    // error handled by interceptor
  } finally {
    submitting.value = false
  }
}

const fetchMySubmissions = async () => {
  const res = await request.get('/submission/mine', {
    params: { problemId: route.params.id, size: 20 }
  })
  mySubmissions.value = res.data.records
}

const getDifficultyText = (d) => ({ 1: '简单', 2: '中等', 3: '困难' }[d] || '未知')
const getDifficultyClass = (d) => ({ 1: 'difficulty-easy', 2: 'difficulty-medium', 3: 'difficulty-hard' }[d] || '')

const getStatusClass = (s) => {
  if (s === 2) return 'status-accepted'
  if (s === 0 || s === 1) return 'status-pending'
  return 'status-error'
}

watch(() => submitForm.value.language, (newLang) => {
  if (editor) {
    const currentCode = editor.getValue()
    if (Object.values(defaultCodes).includes(currentCode)) {
      editor.setValue(defaultCodes[newLang])
    }
    monaco.editor.setModelLanguage(editor.getModel(), languageMap[newLang])
  }
})

watch(showHistory, (val) => {
  if (val) fetchMySubmissions()
})

onMounted(() => {
  fetchProblem()
  nextTick(initEditor)
})
</script>
