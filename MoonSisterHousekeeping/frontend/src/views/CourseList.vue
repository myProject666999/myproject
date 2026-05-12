<template>
  <div>
    <h2 class="mb-20">培训课程</h2>

    <el-row :gutter="20">
      <el-col :span="6" v-for="course in courses" :key="course.id">
        <el-card class="course-card" shadow="hover" @click="viewDetail(course.id)">
          <div class="course-cover">
            <el-image
              :src="course.cover || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=online%20course%20learning%20nanny%20training&image_size=square'"
              fit="cover"
              style="width: 100%; height: 180px"
            />
            <div class="course-price" v-if="course.price > 0">
              ¥{{ course.price }}
            </div>
            <div class="course-price free" v-else>
              免费
            </div>
          </div>
          <div class="course-info">
            <h3>{{ course.title }}</h3>
            <p class="course-desc">{{ course.description }}</p>
            <div class="course-meta">
              <el-tag size="small" type="info">{{ course.category || '综合' }}</el-tag>
              <span>{{ course.duration }}分钟</span>
              <span>
                <el-icon><View /></el-icon>
                {{ course.view_count }}
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[8, 16, 24]"
      layout="total, sizes, prev, pager, next"
      @size-change="loadData"
      @current-change="loadData"
      class="mt-20"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCourses } from '@/api'

const router = useRouter()
const courses = ref([])

const pagination = reactive({
  page: 1,
  pageSize: 8,
  total: 0
})

const loadData = async () => {
  try {
    const res = await getCourses({
      page: pagination.page,
      page_size: pagination.pageSize
    })
    courses.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error(error)
  }
}

const viewDetail = (id) => {
  router.push(`/courses/${id}`)
}

onMounted(loadData)
</script>

<style scoped>
.course-card {
  cursor: pointer;
  margin-bottom: 20px;
}

.course-cover {
  position: relative;
  overflow: hidden;
  border-radius: 4px;
}

.course-price {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #f56c6c;
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-weight: bold;
}

.course-price.free {
  background: #67c23a;
}

.course-info {
  padding: 15px 0 0;
}

.course-info h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  line-height: 1.4;
  height: 44px;
  overflow: hidden;
}

.course-desc {
  color: #909399;
  font-size: 13px;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #909399;
  font-size: 12px;
}

.course-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
