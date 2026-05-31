<script setup lang="ts">
import { Inbox } from 'lucide-vue-next'

interface Props {
  description?: string
  image?: string
}

const props = withDefaults(defineProps<Props>(), {
  description: '暂无数据'
})

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="empty-wrapper">
    <div class="empty-content">
      <div class="empty-image" v-if="image">
        <img :src="image" alt="empty" />
      </div>
      <div class="empty-icon" v-else>
        <Inbox :size="64" />
      </div>
      <p class="empty-description">{{ description }}</p>
      <slot name="action">
        <el-button v-if="$slots.action" type="primary" @click="emit('action')">
          去操作
        </el-button>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.empty-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  min-height: 200px;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.empty-image img {
  width: 120px;
  height: 120px;
  object-fit: contain;
  opacity: 0.8;
}

.empty-icon {
  color: #D0D5DD;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  background-color: #F9FAFB;
  border-radius: 50%;
}

.empty-description {
  font-size: 14px;
  color: #98A2B3;
  margin: 0;
}
</style>
