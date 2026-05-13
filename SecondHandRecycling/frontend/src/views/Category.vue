<template>
  <div class="page-container">
    <van-nav-bar title="选择品类" left-arrow @click-left="router.back()" fixed placeholder />

    <van-collapse v-model="activeNames" accordion>
      <van-collapse-item
        v-for="parent in parentCategories"
        :key="parent.id"
        :name="parent.id"
        :title="parent.name"
      >
        <div class="children-list">
          <div
            v-for="child in getChildren(parent.id)"
            :key="child.id"
            class="child-item"
            @click="goEstimate(child.id)"
          >
            <span class="child-icon">{{ child.icon }}</span>
            <div class="child-info">
              <span class="child-name">{{ child.name }}</span>
              <span class="child-price" v-if="child.basePrice">
                ¥{{ child.basePrice }}/{{ child.unit }}
              </span>
            </div>
            <van-icon name="arrow" />
          </div>
          <div v-if="getChildren(parent.id).length === 0" class="empty-tip">
            暂无子品类
          </div>
        </div>
      </van-collapse-item>
    </van-collapse>

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
const activeTab = ref(1)
const activeNames = ref([])
const parentCategories = ref([])
const childrenMap = ref({})

const loadCategories = async () => {
  try {
    const res = await categoryApi.getParentList()
    parentCategories.value = res.data || []
    
    for (const parent of parentCategories.value) {
      const childRes = await categoryApi.getChildren(parent.id)
      childrenMap.value[parent.id] = childRes.data || []
    }
    
    if (parentCategories.value.length > 0) {
      activeNames.value = [parentCategories.value[0].id]
    }
  } catch (e) {
    showToast('加载失败')
  }
}

const getChildren = (parentId) => {
  return childrenMap.value[parentId] || []
}

const goEstimate = (categoryId) => {
  router.push(`/estimate/${categoryId}`)
}

onMounted(() => {
  loadCategories()
})
</script>

<style lang="less" scoped>
.children-list {
  padding: 8px 0;
}

.child-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  
  &:active {
    background: #f7f8fa;
  }
  
  .child-icon {
    font-size: 28px;
    margin-right: 12px;
  }
  
  .child-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    .child-name {
      font-size: 15px;
    }
    
    .child-price {
      font-size: 12px;
      color: #07c160;
    }
  }
}

.empty-tip {
  text-align: center;
  padding: 16px;
  color: #969799;
  font-size: 14px;
}
</style>
