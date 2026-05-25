<template>
  <div class="knowledge-base">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="never">
          <template #header>
            <el-icon><Menu /></el-icon>
            <span>分类</span>
          </template>
          <el-tree
            :data="categoryTree"
            :props="{ label: 'name', children: 'children' }"
            node-key="id"
            default-expand-all
            :highlight-current="true"
            @node-click="handleCategoryClick"
          >
            <template #default="{ node, data }">
              <span class="custom-tree-node">
                <el-icon><Folder /></el-icon>
                <span>{{ data.name }}</span>
              </span>
            </template>
          </el-tree>
        </el-card>
      </el-col>

      <el-col :span="18">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索知识库..."
                style="width: 300px"
                clearable
                @keyup.enter="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-button type="primary" @click="handleSearch">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
            </div>
          </template>

          <div v-if="searchResults.length > 0" class="search-results">
            <h3>搜索结果</h3>
            <el-card
              v-for="item in searchResults"
              :key="item.id"
              shadow="hover"
              class="result-item"
              @click="goDetail(item.id)"
            >
              <div class="result-title">{{ item.title }}</div>
              <div class="result-summary">{{ item.summary }}</div>
              <div class="result-meta">
                <span>浏览: {{ item.viewCount }}</span>
              </div>
            </el-card>
          </div>

          <div v-else>
            <el-table :data="articleList" stripe style="width: 100%" @row-click="goDetail">
              <el-table-column prop="title" label="标题" show-overflow-tooltip />
              <el-table-column prop="categoryName" label="分类" width="120" />
              <el-table-column prop="viewCount" label="浏览" width="80" />
              <el-table-column prop="helpfulCount" label="有用" width="80" />
              <el-table-column prop="createdAt" label="创建时间" width="160">
                <template #default="{ row }">
                  {{ formatTime(row.createdAt) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" link @click.stop="goDetail(row.id)">
                    查看
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="pagination">
              <el-pagination
                v-model:current-page="pagination.page"
                v-model:page-size="pagination.pageSize"
                :total="pagination.total"
                layout="total, prev, pager, next"
                @current-change="loadArticles"
              />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getKbCategories, getKbArticles, searchKbArticles } from '@/api/kb'
import dayjs from 'dayjs'

const router = useRouter()

const categoryTree = ref([])
const articleList = ref([])
const searchResults = ref([])
const searchKeyword = ref('')
const currentCategoryId = ref(null)

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

function formatTime(time) {
  if (!time) return '-'
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

async function loadCategories() {
  const res = await getKbCategories()
  if (res.code === 0) {
    categoryTree.value = res.data
  }
}

async function loadArticles() {
  const params = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    status: 1
  }
  if (currentCategoryId.value) {
    params.categoryId = currentCategoryId.value
  }

  const res = await getKbArticles(params)
  if (res.code === 0) {
    articleList.value = res.data.list || []
    pagination.total = res.data.total || 0
  }
}

function handleCategoryClick(data) {
  currentCategoryId.value = data.id
  searchResults.value = []
  pagination.page = 1
  loadArticles()
}

async function handleSearch() {
  if (!searchKeyword.value.trim()) {
    searchResults.value = []
    return
  }
  
  const res = await searchKbArticles({ keyword: searchKeyword.value })
  if (res.code === 0) {
    searchResults.value = res.data || []
  }
}

function goDetail(id) {
  router.push(`/kb/detail/${id}`)
}

onMounted(() => {
  loadCategories()
  loadArticles()
})
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  gap: 10px;
  align-items: center;
}

.custom-tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}

.search-results {
  .result-item {
    margin-bottom: 10px;
    cursor: pointer;

    .result-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .result-summary {
      color: #606266;
      margin-bottom: 8px;
    }

    .result-meta {
      color: #909399;
      font-size: 12px;
    }
  }
}
</style>
