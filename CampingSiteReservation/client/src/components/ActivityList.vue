<template>
  <div class="activity-list">
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多活动了"
      @load="onLoad"
    >
      <van-card
        v-for="item in activities"
        :key="item.id"
        :title="item.name"
        :desc="item.description"
        :price="item.price"
        :thumb="getThumb(item)"
        @click="$emit('select', item)"
      >
        <template #tag>
          <van-tag :type="getTagType(item.type)" size="medium">
            {{ getTypeLabel(item.type) }}
          </van-tag>
        </template>
        <template #footer>
          <div class="card-footer">
            <span class="participants">
              限{{ item.max_participants }}人
            </span>
            <van-button 
              size="mini" 
              type="primary"
              @click.stop="$emit('register', item)"
            >
              {{ item.price === 0 ? '免费' : '立即报名' }}
            </van-button>
          </div>
        </template>
      </van-card>
    </van-list>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  activities: {
    type: Array,
    default: () => []
  }
})

defineEmits(['select', 'register'])

const loading = ref(false)
const finished = ref(true)

const onLoad = () => {
  loading.value = false
}

const getThumb = (item) => {
  if (item.type === 'dining') {
    return 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=outdoor%20barbecue%20dining&image_size=square'
  }
  if (item.type === 'bonfire') {
    return 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=campfire%20bonfire%20night&image_size=square'
  }
  return 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=outdoor%20movie%20night&image_size=square'
}

const getTagType = (type) => {
  const types = {
    dining: 'danger',
    bonfire: 'warning',
    other: 'info'
  }
  return types[type] || 'default'
}

const getTypeLabel = (type) => {
  const labels = {
    dining: '餐饮',
    bonfire: '篝火',
    other: '活动'
  }
  return labels[type] || '其他'
}
</script>

<style scoped>
.activity-list {
  padding: 8px;
}

:deep(.van-card) {
  margin-bottom: 12px;
  border-radius: 12px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.participants {
  font-size: 12px;
  color: #969799;
}
</style>
