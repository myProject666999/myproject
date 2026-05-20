<template>
  <div class="library page-container">
    <div class="search-bar">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索电影、电视剧名称"
            clearable
            @keyup.enter="handleSearch">
            <el-button slot="append" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-select v-model="searchType" placeholder="类型" clearable style="width: 100%">
            <el-option label="电影" value="movie"></el-option>
            <el-option label="电视剧" value="tv"></el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="searchYear" placeholder="年份" clearable style="width: 100%">
            <el-option v-for="year in years" :key="year" :label="year" :value="year"></el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="filterStatus" placeholder="观影状态" clearable style="width: 100%" @change="handleStatusFilter">
            <el-option label="想看" value="want"></el-option>
            <el-option label="在看" value="watching"></el-option>
            <el-option label="看过" value="watched"></el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" icon="el-icon-plus" @click="showAddDialog = true">添加影视</el-button>
        </el-col>
      </el-row>
    </div>

    <div class="section-title">{{ filterStatus ? getStatusText(filterStatus) : '全部影视' }}</div>

    <el-loading :loading="loading" text="加载中...">
      <el-row :gutter="20" v-if="movies.length > 0">
        <el-col :span="4" v-for="movie in movies" :key="movie.id">
          <div class="movie-card" @click="goToDetail(movie.id)">
            <img :src="movie.poster || 'https://via.placeholder.com/200x280?text=No+Image'" :alt="movie.title" class="poster">
            <div class="info">
              <div class="title" :title="movie.title">{{ movie.title }}</div>
              <div class="meta">
                <span>{{ movie.year || '未知' }}</span>
                <span class="type-tag">{{ movie.type === 'movie' ? '电影' : '剧集' }}</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>

      <el-empty v-else description="暂无数据"></el-empty>
    </el-loading>

    <el-pagination
      v-if="total > 0"
      class="pagination"
      background
      layout="prev, pager, next, total"
      :total="total"
      :current-page.sync="currentPage"
      :page-size="pageSize"
      @current-change="handlePageChange">
    </el-pagination>

    <el-dialog title="添加影视" :visible.sync="showAddDialog" width="500px">
      <el-form :model="addForm" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="addForm.title"></el-input>
        </el-form-item>
        <el-form-item label="原名">
          <el-input v-model="addForm.originalTitle"></el-input>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="addForm.type" style="width: 100%">
            <el-option label="电影" value="movie"></el-option>
            <el-option label="电视剧" value="tv"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="年份">
          <el-input-number v-model="addForm.year" :min="1900" :max="2100"></el-input-number>
        </el-form-item>
        <el-form-item label="海报链接">
          <el-input v-model="addForm.poster"></el-input>
        </el-form-item>
        <el-form-item label="简介">
          <el-input type="textarea" v-model="addForm.description" :rows="3"></el-input>
        </el-form-item>
        <el-form-item label="导演">
          <el-input v-model="addForm.director"></el-input>
        </el-form-item>
        <el-form-item label="主演">
          <el-input v-model="addForm.actors"></el-input>
        </el-form-item>
        <el-form-item label="类型标签">
          <el-input v-model="addForm.genre"></el-input>
        </el-form-item>
        <el-form-item label="时长(分钟)">
          <el-input-number v-model="addForm.duration" :min="1"></el-input-number>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddMovie">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/utils/api'

export default {
  name: 'Library',
  data() {
    return {
      searchKeyword: '',
      searchType: '',
      searchYear: null,
      filterStatus: '',
      years: [],
      movies: [],
      total: 0,
      currentPage: 1,
      pageSize: 20,
      loading: false,
      showAddDialog: false,
      addForm: {
        title: '',
        originalTitle: '',
        type: 'movie',
        year: new Date().getFullYear(),
        poster: '',
        description: '',
        director: '',
        actors: '',
        genre: '',
        duration: 0
      }
    }
  },
  mounted() {
    this.loadYears()
    this.loadMovies()
  },
  methods: {
    async loadYears() {
      try {
        this.years = await api.searchMovies({ page: 0, size: 1000 }).then(res => {
          const yearSet = new Set()
          res.content.forEach(m => m.year && yearSet.add(m.year))
          return Array.from(yearSet).sort((a, b) => b - a)
        })
      } catch (e) {
        console.error(e)
      }
    },
    async loadMovies() {
      if (this.filterStatus) {
        this.loadMoviesByStatus()
      } else {
        this.loadAllMovies()
      }
    },
    async loadAllMovies() {
      this.loading = true
      try {
        const params = {
          keyword: this.searchKeyword || undefined,
          type: this.searchType || undefined,
          year: this.searchYear || undefined,
          page: this.currentPage - 1,
          size: this.pageSize
        }
        const res = await api.searchMovies(params)
        this.movies = res.content
        this.total = res.totalElements
      } finally {
        this.loading = false
      }
    },
    async loadMoviesByStatus() {
      this.loading = true
      try {
        const params = {
          status: this.filterStatus,
          keyword: this.searchKeyword || undefined,
          page: this.currentPage - 1,
          size: this.pageSize
        }
        const res = await api.getRecords(params)
        this.movies = res.content.map(r => r.movie)
        this.total = res.totalElements
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      this.currentPage = 1
      this.loadMovies()
    },
    handleStatusFilter() {
      this.currentPage = 1
      this.loadMovies()
    },
    handlePageChange(page) {
      this.currentPage = page
      this.loadMovies()
    },
    goToDetail(id) {
      this.$router.push(`/movie/${id}`)
    },
    getStatusText(status) {
      const map = { want: '想看', watching: '在看', watched: '看过' }
      return map[status] || status
    },
    async handleAddMovie() {
      if (!this.addForm.title) {
        this.$message.warning('请输入标题')
        return
      }
      try {
        const movie = await api.saveMovie(this.addForm)
        this.$message.success('添加成功')
        this.showAddDialog = false
        this.addForm = {
          title: '',
          originalTitle: '',
          type: 'movie',
          year: new Date().getFullYear(),
          poster: '',
          description: '',
          director: '',
          actors: '',
          genre: '',
          duration: 0
        }
        this.loadMovies()
      } catch (e) {
        this.$message.error('添加失败')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.library {
  .type-tag {
    background: #f0f2f5;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
  }

  .pagination {
    margin-top: 30px;
    text-align: center;
  }
}
</style>
