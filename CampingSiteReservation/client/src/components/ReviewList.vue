<template>
  <div class="review-list">
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多评价了"
      @load="onLoad"
    >
      <div
        v-for="item in reviews"
        :key="item.id"
        class="review-card"
        @click="$emit('click', item)"
      >
        <div class="review-header">
          <van-avatar size="40" icon="user-o" />
          <div class="review-user">
            <div class="user-name">{{ item.user_name }}</div>
            <van-rate v-model="item.rating" readonly size="14" />
          </div>
          <div class="review-date">{{ item.created_at }}</div>
        </div>
        
        <div class="review-content">{{ item.content }}</div>
        
        <div class="review-campsite">
          <van-tag type="info" size="small">{{ item.campsite_name }}</van-tag>
        </div>
        
        <van-grid v-if="item.photos > 0" :column-num="3" :border="false">
          <van-grid-item
            v-for="i in Math.min(item.photos, 3)"
            :key="i"
          >
            <van-image
              :src="getPhoto(i)"
              fit="cover"
              class="review-photo"
            />
          </van-grid-item>
        </van-grid>
      </div>
    </van-list>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  reviews: {
    type: Array,
    default: () => []
  }
})

defineEmits(['click'])

const loading = ref(false)
const finished = ref(true)

const onLoad = () => {
  loading.value = false
}

const getPhoto = (index) => {
  const photos = [
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=camping%20tent%20morning%20sunrise&image_size=square',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=campfire%20night%20stars&image_size=square',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=outdoor%20barbecue%20camping&image_size=square'
  ]
  return photos[(index - 1) % photos.length]
}
</script>

<style scoped>
.review-list {
  padding: 8px;
}

.review-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.review-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.review-user {
  flex: 1;
  margin-left: 12px;
}

.user-name {
  font-weight: 500;
  color: #323233;
  margin-bottom: 4px;
}

.review-date {
  font-size: 12px;
  color: #969799;
}

.review-content {
  color: #646566;
  line-height: 1.6;
  margin-bottom: 12px;
}

.review-campsite {
  margin-bottom: 12px;
}

.review-photo {
  width: 100%;
  height: 100px;
  border-radius: 8px;
}
</style>
