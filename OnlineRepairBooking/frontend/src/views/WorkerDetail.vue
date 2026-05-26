<template>
  <div class="worker-detail">
    <van-nav-bar
      title="师傅详情"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
      fixed
      placeholder
    />
    
    <div class="detail-content">
      <div class="worker-header">
        <div class="worker-avatar">
          <van-image
            round
            width="80"
            height="80"
            :src="workerInfo.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
          />
        </div>
        <div class="worker-info">
          <div class="worker-name">
            {{ workerInfo.name }}
            <van-tag type="primary" size="small" v-if="workerInfo.certified">认证</van-tag>
          </div>
          <div class="worker-rating">
            <van-rate v-model="workerInfo.rating" readonly size="16" color="#ffd21e" void-color="#dcdee0" />
            <span class="rating-num">{{ workerInfo.rating }}</span>
            <span class="order-count">({{ workerInfo.orderCount }}单)</span>
          </div>
          <div class="worker-exp">
            <van-icon name="medal-o" />
            <span>{{ workerInfo.experience }}年从业经验</span>
          </div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">专业技能</div>
        <div class="skill-tags">
          <van-tag
            v-for="(skill, index) in workerInfo.skills"
            :key="index"
            type="primary"
            plain
            size="medium"
          >
            {{ skill }}
          </van-tag>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">个人简介</div>
        <div class="introduction">{{ workerInfo.introduction }}</div>
      </div>
      
      <div class="section">
        <div class="section-title">
          用户评价
          <span class="review-count">({{ reviews.length }}条)</span>
        </div>
        <div class="review-list" v-if="reviews.length > 0">
          <div v-for="review in reviews" :key="review.id" class="review-item">
            <div class="review-header">
              <div class="reviewer-info">
                <van-image
                  round
                  width="32"
                  height="32"
                  :src="review.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
                />
                <span class="reviewer-name">{{ review.isAnonymous ? '匿名用户' : review.userName }}</span>
              </div>
              <van-rate v-model="review.rating" readonly size="14" color="#ffd21e" void-color="#dcdee0" />
            </div>
            <div class="review-content">{{ review.content }}</div>
            <div class="review-images" v-if="review.images && review.images.length > 0">
              <van-image
                v-for="(img, idx) in review.images"
                :key="idx"
                width="60"
                height="60"
                :src="img"
                radius="4"
              />
            </div>
            <div class="review-time">{{ review.createTime }}</div>
          </div>
        </div>
        <van-empty v-else description="暂无评价" />
      </div>
      
      <div class="section">
        <div class="section-title">可预约服务</div>
        <div class="service-list">
          <div
            v-for="service in workerInfo.services"
            :key="service.id"
            class="service-item"
            @click="goToBook(service)"
          >
            <div class="service-info">
              <div class="service-name">{{ service.name }}</div>
              <div class="service-desc">{{ service.description }}</div>
            </div>
            <div class="service-price">
              <span class="price">¥{{ service.price }}</span>
              <van-button type="primary" size="small">预约</van-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="bottom-bar">
      <van-button type="primary" block size="large" @click="goToBook(workerInfo.services[0])">
        立即预约
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getWorkerDetail, getWorkerReviews } from '@/api/worker'

const route = useRoute()
const router = useRouter()

const workerId = route.params.id || route.query.id

const workerInfo = ref({
  id: 1,
  name: '张师傅',
  avatar: '',
  rating: 4.8,
  orderCount: 256,
  experience: 8,
  certified: true,
  skills: ['空调维修', '水电维修', '家电安装', '管道疏通'],
  introduction: '从事家电维修行业8年，拥有丰富的维修经验。服务态度好，技术过硬，获得广大客户的一致好评。擅长各类空调、洗衣机、冰箱等家电的维修与保养。',
  services: [
    { id: 1, name: '空调维修', description: '专业空调故障检测与维修', price: 199 },
    { id: 2, name: '水电维修', description: '家庭水电故障排查与修复', price: 129 },
    { id: 3, name: '家电安装', description: '各类家电安装调试服务', price: 99 }
  ]
})

const reviews = ref([
  {
    id: 1,
    userId: 1,
    userName: '用户***8',
    avatar: '',
    rating: 5,
    content: '张师傅非常专业，上门准时，很快就找到了问题所在，空调现在运行正常。价格也很合理，非常满意！',
    images: [],
    isAnonymous: false,
    createTime: '2024-01-10 15:30'
  },
  {
    id: 2,
    userId: 2,
    userName: '李女士',
    avatar: '',
    rating: 5,
    content: '服务态度很好，技术也不错，下次还会找张师傅。',
    images: [],
    isAnonymous: true,
    createTime: '2024-01-08 10:20'
  },
  {
    id: 3,
    userId: 3,
    userName: '王先生',
    avatar: '',
    rating: 4,
    content: '整体满意，就是稍微晚了一点，不过提前打电话沟通了。',
    images: [],
    isAnonymous: false,
    createTime: '2024-01-05 16:45'
  }
])

const onClickLeft = () => {
  router.back()
}

const fetchWorkerDetail = async () => {
  if (!workerId) return
  try {
    const res = await getWorkerDetail(workerId)
    if (res) {
      workerInfo.value = { ...workerInfo.value, ...res }
    }
  } catch (e) {
    console.log('获取师傅详情失败')
  }
}

const fetchReviews = async () => {
  if (!workerId) return
  try {
    const res = await getWorkerReviews(workerId, { page: 1, pageSize: 10 })
    if (res && res.list) {
      reviews.value = res.list
    }
  } catch (e) {
    console.log('获取评价列表失败')
  }
}

const goToBook = (service) => {
  if (!service) {
    showToast('暂无可预约服务')
    return
  }
  router.push({
    path: '/service/' + service.id,
    query: { workerId: workerInfo.value.id }
  })
}

onMounted(() => {
  fetchWorkerDetail()
  fetchReviews()
})
</script>

<style lang="scss" scoped>
.worker-detail {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 80px;
}

.detail-content {
  padding: 12px;
}

.worker-header {
  background: linear-gradient(135deg, #07c160 0%, #06ad56 100%);
  border-radius: 12px;
  padding: 24px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  color: #fff;
}

.worker-info {
  flex: 1;
}

.worker-name {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.worker-rating {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  
  .rating-num {
    font-size: 14px;
    font-weight: 500;
  }
  
  .order-count {
    font-size: 12px;
    opacity: 0.8;
  }
}

.worker-exp {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  opacity: 0.9;
  
  .van-icon {
    font-size: 14px;
  }
}

.section {
  background-color: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  
  .review-count {
    font-size: 13px;
    color: #969799;
    font-weight: normal;
  }
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  
  .van-tag {
    padding: 4px 12px;
  }
}

.introduction {
  font-size: 14px;
  color: #646566;
  line-height: 1.6;
}

.review-list {
  .review-item {
    padding: 12px 0;
    border-bottom: 1px solid #ebedf0;
    
    &:last-child {
      border-bottom: none;
    }
  }
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .reviewer-name {
    font-size: 14px;
    color: #323233;
  }
}

.review-content {
  font-size: 14px;
  color: #646566;
  line-height: 1.5;
  margin-bottom: 8px;
}

.review-images {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.review-time {
  font-size: 12px;
  color: #c8c9cc;
}

.service-list {
  .service-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #ebedf0;
    
    &:last-child {
      border-bottom: none;
    }
  }
}

.service-info {
  flex: 1;
  
  .service-name {
    font-size: 15px;
    font-weight: 500;
    color: #323233;
    margin-bottom: 4px;
  }
  
  .service-desc {
    font-size: 13px;
    color: #969799;
  }
}

.service-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  
  .price {
    font-size: 18px;
    font-weight: 600;
    color: #ff6034;
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background-color: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
  
  .van-button {
    border-radius: 24px;
  }
}
</style>
