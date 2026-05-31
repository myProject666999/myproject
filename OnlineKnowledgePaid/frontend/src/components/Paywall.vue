<template>
  <div class="paywall">
    <div
      v-if="trialContent"
      class="paywall__trial markdown-body"
      v-html="renderedTrial"
    ></div>

    <el-divider v-if="trialContent" />

    <el-card class="paywall__card" shadow="hover">
      <template #header>
        <div class="paywall__header">
          <el-icon><Lock /></el-icon>
          <span>付费内容提示</span>
        </div>
      </template>

      <div class="paywall__body">
        <h3 class="paywall__title">{{ columnTitle }}</h3>
        <p class="paywall__tip">本文为付费内容，请订阅专栏后阅读全文</p>
        <div class="paywall__price">
          <span class="paywall__price-label">订阅价格</span>
          <span class="paywall__price-value">¥{{ price.toFixed(2) }}</span>
        </div>
      </div>

      <template #footer>
        <div class="paywall__footer">
          <el-button type="primary" size="large" @click="handleSubscribe">
            订阅专栏
          </el-button>
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { marked } from 'marked'
import { Lock } from '@element-plus/icons-vue'

const props = defineProps({
  trialContent: {
    type: String,
    default: ''
  },
  columnId: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    default: 0
  },
  columnTitle: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['subscribe'])

const router = useRouter()

const renderedTrial = computed(() => {
  if (!props.trialContent) return ''
  return marked(props.trialContent)
})

function handleSubscribe() {
  emit('subscribe', props.columnId)
  router.push(`/subscribe/${props.columnId}`)
}
</script>

<style scoped>
.paywall {
  max-width: 800px;
  margin: 0 auto;
}

.paywall__trial {
  padding: 16px 0;
}

.paywall__card {
  margin-top: 16px;
}

.paywall__header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.paywall__body {
  text-align: center;
  padding: 24px 0;
}

.paywall__title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 12px;
  color: var(--el-text-color-primary);
}

.paywall__tip {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin: 0 0 24px;
}

.paywall__price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
}

.paywall__price-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.paywall__price-value {
  font-size: 32px;
  font-weight: bold;
  color: var(--el-color-danger);
}

.paywall__footer {
  text-align: center;
}

.markdown-body :deep(img) {
  max-width: 100%;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3) {
  margin-top: 1.2em;
}

.markdown-body :deep(code) {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
}

.markdown-body :deep(pre) {
  background: #282c34;
  color: #abb2bf;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
}

.markdown-body :deep(pre code) {
  background: transparent;
  color: inherit;
  padding: 0;
}
</style>
