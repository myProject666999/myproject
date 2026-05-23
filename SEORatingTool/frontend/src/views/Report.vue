<template>
  <div class="container">
    <router-link to="/" class="back-btn">← 返回分析</router-link>

    <div v-if="loading" class="card">
      <div class="loading">
        <div class="loading-spinner"></div>
        <p>正在加载报告...</p>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="report" class="card">
      <h3 class="section-title">📊 评分概览</h3>
      <div class="score-overview">
        <div class="score-card total">
          <div class="label">总分</div>
          <div class="score">{{ report.analysis.score }}</div>
          <div class="max">/ 100</div>
        </div>
        <div class="score-card">
          <div class="label">Meta标签</div>
          <div class="score">{{ report.analysis.meta_score }}</div>
          <div class="max">/ 20</div>
        </div>
        <div class="score-card">
          <div class="label">关键词</div>
          <div class="score">{{ report.analysis.keyword_score }}</div>
          <div class="max">/ 20</div>
        </div>
        <div class="score-card">
          <div class="label">链接</div>
          <div class="score">{{ report.analysis.link_score }}</div>
          <div class="max">/ 20</div>
        </div>
        <div class="score-card">
          <div class="label">移动友好</div>
          <div class="score">{{ report.analysis.mobile_score }}</div>
          <div class="max">/ 20</div>
        </div>
        <div class="score-card">
          <div class="label">内容</div>
          <div class="score">{{ report.analysis.content_score }}</div>
          <div class="max">/ 20</div>
        </div>
      </div>

      <div>
        <strong>URL:</strong> {{ report.analysis.url }}
      </div>
      <div style="margin-top: 10px;">
        <strong>分析时间:</strong> {{ formatDate(report.analysis.created_at) }}
      </div>

      <h3 class="section-title">🏷️ Meta标签分析</h3>
      <div class="meta-grid">
        <div class="meta-item">
          <div class="meta-label">Title</div>
          <div class="meta-value">{{ report.meta_detail.title || '未设置' }}</div>
          <div class="meta-status">
            <span class="status-badge" :class="report.meta_detail.has_title ? 'success' : 'error'">
              {{ report.meta_detail.has_title ? '已设置' : '缺失' }}
            </span>
            <span v-if="report.meta_detail.title_length">
              长度: {{ report.meta_detail.title_length }}字符
            </span>
          </div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Description</div>
          <div class="meta-value">{{ report.meta_detail.description || '未设置' }}</div>
          <div class="meta-status">
            <span class="status-badge" :class="report.meta_detail.has_description ? 'success' : 'error'">
              {{ report.meta_detail.has_description ? '已设置' : '缺失' }}
            </span>
            <span v-if="report.meta_detail.description_length">
              长度: {{ report.meta_detail.description_length }}字符
            </span>
          </div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Keywords</div>
          <div class="meta-value">{{ report.meta_detail.keywords || '未设置' }}</div>
          <div class="meta-status">
            <span class="status-badge" :class="report.meta_detail.has_keywords ? 'success' : 'warning'">
              {{ report.meta_detail.has_keywords ? '已设置' : '缺失' }}
            </span>
          </div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Viewport</div>
          <div class="meta-value">{{ report.meta_detail.viewport || '未设置' }}</div>
          <div class="meta-status">
            <span class="status-badge" :class="report.meta_detail.has_viewport ? 'success' : 'error'">
              {{ report.meta_detail.has_viewport ? '已设置' : '缺失' }}
            </span>
          </div>
        </div>
      </div>

      <h3 class="section-title">🔑 关键词分析</h3>
      <table class="keyword-table" v-if="report.keywords.length > 0">
        <thead>
          <tr>
            <th>关键词</th>
            <th>出现次数</th>
            <th>密度</th>
            <th>Title</th>
            <th>Description</th>
            <th>H1</th>
            <th>URL</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="kw in report.keywords" :key="kw.id">
            <td>{{ kw.keyword }}</td>
            <td>{{ kw.count }}</td>
            <td>{{ kw.density.toFixed(2) }}%</td>
            <td>
              <span class="status-badge" :class="kw.in_title ? 'success' : 'error'">
                {{ kw.in_title ? '✓' : '✗' }}
              </span>
            </td>
            <td>
              <span class="status-badge" :class="kw.in_description ? 'success' : 'error'">
                {{ kw.in_description ? '✓' : '✗' }}
              </span>
            </td>
            <td>
              <span class="status-badge" :class="kw.in_h1 ? 'success' : 'error'">
                {{ kw.in_h1 ? '✓' : '✗' }}
              </span>
            </td>
            <td>
              <span class="status-badge" :class="kw.in_url ? 'success' : 'error'">
                {{ kw.in_url ? '✓' : '✗' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-state">
        <h3>未找到关键词</h3>
        <p>页面内容较少，无法提取关键词</p>
      </div>

      <h3 class="section-title">🔗 链接分析</h3>
      <div class="link-section">
        <div>
          <h4 style="margin-bottom: 10px;">内链 ({{ internalLinks.length }})</h4>
          <div class="link-list">
            <div v-for="link in internalLinks" :key="link.id" class="link-item">
              <a class="link-url" :href="link.url" target="_blank">{{ link.url }}</a>
              <div v-if="link.anchor_text" class="link-anchor">
                锚文本: {{ link.anchor_text }}
              </div>
            </div>
            <div v-if="internalLinks.length === 0" class="empty-state">
              <p>无内链</p>
            </div>
          </div>
        </div>
        <div>
          <h4 style="margin-bottom: 10px;">外链 ({{ externalLinks.length }})</h4>
          <div class="link-list">
            <div v-for="link in externalLinks" :key="link.id" class="link-item">
              <a class="link-url" :href="link.url" target="_blank">{{ link.url }}</a>
              <div v-if="link.anchor_text" class="link-anchor">
                锚文本: {{ link.anchor_text }}
              </div>
              <span v-if="link.nofollow" class="link-type-badge internal">nofollow</span>
            </div>
            <div v-if="externalLinks.length === 0" class="empty-state">
              <p>无外链</p>
            </div>
          </div>
        </div>
      </div>

      <h3 class="section-title">📱 移动友好检测</h3>
      <div class="mobile-checks">
        <div class="mobile-check-item">
          <div class="check-icon" :class="report.mobile_detail.has_viewport ? 'pass' : 'fail'">
            {{ report.mobile_detail.has_viewport ? '✓' : '✗' }}
          </div>
          <span>Viewport设置</span>
        </div>
        <div class="mobile-check-item">
          <div class="check-icon" :class="report.mobile_detail.has_flexible_layout ? 'pass' : 'fail'">
            {{ report.mobile_detail.has_flexible_layout ? '✓' : '✗' }}
          </div>
          <span>响应式布局</span>
        </div>
        <div class="mobile-check-item">
          <div class="check-icon" :class="report.mobile_detail.has_responsive_images ? 'pass' : 'fail'">
            {{ report.mobile_detail.has_responsive_images ? '✓' : '✗' }}
          </div>
          <span>响应式图片</span>
        </div>
        <div class="mobile-check-item">
          <div class="check-icon" :class="!report.mobile_detail.flash_detected ? 'pass' : 'fail'">
            {{ !report.mobile_detail.flash_detected ? '✓' : '✗' }}
          </div>
          <span>无Flash内容</span>
        </div>
      </div>

      <h3 class="section-title">📝 内容分析</h3>
      <div class="content-stats">
        <div class="stat-item">
          <div class="stat-value">{{ report.content_detail.total_words }}</div>
          <div class="stat-label">总字数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ report.content_detail.h1_count }}</div>
          <div class="stat-label">H1标签</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ report.content_detail.h2_count }}</div>
          <div class="stat-label">H2标签</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ report.content_detail.h3_count }}</div>
          <div class="stat-label">H3标签</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ report.content_detail.img_count }}</div>
          <div class="stat-label">图片数量</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ report.content_detail.img_with_alt }} / {{ report.content_detail.img_count }}</div>
          <div class="stat-label">含Alt的图片</div>
        </div>
      </div>

      <h3 class="section-title">💡 优化建议</h3>
      <ul class="suggestions-list" v-if="report.suggestions.length > 0">
        <li v-for="(suggestion, index) in report.suggestions" :key="index" class="suggestion-item" :class="suggestion.level">
          <span class="suggestion-category">{{ suggestion.category }}</span>
          <div class="suggestion-title">{{ suggestion.title }}</div>
          <div class="suggestion-content">{{ suggestion.content }}</div>
        </li>
      </ul>
      <div v-else class="empty-state">
        <h3>🎉 没有发现问题</h3>
        <p>您的网站SEO表现良好！</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getReport } from '../api'

const route = useRoute()
const loading = ref(true)
const error = ref('')
const report = ref(null)

const internalLinks = computed(() => {
  return report.value?.links.filter(l => l.type === 'internal') || []
})

const externalLinks = computed(() => {
  return report.value?.links.filter(l => l.type === 'external') || []
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

onMounted(async () => {
  try {
    const response = await getReport(route.params.id)
    report.value = response.data
  } catch (err) {
    error.value = err.response?.data?.error || '加载报告失败'
  } finally {
    loading.value = false
  }
})
</script>
