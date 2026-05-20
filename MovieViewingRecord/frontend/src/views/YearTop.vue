<template>
  <div class="year-top page-container">
    <div class="year-selector">
      <el-radio-group v-model="selectedYear" @change="loadYearTop" size="large">
        <el-radio-button v-for="year in availableYears" :key="year" :label="year">{{ year }}年</el-radio-button>
      </el-radio-group>
      <el-button type="primary" icon="el-icon-plus" style="margin-left: 20px" @click="showAddDialog = true">添加到榜单</el-button>
      <el-button type="danger" icon="el-icon-delete" @click="handleClearYear" :disabled="topList.length === 0">清空榜单</el-button>
    </div>

    <div class="section-title">{{ selectedYear }}年度 Top10</div>

    <el-loading :loading="loading" text="加载中...">
      <div v-if="topList.length > 0" class="top-list">
        <div v-for="(item, index) in topList" :key="item.id" class="top-item" @click="goToDetail(item.movieId)">
          <div class="rank" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
          <img :src="item.movie.poster || 'https://via.placeholder.com/120x170?text=No+Image'" :alt="item.movie.title" class="poster">
          <div class="info">
            <h3 class="title">{{ item.movie.title }}</h3>
            <p class="meta">
              <span>{{ item.movie.year }}年</span>
              <span>{{ item.movie.type === 'movie' ? '电影' : '剧集' }}</span>
              <span v-if="item.movie.genre">{{ item.movie.genre }}</span>
            </p>
            <p class="director" v-if="item.movie.director">导演: {{ item.movie.director }}</p>
            <div class="actions">
              <el-button type="text" icon="el-icon-delete" @click.stop="handleDelete(item.id)">移除</el-button>
            </div>
          </div>
        </div>
      </div>

      <el-empty v-else description="该年度暂无Top10榜单">
        <el-button type="primary" icon="el-icon-plus" @click="showAddDialog = true">添加影视</el-button>
      </el-empty>
    </el-loading>

    <el-dialog title="添加到年度榜单" :visible.sync="showAddDialog" width="600px">
      <el-form :model="addForm" label-width="80px">
        <el-form-item label="选择排名">
          <el-select v-model="addForm.rank" style="width: 100%">
            <el-option v-for="n in 10" :key="n" :label="`第 ${n} 名`" :value="n"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="搜索影视">
          <el-input v-model="searchMovieKeyword" placeholder="输入影视名称搜索">
            <el-button slot="append" icon="el-icon-search" @click="searchMovies">搜索</el-button>
          </el-input>
        </el-form-item>
        <el-form-item label="选择影视" v-if="searchResults.length > 0">
          <el-radio-group v-model="addForm.movieId" class="movie-select">
            <el-radio v-for="movie in searchResults" :key="movie.id" :label="movie.id" class="movie-option">
              <img :src="movie.poster || 'https://via.placeholder.com/60x85?text=' + movie.title" class="mini-poster">
              <div class="movie-info">
                <div class="movie-title">{{ movie.title }}</div>
                <div class="movie-meta">{{ movie.year }} {{ movie.type === 'movie' ? '电影' : '剧集' }}</div>
              </div>
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddToTop" :disabled="!addForm.movieId || !addForm.rank">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/utils/api'

export default {
  name: 'YearTop',
  data() {
    return {
      selectedYear: new Date().getFullYear(),
      availableYears: [],
      topList: [],
      loading: false,
      showAddDialog: false,
      addForm: {
        rank: null,
        movieId: null
      },
      searchMovieKeyword: '',
      searchResults: []
    }
  },
  mounted() {
    this.loadAvailableYears()
    this.loadYearTop()
  },
  methods: {
    async loadAvailableYears() {
      try {
        const years = await api.getTopYears()
        const currentYear = new Date().getFullYear()
        const yearSet = new Set([...years, currentYear, currentYear - 1])
        this.availableYears = Array.from(yearSet).sort((a, b) => b - a)
      } catch (e) {
        console.error(e)
        this.availableYears = [new Date().getFullYear(), new Date().getFullYear() - 1]
      }
    },
    async loadYearTop() {
      this.loading = true
      try {
        this.topList = await api.getYearTop(this.selectedYear)
      } finally {
        this.loading = false
      }
    },
    async searchMovies() {
      if (!this.searchMovieKeyword.trim()) return
      try {
        const res = await api.searchMovies({ keyword: this.searchMovieKeyword, page: 0, size: 10 })
        this.searchResults = res.content
      } catch (e) {
        this.$message.error('搜索失败')
      }
    },
    async handleAddToTop() {
      try {
        await api.saveYearTop({
          year: this.selectedYear,
          rank: this.addForm.rank,
          movieId: this.addForm.movieId
        })
        this.$message.success('添加成功')
        this.showAddDialog = false
        this.addForm = { rank: null, movieId: null }
        this.searchMovieKeyword = ''
        this.searchResults = []
        this.loadAvailableYears()
        this.loadYearTop()
      } catch (e) {
        this.$message.error('添加失败')
      }
    },
    async handleDelete(id) {
      this.$confirm('确定要从榜单中移除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await api.deleteYearTop(id)
          this.$message.success('移除成功')
          this.loadYearTop()
        } catch (e) {
          this.$message.error('移除失败')
        }
      }).catch(() => {})
    },
    async handleClearYear() {
      this.$confirm('确定要清空该年度的Top10榜单吗？此操作不可恢复。', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }).then(async () => {
        try {
          await api.clearYearTop(this.selectedYear)
          this.$message.success('清空成功')
          this.loadYearTop()
        } catch (e) {
          this.$message.error('清空失败')
        }
      }).catch(() => {})
    },
    goToDetail(movieId) {
      this.$router.push(`/movie/${movieId}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.year-top {
  .year-selector {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  }

  .top-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .top-item {
    background: white;
    border-radius: 8px;
    padding: 15px;
    display: flex;
    align-items: center;
    gap: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
      transform: translateX(5px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .rank {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: bold;
      color: white;
      flex-shrink: 0;

      &.rank-1 { background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); }
      &.rank-2 { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); }
      &.rank-3 { background: linear-gradient(135deg, #d299c2 0%, #fef9d7 100%); }
      &.rank-4, &.rank-5, &.rank-6, &.rank-7, &.rank-8, &.rank-9, &.rank-10 {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
    }

    .poster {
      width: 100px;
      height: 140px;
      object-fit: cover;
      border-radius: 4px;
      flex-shrink: 0;
    }

    .info {
      flex: 1;

      .title {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        margin: 0 0 8px 0;
      }

      .meta {
        font-size: 14px;
        color: #909399;
        margin: 0 0 6px 0;
        display: flex;
        gap: 15px;
      }

      .director {
        font-size: 14px;
        color: #606266;
        margin: 0;
      }

      .actions {
        margin-top: 10px;
      }
    }
  }

  .movie-select {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 300px;
    overflow-y: auto;
  }

  .movie-option {
    display: flex !important;
    align-items: center;
    gap: 10px;
    padding: 8px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    margin-right: 0 !important;

    &:hover {
      border-color: #667eea;
    }

    .mini-poster {
      width: 40px;
      height: 60px;
      object-fit: cover;
      border-radius: 2px;
    }

    .movie-info {
      flex: 1;

      .movie-title {
        font-size: 14px;
        color: #303133;
      }

      .movie-meta {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}
</style>
