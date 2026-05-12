<template>
  <div class="images-container">
    <el-empty v-if="!loading && data.length === 0" description="暂无影像资料" />
    <el-row :gutter="20" v-else>
      <el-col :span="6" v-for="item in data" :key="item.id">
        <el-card class="image-card">
          <div class="image-wrapper">
            <img :src="getImageUrl(item.imagePath)" alt="" />
          </div>
          <div class="image-info">
            <div class="image-name">{{ item.imageName }}</div>
            <div class="image-meta">
              <el-tag size="small">{{ getImageTypeText(item.imageType) }}</el-tag>
              <span class="date">{{ item.takeDate }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getPatientImages } from '../../../api'

const props = defineProps({
  patientId: {
    type: Number,
    required: true
  }
})

const loading = ref(false)
const data = ref([])

const loadData = async () => {
  loading.value = true
  try {
    const res = await getPatientImages(props.patientId)
    data.value = res.data || []
  } finally {
    loading.value = false
  }
}

const getImageUrl = (path) => {
  if (!path) return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSI+5b2x5YOPngL/vvIjnvZHnu5zwrnJtZTwvdGV4dD48L3N2Zz4='
  if (path.startsWith('http')) return path
  return 'http://localhost:8080/api' + path
}

const getImageTypeText = (type) => {
  const map = {
    X_RAY: 'X光',
    CT: 'CT',
    CBCT: '口腔全景'
  }
  return map[type] || type
}

watch(() => props.patientId, () => loadData())

onMounted(() => loadData())
</script>

<style lang="scss" scoped>
.images-container {
  margin-top: 15px;

  .image-card {
    margin-bottom: 20px;

    .image-wrapper {
      height: 150px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;

      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: cover;
      }
    }

    .image-info {
      margin-top: 10px;

      .image-name {
        font-weight: bold;
        margin-bottom: 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .image-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: #999;

        .date {
          font-size: 12px;
        }
      }
    }
  }
}
</style>
