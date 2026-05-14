<template>
  <div class="page-container">
    <van-nav-bar title="评价详情" left-arrow @click-left="router.back()" />
    
    <div class="review-detail">
      <div class="review-header">
        <van-avatar size="50" icon="user-o" />
        <div class="review-user">
          <div class="user-name">{{ review.user_name }}</div>
          <van-rate v-model="review.rating" readonly size="16" />
        </div>
      </div>
      
      <div class="review-campsite">
        <van-tag type="primary" size="medium">{{ review.campsite_name }}</van-tag>
        <span class="review-date">{{ review.created_at }}</span>
      </div>
      
      <div class="review-content">{{ review.content }}</div>
      
      <div class="photo-album">
        <van-grid :column-num="2" :border="false">
          <van-grid-item v-for="(photo, index) in photos" :key="index">
            <van-image
              :src="photo"
              fit="cover"
              class="detail-photo"
              @click="previewPhoto(index)"
            />
          </van-grid-item>
        </van-grid>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showImagePreview } from 'vant'

const router = useRouter()
const route = useRoute()

const review = ref({
  id: route.params.id,
  user_name: '露营爱好者',
  rating: 5,
  content: '营地环境非常好，营位宽敞，服务也很周到。周末来的人比较多，建议提前预订。',
  campsite_name: '帐篷区A01',
  created_at: '2026-05-10'
})

const photos = [
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20camping%20sunrise%20tent&image_size=landscape_4_3',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=campfire%20night%20sky%20stars&image_size=landscape_4_3',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=outdoor%20cooking%20barbecue&image_size=landscape_4_3',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=camping%20friends%20happy&image_size=landscape_4_3'
]

const previewPhoto = (index) => {
  showImagePreview({
    images: photos,
    startPosition: index
  })
}
</script>

<style scoped>
.review-detail {
  background: #fff;
  margin: 12px;
  border-radius: 12px;
  padding: 20px;
}

.review-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.review-user {
  margin-left: 16px;
}

.user-name {
  font-size: 16px;
  font-weight: 500;
  color: #323233;
  margin-bottom: 6px;
}

.review-campsite {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.review-date {
  font-size: 12px;
  color: #969799;
}

.review-content {
  color: #323233;
  line-height: 1.8;
  margin-bottom: 20px;
}

.photo-album {
  margin-top: 16px;
}

.detail-photo {
  width: 100%;
  height: 150px;
  border-radius: 8px;
}
</style>
