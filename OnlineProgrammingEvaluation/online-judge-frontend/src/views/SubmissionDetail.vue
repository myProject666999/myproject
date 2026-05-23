<template>
  <div class="page-container">
    <div v-if="submission" class="card">
      <div class="page-header">
        <h2>提交详情 #{{ submission.id }}</h2>
        <div>
          <el-tag :type="getStatusTagType(submission.status)" size="large">
            {{ submission.statusText }}
          </el-tag>
        </div>
      </div>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="题目">
          <router-link :to="`/problem/detail/${submission.problemId}`">
            {{ submission.problem?.title || `#${submission.problemId}` }}
          </router-link>
        </el-descriptions-item>
        <el-descriptions-item label="用户">
          {{ submission.user?.nickname || submission.user?.username || `#${submission.userId}` }}
        </el-descriptions-item>
        <el-descriptions-item label="语言">{{ submission.language }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ submission.createTime }}</el-descriptions-item>
        <el-descriptions-item label="运行时间">
          {{ submission.timeUsed ? submission.timeUsed + 'ms' : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="运行内存">
          {{ submission.memoryUsed ? submission.memoryUsed + 'MB' : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="得分">
          {{ submission.score !== null && submission.score !== undefined ? submission.score : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="通过用例">
          {{ submission.caseCount !== null ? `${submission.caseCount}/${submission.totalCase}` : '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div v-if="submission?.errorMsg" class="card">
      <h3>错误信息</h3>
      <pre style="background: #f5f7fa; padding: 15px; border-radius: 4px; white-space: pre-wrap; word-break: break-all;">{{ submission.errorMsg }}</pre>
    </div>

    <div v-if="submission?.code" class="card">
      <h3>提交代码</h3>
      <div ref="editorRef" class="code-editor"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import * as monaco from 'monaco-editor'
import request from '@/utils/request'

const route = useRoute()
const editorRef = ref(null)
let editor = null

const submission = ref(null)

const languageMap = {
  'C++': 'cpp',
  'C': 'c',
  'Java': 'java',
  'Python': 'python'
}

const fetchSubmission = async () => {
  const res = await request.get(`/submission/detail/${route.params.id}`)
  submission.value = res.data
  if (editor && res.data.code) {
    editor.setValue(res.data.code)
    monaco.editor.setModelLanguage(editor.getModel(), languageMap[res.data.language] || 'plaintext')
  }
}

const initEditor = () => {
  if (editorRef.value && !editor) {
    editor = monaco.editor.create(editorRef.value, {
      value: '',
      language: 'plaintext',
      theme: 'vs-dark',
      readOnly: true,
      fontSize: 14,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true
    })
  }
}

const getStatusTagType = (s) => {
  const map = { 2: 'success', 3: 'danger', 4: 'warning', 5: 'warning', 6: 'danger', 7: 'info', 0: 'info', 1: 'warning', 8: 'danger' }
  return map[s] || 'info'
}

onMounted(() => {
  fetchSubmission()
  nextTick(initEditor)
})
</script>
