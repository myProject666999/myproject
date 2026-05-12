<template>
  <div>
    <div class="page-header flex-between">
      <h2>月嫂列表</h2>
      <el-button type="primary" @click="showFilter = !showFilter">
        <el-icon><Filter /></el-icon>
        筛选
      </el-button>
    </div>

    <el-collapse v-model="showFilter" class="mb-20">
      <el-collapse-item title="筛选条件" name="filter">
        <el-form :inline="true" :model="filter">
          <el-form-item label="等级">
            <el-select v-model="filter.level" placeholder="请选择" clearable>
              <el-option label="初级" value="初级" />
              <el-option label="中级" value="中级" />
              <el-option label="高级" value="高级" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="filter.status" placeholder="请选择" clearable>
              <el-option label="可预约" value="available" />
              <el-option label="已预约" value="booked" />
              <el-option label="服务中" value="working" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadData">搜索</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </el-collapse-item>
    </el-collapse>

    <el-row :gutter="20">
      <el-col :span="8" v-for="nanny in nannies" :key="nanny.id">
        <el-card class="nanny-card" shadow="hover" @click="viewDetail(nanny.id)">
          <div class="nanny-header">
            <el-avatar :size="80">
              <img :src="nanny.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'" />
            </el-avatar>
            <div>
              <h3>{{ nanny.name || `月嫂${nanny.id}` }}</h3>
              <div class="nanny-tags">
                <el-tag type="success" size="small">{{ nanny.level }}</el-tag>
                <el-tag size="small">{{ nanny.experience }}年经验</el-tag>
              </div>
              <div class="rating">
                <el-rate v-model="nanny.rating" disabled :max="5" :show-score="true" />
              </div>
            </div>
          </div>
          <p class="nanny-desc">{{ nanny.description }}</p>
          <div class="nanny-skills">
            <el-tag v-for="skill in nanny.skills" :key="skill.id" size="small" type="info" class="mr-5">
              {{ skill.name }}
            </el-tag>
          </div>
          <div class="nanny-footer">
            <el-tag :type="nanny.status === 'available' ? 'success' : 'info'">
              {{ nanny.status === 'available' ? '可预约' : '服务中' }}
            </el-tag>
            <el-button type="primary" link @click.stop="viewDetail(nanny.id)">查看详情</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[6, 12, 24]"
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
import { getNannies } from '@/api'

const router = useRouter()
const nannies = ref([])
const showFilter = ref(false)

const filter = reactive({
  level: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 6,
  total: 0
})

const loadData = async () => {
  try {
    const res = await getNannies({
      page: pagination.page,
      page_size: pagination.pageSize,
      level: filter.level,
      status: filter.status
    })
    nannies.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error(error)
  }
}

const resetFilter = () => {
  filter.level = ''
  filter.status = ''
  loadData()
}

const viewDetail = (id) => {
  router.push(`/nannies/${id}`)
}

onMounted(loadData)
</script>

<style scoped>
.nanny-card {
  cursor: pointer;
  margin-bottom: 20px;
}

.nanny-header {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.nanny-header h3 {
  margin: 0 0 10px 0;
}

.nanny-tags {
  margin-bottom: 8px;
}

.nanny-tags .el-tag {
  margin-right: 8px;
}

.nanny-desc {
  color: #606266;
  font-size: 14px;
  margin: 10px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.nanny-skills {
  margin: 10px 0;
}

.nanny-skills .el-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.nanny-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #ebeef5;
}

.mr-5 {
  margin-right: 5px;
}
</style>
