<template>
  <div class="container">
    <div class="card analyze-section">
      <h2>分析您的网站SEO</h2>
      <p>输入URL，获取详细的SEO分析报告和优化建议</p>
      
      <div class="input-group">
        <input 
          type="text" 
          v-model="url" 
          placeholder="请输入要分析的URL，例如：https://example.com"
          @keyup.enter="analyze"
          :disabled="loading"
        />
        <button @click="analyze" :disabled="loading || !url">
          {{ loading ? '分析中...' : '开始分析' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="card">
      <div class="loading">
        <div class="loading-spinner"></div>
        <p>正在分析页面，请稍候...</p>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="result" class="card">
      <h3 class="section-title">📊 评分概览</h3>
      <div class="score-overview">
        <div class="score-card total">
          <div class="label">总分</div>
          <div class="score">{{ result.analysis.score }}</div>
          <div class="max">/ 100</div>
        </div>
        <div class="score-card">
          <div class="label">Meta标签</div>
          <div class="score">{{ result.analysis.meta_score }}</div>
          <div class="max">/ 20</div>
        </div>
        <div class="score-card">
          <div class="label">关键词</div>
          <div class="score">{{ result.analysis.keyword_score }}</div>
          <div class="max">/ 20</div>
        </div>
        <div class="score-card">
          <div class="label">链接</div>
          <div class="score">{{ result.analysis.link_score }}</div>
          <div class="max">/ 20</div>
        </div>
        <div class="score-card">
          <div class="label">移动友好</div>
          <div class="score">{{ result.analysis.mobile_score }}</div>
          <div class="max">/ 20</div>
        </div>
        <div class="score-card">
          <div class="label">内容</div>
          <div class="score">{{ result.analysis.content_score }}</div>
          <div class="max">/ 20</div>
        </div>
      </div>

      <router-link :to="`/report/${result.analysis.id}`" class="back-btn">
        查看完整报告 →
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { analyzeURL } from '../api'

const router = useRouter()
const url = ref('')
const loading = ref(false)
const error = ref('')
const result = ref(null)

const analyze = async () => {
  if (!url.value) {
    error.value = '请输入URL'
    return
  }

  loading.value = true
  error.value = ''
  result.value = null

  try {
    const response = await analyzeURL(url.value)
    result.value = response.data
  } catch (err) {
    error.value = err.response?.data?.error || '分析失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>
