<template>
  <div class="page-container">
    <div class="page-header">
      <h2>打卡记录</h2>
      <el-button type="primary" @click="$router.push('/checkin')">
        <el-icon><Plus /></el-icon>
        新增打卡
      </el-button>
    </div>

    <div class="checkin-grid">
      <div 
        v-for="checkin in checkins" 
        :key="checkin.id" 
        class="checkin-card card-shadow"
        @click="goToDetail(checkin.id)"
      >
        <div class="card-photo" v-if="checkin.photoUrl">
          <img :src="checkin.photoUrl" alt="" />
        </div>
        <div class="card-photo placeholder" v-else>
          <el-icon><Picture /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-header">
            <span class="date">{{ checkin.checkinDate }}</span>
            <el-tag type="success" size="small">{{ checkin.mealType }}</el-tag>
          </div>
          <el-rate v-model="checkin.overallRating" disabled :max="5" size="small" />
          <p class="comment">{{ checkin.comment || '暂无评价' }}</p>
        </div>
      </div>
    </div>

    <el-empty v-if="checkins.length === 0 && !loading" description="暂无打卡记录" />

    <div class="pagination" v-if="checkins.length > 0">
      <el-pagination
        v-model:current-page="page"
        :page-size="size"
        :total="total"
        layout="prev, pager, next"
        @current-change="loadCheckins"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { checkinApi } from '@/api'

const router = useRouter()
const checkins = ref([])
const loading = ref(false)
const page = ref(1)
const size = ref(9)
const total = ref(100)

const loadCheckins = async () => {
  loading.value = true
  try {
    checkins.value = await checkinApi.list(page.value, size.value)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const goToDetail = (id) => {
  router.push(`/checkin/${id}`)
}

onMounted(() => {
  loadCheckins()
})
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    margin: 0;
  }
}

.checkin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.checkin-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .card-photo {
    width: 100%;
    height: 180px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &.placeholder {
      background: #e4e7ed;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #909399;
      font-size: 48px;
    }
  }

  .card-content {
    padding: 16px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .date {
        font-weight: bold;
        color: #303133;
      }
    }

    .comment {
      margin: 8px 0 0 0;
      color: #606266;
      font-size: 14px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
