<template>
  <div class="page-container">
    <van-nav-bar title="评价相册" left-arrow @click-left="router.back()" />
    
    <van-tabs v-model:active="activeTab">
      <van-tab title="全部评价">
        <review-list :reviews="reviews" @click="viewReview" />
      </van-tab>
      <van-tab title="好评">
        <review-list :reviews="goodReviews" @click="viewReview" />
      </van-tab>
      <van-tab title="最新">
        <review-list :reviews="latestReviews" @click="viewReview" />
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getReviews } from '@/api/reviews'
import ReviewList from '@/components/ReviewList.vue'

const router = useRouter()
const activeTab = ref(0)
const reviews = ref([])
const loading = ref(false)

const loadReviews = async () => {
  try {
    loading.value = true
    const response = await getReviews()
    if (response && response.success && response.data && response.data.reviews) {
      reviews.value = response.data.reviews.map(r => ({
        ...r,
        photos: 3
      }))
    }
  } catch (error) {
    console.error('加载评价失败:', error)
  } finally {
    loading.value = false
  }
}

const goodReviews = computed(() => reviews.value.filter(r => r.rating >= 4))
const latestReviews = computed(() => [...reviews.value].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))

const viewReview = (review) => {
  router.push('/review/' + review.id)
}

onMounted(() => {
  loadReviews()
})
</script>
