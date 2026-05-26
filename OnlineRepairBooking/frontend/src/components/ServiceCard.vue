<template>
  <van-card
    :num="service.price"
    :price="service.price"
    :title="service.name"
    :desc="service.description"
    :thumb="service.cover || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
    :tag="service.categoryName"
    @click="handleClick"
  >
    <template #tags>
      <van-tag plain type="primary" size="small">{{ service.duration }}分钟</van-tag>
      <van-tag plain type="success" size="small" style="margin-left: 4px">
        销量 {{ service.sales || 0 }}
      </van-tag>
    </template>
    <template #footer>
      <van-button size="mini" type="primary" @click.stop="handleClick">
        立即预约
      </van-button>
    </template>
  </van-card>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  service: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const handleClick = () => {
  router.push(`/service/${props.service.id}`)
}
</script>

<style lang="scss" scoped>
.van-card {
  margin-bottom: 12px;
  
  :deep(.van-card__price) {
    color: #ee0a24;
    font-weight: bold;
  }
  
  :deep(.van-card__num) {
    display: none;
  }
  
  :deep(.van-card__tag) {
    margin-top: 4px;
  }
  
  :deep(.van-card__desc) {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
</style>
