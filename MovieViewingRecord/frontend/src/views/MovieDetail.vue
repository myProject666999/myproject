<template>
  <div class="movie-detail page-container">
    <el-loading :loading="loading" text="加载中...">
      <div v-if="movie" class="detail-content">
        <el-row :gutter="40">
          <el-col :span="6">
            <img :src="movie.poster || 'https://via.placeholder.com/300x420?text=No+Image'" :alt="movie.title" class="poster">
          </el-col>
          <el-col :span="18">
            <div class="movie-header">
              <h1 class="title">{{ movie.title }}</h1>
              <span class="original-title" v-if="movie.originalTitle">{{ movie.originalTitle }}</span>
              <div class="basic-info">
                <span class="type-tag">{{ movie.type === 'movie' ? '电影' : '剧集' }}</span>
                <span>{{ movie.year }}年</span>
                <span v-if="movie.duration">{{ movie.duration }}分钟</span>
              </div>
            </div>

            <el-descriptions :column="2" border class="info-section">
              <el-descriptions-item label="导演">{{ movie.director || '未知' }}</el-descriptions-item>
              <el-descriptions-item label="主演">{{ movie.actors || '未知' }}</el-descriptions-item>
              <el-descriptions-item label="类型">{{ movie.genre || '未知' }}</el-descriptions-item>
              <el-descriptions-item label="上映年份">{{ movie.year || '未知' }}</el-descriptions-item>
            </el-descriptions>

            <div class="info-section">
              <h3 class="section-subtitle">剧情简介</h3>
              <p class="description">{{ movie.description || '暂无简介' }}</p>
            </div>

            <div class="record-section" v-if="viewingRecord">
              <h3 class="section-subtitle">我的记录</h3>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="状态">
                  <span :class="['status-tag', viewingRecord.status]">{{ getStatusText(viewingRecord.status) }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="评分">
                  <el-rate v-if="viewingRecord.rating" disabled :value="viewingRecord.rating / 2" show-score text-color="#ff9900"></el-rate>
                  <span v-else>暂无评分</span>
                </el-descriptions-item>
                <el-descriptions-item label="观看日期" :span="2">{{ viewingRecord.watchDate || '未记录' }}</el-descriptions-item>
                <el-descriptions-item label="短评" :span="2">
                  <p v-if="viewingRecord.review">{{ viewingRecord.review }}</p>
                  <span v-else>暂无短评</span>
                </el-descriptions-item>
              </el-descriptions>
              <el-button type="primary" icon="el-icon-edit" style="margin-top: 15px" @click="showEditDialog = true">编辑记录</el-button>
            </div>

            <div class="no-record-section" v-else>
              <el-empty description="暂无观影记录">
                <el-button type="primary" icon="el-icon-plus" @click="showEditDialog = true">添加记录</el-button>
              </el-empty>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-loading>

    <el-dialog :title="viewingRecord ? '编辑观影记录' : '添加观影记录'" :visible.sync="showEditDialog" width="500px">
      <el-form :model="recordForm" label-width="80px">
        <el-form-item label="状态">
          <el-select v-model="recordForm.status" style="width: 100%">
            <el-option label="想看" value="want"></el-option>
            <el-option label="在看" value="watching"></el-option>
            <el-option label="看过" value="watched"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="评分">
          <el-rate v-model="rating" show-score text-color="#ff9900"></el-rate>
        </el-form-item>
        <el-form-item label="观看日期">
          <el-date-picker v-model="recordForm.watchDate" type="date" placeholder="选择日期" style="width: 100%" value-format="yyyy-MM-dd"></el-date-picker>
        </el-form-item>
        <el-form-item label="短评">
          <el-input type="textarea" v-model="recordForm.review" :rows="4" placeholder="写下你的观影感受..."></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveRecord">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from '@/utils/api'

export default {
  name: 'MovieDetail',
  data() {
    return {
      movie: null,
      viewingRecord: null,
      loading: false,
      showEditDialog: false,
      recordForm: {
        status: 'watched',
        rating: null,
        review: '',
        watchDate: null
      },
      rating: 0
    }
  },
  watch: {
    rating(val) {
      this.recordForm.rating = val * 2
    }
  },
  mounted() {
    this.loadMovie()
  },
  methods: {
    async loadMovie() {
      const movieId = this.$route.params.id
      this.loading = true
      try {
        this.movie = await api.getMovieById(movieId)
        try {
          this.viewingRecord = await api.getRecordByMovieId(movieId)
          if (this.viewingRecord) {
            this.recordForm = {
              status: this.viewingRecord.status,
              rating: this.viewingRecord.rating,
              review: this.viewingRecord.review,
              watchDate: this.viewingRecord.watchDate
            }
            this.rating = this.viewingRecord.rating ? this.viewingRecord.rating / 2 : 0
          }
        } catch (e) {
          this.viewingRecord = null
        }
      } finally {
        this.loading = false
      }
    },
    getStatusText(status) {
      const map = { want: '想看', watching: '在看', watched: '看过' }
      return map[status] || status
    },
    async handleSaveRecord() {
      try {
        if (this.viewingRecord) {
          await api.updateRecord(this.viewingRecord.id, {
            ...this.recordForm,
            movieId: this.movie.id
          })
          this.$message.success('更新成功')
        } else {
          await api.saveRecord({
            ...this.recordForm,
            movieId: this.movie.id
          })
          this.$message.success('添加成功')
        }
        this.showEditDialog = false
        this.loadMovie()
      } catch (e) {
        this.$message.error('保存失败')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.movie-detail {
  .detail-content {
    background: white;
    border-radius: 8px;
    padding: 30px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  }

  .poster {
    width: 100%;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  .movie-header {
    margin-bottom: 25px;

    .title {
      font-size: 32px;
      font-weight: bold;
      color: #303133;
      margin: 0 0 8px 0;
    }

    .original-title {
      font-size: 18px;
      color: #909399;
      display: block;
      margin-bottom: 15px;
    }

    .basic-info {
      display: flex;
      align-items: center;
      gap: 15px;
      font-size: 14px;
      color: #606266;

      .type-tag {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 4px 12px;
        border-radius: 4px;
        font-size: 13px;
      }
    }
  }

  .info-section {
    margin-bottom: 25px;
  }

  .section-subtitle {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 12px 0;
  }

  .description {
    color: #606266;
    line-height: 1.8;
    font-size: 14px;
  }

  .record-section {
    margin-top: 30px;
  }

  .no-record-section {
    margin-top: 30px;
    padding: 40px;
    background: #f5f7fa;
    border-radius: 8px;
  }
}
</style>
