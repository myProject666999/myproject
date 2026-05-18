<template>
  <div class="card-list">
    <van-nav-bar title="名片夹" left-arrow>
      <template #right>
        <van-icon name="plus" size="20" @click="goToScan" />
      </template>
    </van-nav-bar>

    <van-tabs v-model:active="activeTab" @change="onTabChange">
      <van-tab title="全部" />
      <van-tab v-for="group in groups" :key="group.id" :title="group.name" />
    </van-tabs>

    <van-search
      v-model="keyword"
      placeholder="搜索姓名、公司..."
      @search="onSearch"
      @clear="onSearch"
    />

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-cell-group inset>
          <van-cell
            v-for="card in cardList"
            :key="card.id"
            :title="card.name"
            :label="card.company || '暂无公司信息'"
            :value="card.title"
            is-link
            @click="goToDetail(card.id)"
          >
            <template #icon>
              <van-icon
                v-if="card.isFavorite"
                name="star-o"
                color="#ffd21e"
                size="18"
              />
            </template>
          </van-cell>
        </van-cell-group>
      </van-list>
    </van-pull-refresh>

    <van-tabbar v-model:active="active">
      <van-tabbar-item icon="friends-o" to="/">名片夹</van-tabbar-item>
      <van-tabbar-item icon="search" to="/search">搜索</van-tabbar-item>
      <van-tabbar-item icon="scan" to="/scan">扫描</van-tabbar-item>
      <van-tabbar-item icon="apps-o" to="/groups">分组</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCardList, getGroups } from '@/api'
import { showToast } from 'vant'

export default {
  name: 'CardList',
  setup() {
    const router = useRouter()
    const activeTab = ref(0)
    const active = ref(0)
    const keyword = ref('')
    const cardList = ref([])
    const groups = ref([])
    const loading = ref(false)
    const refreshing = ref(false)
    const finished = ref(false)
    const pageNum = ref(1)
    const pageSize = ref(10)
    const currentGroupId = ref(null)

    const onTabChange = (index) => {
      if (index === 0) {
        currentGroupId.value = null
      } else {
        currentGroupId.value = groups.value[index - 1]?.id
      }
      onRefresh()
    }

    const onSearch = () => {
      onRefresh()
    }

    const onRefresh = () => {
      refreshing.value = true
      pageNum.value = 1
      finished.value = false
      cardList.value = []
      loadData()
    }

    const onLoad = () => {
      loadData()
    }

    const loadData = async () => {
      try {
        const res = await getCardList({
          groupId: currentGroupId.value,
          keyword: keyword.value,
          pageNum: pageNum.value,
          pageSize: pageSize.value
        })
        if (refreshing.value) {
          cardList.value = res.records || []
          refreshing.value = false
        } else {
          cardList.value = [...cardList.value, ...(res.records || [])]
        }
        loading.value = false
        if (res.current >= res.pages) {
          finished.value = true
        } else {
          pageNum.value++
        }
      } catch (e) {
        showToast('加载失败')
        loading.value = false
        refreshing.value = false
      }
    }

    const loadGroups = async () => {
      try {
        groups.value = await getGroups()
      } catch (e) {
        console.error('加载分组失败', e)
      }
    }

    const goToScan = () => {
      router.push('/scan')
    }

    const goToDetail = (id) => {
      router.push(`/card/${id}`)
    }

    onMounted(() => {
      loadGroups()
      onRefresh()
    })

    return {
      activeTab,
      active,
      keyword,
      cardList,
      groups,
      loading,
      refreshing,
      finished,
      onTabChange,
      onSearch,
      onRefresh,
      onLoad,
      goToScan,
      goToDetail
    }
  }
}
</script>

<style lang="scss" scoped>
.card-list {
  padding-bottom: 50px;
}
</style>
