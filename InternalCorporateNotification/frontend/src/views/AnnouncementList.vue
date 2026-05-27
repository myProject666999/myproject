<template>
  <div class="page-container">
    <div class="card mb-20">
      <div class="flex-between mb-20">
        <div class="page-title">公告列表</div>
        <el-button type="primary" v-if="userStore.isAdmin" @click="$router.push('/publish')">
          <el-icon><Edit /></el-icon>
          发布公告
        </el-button>
      </div>

      <div class="filter-bar">
        <el-form :inline="true" :model="filters" size="default">
          <el-form-item label="分类">
            <el-select v-model="filters.categoryId" placeholder="全部" clearable style="width: 150px">
              <el-option label="全部" :value="null" />
              <el-option
                v-for="cat in categories"
                :key="cat.id"
                :label="cat.name"
                :value="cat.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="类型">
            <el-select v-model="filters.type" placeholder="全部" clearable style="width: 150px">
              <el-option label="全部" :value="null" />
              <el-option label="普通公告" :value="1" />
              <el-option label="紧急公告" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="搜索">
            <el-input
              v-model="filters.keyword"
              placeholder="搜索公告标题"
              clearable
              style="width: 250px"
              @keyup.enter="loadList"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadList">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="resetFilters">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <div class="card">
      <div v-if="topList.length > 0" class="top-section mb-20">
        <h3 class="section-title">
          <el-icon color="#e6a23c"><Star /></el-icon>
          置顶公告
        </h3>
        <div
          v-for="item in topList"
          :key="item.id"
          class="announcement-item"
          @click="viewDetail(item)"
        >
          <div class="flex-between">
            <div class="announcement-title">
              <span class="tag-top">置顶</span>
              <span v-if="item.type === 2" class="tag-emergency ml-10">紧急</span>
              <span class="ml-10 title-text">{{ item.title }}</span>
            </div>
            <el-tag size="small" :type="item.isRead ? 'success' : 'danger'">
              {{ item.isRead ? '已读' : '未读' }}
            </el-tag>
          </div>
          <div class="announcement-meta">
            <span>{{ item.publisherName }}</span>
            <span class="dot">·</span>
            <span>{{ item.categoryName }}</span>
            <span class="dot">·</span>
            <span>{{ formatDate(item.publishTime) }}</span>
            <span class="dot">·</span>
            <span>已读 {{ item.readCount }}/{{ item.totalCount }}</span>
          </div>
        </div>
      </div>

      <div class="normal-section">
        <h3 class="section-title">
          <el-icon><Document /></el-icon>
          全部公告
        </h3>
        <div
          v-for="item in list"
          :key="item.id"
          class="announcement-item"
          @click="viewDetail(item)"
        >
          <div class="flex-between">
            <div class="announcement-title">
              <span v-if="item.type === 2" class="tag-emergency">紧急</span>
              <span class="title-text">{{ item.title }}</span>
            </div>
            <el-tag size="small" :type="item.isRead ? 'success' : 'danger'">
              {{ item.isRead ? '已读' : '未读' }}
            </el-tag>
          </div>
          <div class="announcement-meta">
            <span>{{ item.publisherName }}</span>
            <span class="dot">·</span>
            <span>{{ item.categoryName }}</span>
            <span class="dot">·</span>
            <span>{{ formatDate(item.publishTime) }}</span>
            <span class="dot">·</span>
            <span>已读 {{ item.readCount }}/{{ item.totalCount }}</span>
          </div>
        </div>
        <div v-if="list.length === 0" class="empty-state">
          <el-empty description="暂无公告" />
        </div>
      </div>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadList"
          @current-change="loadList"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { getAnnouncements, getCategories, getUnreadCount } from '@/api'
import dayjs from 'dayjs'

const router = useRouter()
const userStore = useUserStore()

const categories = ref([])
const list = ref([])
const topList = ref([])

const filters = reactive({
  categoryId: null,
  type: null,
  priority: null,
  keyword: ''
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

onMounted(() => {
  loadCategories()
  loadList()
})

async function loadCategories() {
  try {
    const res = await getCategories()
    categories.value = res.data
  } catch (e) {}
}

async function loadList() {
  try {
    const res = await getAnnouncements({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      categoryId: filters.categoryId,
      type: filters.type,
      priority: filters.priority,
      keyword: filters.keyword || undefined
    })
    const allList = res.data.list || []
    topList.value = allList.filter(item => item.priority === 1)
    list.value = allList.filter(item => item.priority !== 1)
    pagination.total = res.data.total || 0
    
    const unreadRes = await getUnreadCount()
    userStore.setUnreadCount(unreadRes.data)
  } catch (e) {}
}

function resetFilters() {
  filters.categoryId = null
  filters.type = null
  filters.priority = null
  filters.keyword = ''
  pagination.pageNum = 1
  loadList()
}

function viewDetail(item) {
  router.push(`/announcements/${item.id}`)
}

function formatDate(date) {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}
</script>

<style scoped>
.filter-bar {
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #303133;
  gap: 6px;
}

.top-section {
  padding-bottom: 15px;
  border-bottom: 2px dashed #ebeef5;
}

.announcement-title {
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  color: #303133;
}

.title-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 600px;
}

.announcement-meta {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #909399;
  margin-top: 8px;
}

.dot {
  margin: 0 6px;
}

.ml-10 {
  margin-left: 10px;
}

.empty-state {
  padding: 40px 0;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
</style>
