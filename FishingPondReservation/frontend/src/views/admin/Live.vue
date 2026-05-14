<template>
  <div class="live-admin">
    <el-card>
      <div slot="header" style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: bold;">直播管理</span>
        <el-button type="primary" @click="openDialog">创建直播</el-button>
      </div>

      <el-table :data="liveList" border>
        <el-table-column prop="title" label="标题"></el-table-column>
        <el-table-column prop="streamUrl" label="推流地址" width="250"></el-table-column>
        <el-table-column prop="viewCount" label="观看人数" width="120"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'danger' : 'info'" size="small">
              {{ scope.row.status === 1 ? '直播中' : '未开播' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="180"></el-table-column>
        <el-table-column prop="endTime" label="结束时间" width="180"></el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button 
              v-if="scope.row.status === 0"
              type="success" 
              size="small" 
              @click="startLive(scope.row.id)">
              开始直播
            </el-button>
            <el-button 
              v-if="scope.row.status === 1"
              type="warning" 
              size="small" 
              @click="stopLive(scope.row.id)">
              结束直播
            </el-button>
            <el-button type="primary" size="small" @click="openLiveScreen">
              打开大屏
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="创建直播" :visible.sync="dialogVisible" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="标题">
          <el-input v-model="form.title"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3"></el-input>
        </el-form-item>
        <el-form-item label="推流地址">
          <el-input v-model="form.streamUrl"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '../../utils/request'

export default {
  name: 'LiveAdmin',
  data() {
    return {
      liveList: [],
      dialogVisible: false,
      submitting: false,
      form: {
        title: '',
        description: '',
        streamUrl: ''
      }
    }
  },
  mounted() {
    this.loadLiveList()
  },
  methods: {
    async loadLiveList() {
      try {
        const res = await request.get('/live/list')
        this.liveList = res.data
      } catch (error) {
        console.error(error)
      }
    },
    openDialog() {
      this.form = {
        title: '',
        description: '',
        streamUrl: 'rtmp://localhost/live/fishing'
      }
      this.dialogVisible = true
    },
    async submitForm() {
      if (!this.form.title) {
        this.$message.warning('请输入标题')
        return
      }
      this.submitting = true
      try {
        await request.post('/live', this.form)
        this.$message.success('创建成功')
        this.dialogVisible = false
        this.loadLiveList()
      } catch (error) {
        console.error(error)
      } finally {
        this.submitting = false
      }
    },
    async startLive(id) {
      try {
        await request.put('/live/' + id + '/start')
        this.$message.success('直播已开始')
        this.loadLiveList()
      } catch (error) {
        console.error(error)
      }
    },
    async stopLive(id) {
      try {
        await request.put('/live/' + id + '/stop')
        this.$message.success('直播已结束')
        this.loadLiveList()
      } catch (error) {
        console.error(error)
      }
    },
    openLiveScreen() {
      window.open('/live-screen', '_blank')
    }
  }
}
</script>

<style scoped>
.live-admin {
  padding: 10px;
}
</style>
