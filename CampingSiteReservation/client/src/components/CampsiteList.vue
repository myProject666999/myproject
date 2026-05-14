<template>
  <div class="campsite-list">
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多营位了"
      @load="onLoad"
    >
      <van-card
        v-for="item in campsites"
        :key="item.id"
        :title="item.name"
        :desc="item.description"
        :price="item.price"
        :origin-price="item.weekend_price"
        :thumb="getThumb(item)"
        @click="$emit('select', item)"
      >
        <template #tag>
          <van-tag type="primary" size="medium">
            {{ item.type === 'tent' ? '帐篷区' : '房车区' }}
          </van-tag>
        </template>
        <template #footer>
          <div class="card-footer">
            <span class="capacity">
              <van-icon name="friends-o" /> 容纳{{ item.max_capacity }}人
            </span>
            <span class="weekend-price">
              周末 <span class="price">{{ item.weekend_price }}</span>
            </span>
          </div>
        </template>
      </van-card>
    </van-list>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  campsites: {
    type: Array,
    default: () => []
  }
})

defineEmits(['select'])

const loading = ref(false)
const finished = ref(true)

const onLoad = () => {
  loading.value = false
}

const getThumb = (item) => {
  if (item.type === 'tent') {
    return 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cozy%20tent%20camping%20spot%20in%20green%20meadow&image_size=square'
  }
  return 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20RV%20camping%20site%20with%20hookups&image_size=square'
}
</script>

<style scoped>
.campsite-list {
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

.capacity {
  font-size: 12px;
  color: #969799;
}

.weekend-price {
  font-size: 12px;
  color: #969799;
}

.weekend-price .price {
  color: #ee0a24;
  font-size: 14px;
}

.weekend-price .price::before {
  content: '¥';
  font-size: 10px;
}
</style>
