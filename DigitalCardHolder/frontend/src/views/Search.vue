<template>
  <div class="search-page">
    <van-nav-bar title="搜索" left-arrow @click-left="$router.back()" />

    <van-search
      v-model="keyword"
      placeholder="搜索姓名、公司、电话..."
      show-action
      autofocus
      @search="onSearch"
      @clear="onSearch"
    >
      <template #action>
        <div @click="onSearch">搜索</div>
      </template>
    </van-search>

    <div v-if="searchResults.length > 0" class="result-list">
      <van-cell-group inset>
        <van-cell
          v-for="card in searchResults"
          :key="card.id"
          :title="card.name"
          :label="card.company || '暂无公司信息'"
          :value="card.title"
          is-link
          @click="goToDetail(card.id)"
        />
      </van-cell-group>
    </div>

    <van-empty v-else-if="hasSearched" description="没有找到相关名片" />
    <van-empty v-else description="请输入关键词搜索" />
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getCardList } from '@/api'
import { showToast } from 'vant'

export default {
  name: 'Search',
  setup() {
    const router = useRouter()
    const keyword = ref('')
    const searchResults = ref([])
    const hasSearched = ref(false)

    const onSearch = async () => {
      if (!keyword.value.trim()) {
        searchResults.value = []
        hasSearched.value = false
        return
      }
      try {
        const res = await getCardList({
          keyword: keyword.value,
          pageNum: 1,
          pageSize: 100
        })
        searchResults.value = res.records || []
        hasSearched.value = true
      } catch (e) {
        showToast('搜索失败')
      }
    }

    const goToDetail = (id) => {
      router.push(`/card/${id}`)
    }

    return {
      keyword,
      searchResults,
      hasSearched,
      onSearch,
      goToDetail
    }
  }
}
</script>

<style lang="scss" scoped>
.result-list {
  padding-top: 10px;
}
</style>
