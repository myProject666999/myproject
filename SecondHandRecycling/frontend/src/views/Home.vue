<template>
  <div class="page-container">
    <van-nav-bar title="二手回收" fixed placeholder>
      <template #right>
        <van-icon name="user-o" size="22" @click="goProfile" />
      </template>
    </van-nav-bar>

    <div class="banner">
      <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=green%20recycling%20service%20banner%20with%20friendly%20collector&image_size=landscape_16_9" alt="回收服务" class="banner-img" />
      <div class="banner-text">
        <h2>上门回收，环保省钱</h2>
        <p>家电 衣物 书籍 数码</p>
      </div>
    </div>

    <div class="quick-actions">
      <div class="action-item" @click="goCategory">
        <van-icon name="orders-o" size="32" color="#07c160" />
        <span>立即估价</span>
      </div>
      <div class="action-item" @click="goOrders">
        <van-icon name="todo-list-o" size="32" color="#07c160" />
        <span>我的订单</span>
      </div>
      <div class="action-item" @click="goWallet">
        <van-icon name="wallet-o" size="32" color="#07c160" />
        <span>我的钱包</span>
      </div>
      <div class="action-item" @click="goAddress">
        <van-icon name="location-o" size="32" color="#07c160" />
        <span>地址管理</span>
      </div>
    </div>

    <div class="section-title">热门品类</div>
    <div class="category-grid">
      <div
        v-for="item in parentCategories"
        :key="item.id"
        class="category-item"
        @click="goChildren(item.id)"
      >
        <div class="category-icon">{{ item.icon }}</div>
        <span>{{ item.name }}</span>
      </div>
    </div>

    <van-tabbar v-model="activeTab" route fixed>
      <van-tabbar-item to="/home" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/category" icon="apps-o">品类</van-tabbar-item>
      <van-tabbar-item to="/orders" icon="todo-list-o">订单</van-tabbar-item>
      <van-tabbar-item to="/wallet" icon="wallet-o">钱包</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { categoryApi } from '@/api'
import { showToast } from 'vant'

const router = useRouter()
const activeTab = ref(0)
const parentCategories = ref([])

const loadCategories = async () => {
  try {
    const res = await categoryApi.getParentList()
    parentCategories.value = res.data || []
  } catch (e) {
    showToast('加载失败')
  }
}

const goCategory = () => router.push('/category')
const goOrders = () => router.push('/orders')
const goWallet = () => router.push('/wallet')
const goAddress = () => router.push('/address')
const goProfile = () => router.push('/login')
const goChildren = (id) => router.push(`/estimate/${id}`)

onMounted(() => {
  loadCategories()
})
</script>

<style lang="less" scoped>
.banner {
  position: relative;
  margin: 12px;
  border-radius: 12px;
  overflow: hidden;
  
  .banner-img {
    width: 100%;
    height: 150px;
    object-fit: cover;
  }
  
  .banner-text {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0,0,0,0.6));
    padding: 16px;
    color: white;
    
    h2 {
      margin: 0 0 4px 0;
      font-size: 18px;
    }
    p {
      margin: 0;
      font-size: 13px;
      opacity: 0.9;
    }
  }
}

.quick-actions {
  display: flex;
  background: white;
  padding: 16px 0;
  margin: 0 12px 12px;
  border-radius: 12px;
  
  .action-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #323232;
  }
}

.section-title {
  padding: 12px 16px 8px;
  font-size: 16px;
  font-weight: 600;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 0 12px 80px;
  
  .category-item {
    background: white;
    border-radius: 12px;
    padding: 16px 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    
    .category-icon {
      font-size: 32px;
    }
  }
}
</style>
