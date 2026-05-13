<template>
  <div class="match-page">
    <el-card>
      <div slot="header" style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 18px; font-weight: bold;">拼场约球</span>
        <el-button type="primary" @click="showCreateDialog">发起拼场</el-button>
      </div>

      <div style="margin-bottom: 20px;">
        <el-form :inline="true">
          <el-form-item label="运动类型">
            <el-select v-model="filter.sportType" placeholder="全部" style="width: 150px;" @change="loadData">
              <el-option label="全部" value=""></el-option>
              <el-option label="羽毛球" value="BADMINTON"></el-option>
              <el-option label="网球" value="TENNIS"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="日期">
            <el-date-picker
              v-model="filter.date"
              type="date"
              placeholder="选择日期"
              value-format="yyyy-MM-dd"
              @change="loadData">
            </el-date-picker>
          </el-form-item>
        </el-form>
      </div>

      <el-row :gutter="20">
        <el-col :span="8" v-for="match in matches" :key="match.id" style="margin-bottom: 20px;">
          <el-card class="match-card" shadow="hover">
            <div slot="header" style="display: flex; justify-content: space-between; align-items: center;">
              <el-tag :type="match.sportType === 'BADMINTON' ? 'success' : 'warning'" size="small">
                {{ match.sportType === 'BADMINTON' ? '羽毛球' : '网球' }}
              </el-tag>
              <el-progress
                :percentage="Math.round((match.currentPlayers / match.maxPlayers) * 100)"
                :stroke-width="10"
                style="width: 100px;">
              </el-progress>
            </div>
            <div style="margin-bottom: 10px;">
              <p><strong>日期：</strong>{{ match.date }}</p>
              <p><strong>时段：</strong>{{ match.timeSlot }}</p>
              <p><strong>人数：</strong>{{ match.currentPlayers }}/{{ match.maxPlayers }}人</p>
              <p v-if="match.description"><strong>描述：</strong>{{ match.description }}</p>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #909399; font-size: 12px;">
                发起人: {{ match.initiatorName || '未知' }}
              </span>
              <el-button
                v-if="match.status === 1 && !isInitiator(match)"
                type="primary"
                size="small"
                :disabled="match.currentPlayers >= match.maxPlayers"
                @click="joinMatch(match)">
                加入
              </el-button>
              <el-button
                v-else-if="isInitiator(match)"
                type="text"
                size="small"
                @click="viewPlayers(match)">
                查看队员
              </el-button>
              <el-tag v-else-if="match.status === 2" type="info" size="small">已满员</el-tag>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-empty v-if="matches.length === 0" description="暂无拼场信息"></el-empty>
    </el-card>

    <el-dialog title="发起拼场" :visible.sync="createDialogVisible" width="500px">
      <el-form :model="createForm" label-width="80px">
        <el-form-item label="运动类型">
          <el-select v-model="createForm.sportType" style="width: 100%;">
            <el-option label="羽毛球" value="BADMINTON"></el-option>
            <el-option label="网球" value="TENNIS"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="createForm.date"
            type="date"
            style="width: 100%;"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOptions">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="时段">
          <el-select v-model="createForm.timeSlot" placeholder="选择时段" style="width: 100%;">
            <el-option v-for="slot in timeSlots" :key="slot" :label="slot" :value="slot"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="人数">
          <el-input-number v-model="createForm.maxPlayers" :min="2" :max="8"></el-input-number>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            type="textarea"
            v-model="createForm.description"
            :rows="3"
            placeholder="请输入描述信息">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCreate">发起</el-button>
      </span>
    </el-dialog>

    <el-dialog title="队员列表" :visible.sync="playersDialogVisible" width="400px">
      <el-table :data="players" style="width: 100%;">
        <el-table-column label="序号" type="index" width="60"></el-table-column>
        <el-table-column label="用户ID" prop="userId"></el-table-column>
        <el-table-column label="加入时间" prop="joinTime"></el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import request from '../utils/request'

export default {
  name: 'Match',
  data() {
    return {
      matches: [],
      players: [],
      filter: {
        sportType: '',
        date: null
      },
      createDialogVisible: false,
      createForm: {
        sportType: 'BADMINTON',
        date: '',
        timeSlot: '',
        maxPlayers: 4,
        description: ''
      },
      playersDialogVisible: false,
      currentMatch: null,
      timeSlots: [
        '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
        '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00',
        '16:00-17:00', '17:00-18:00', '18:00-19:00', '19:00-20:00',
        '20:00-21:00', '21:00-22:00'
      ],
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7
        }
      }
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo || {}
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      try {
        const params = {}
        if (this.filter.sportType) {
          params.sportType = this.filter.sportType
        }
        if (this.filter.date) {
          params.date = this.filter.date
        }
        this.matches = await request.get('/match/list', { params })
        this.matches = this.matches || []
      } catch (error) {
        console.error(error)
      }
    },
    isInitiator(match) {
      return match.initiatorId === this.userInfo.id
    },
    showCreateDialog() {
      this.createForm = {
        sportType: 'BADMINTON',
        date: '',
        timeSlot: '',
        maxPlayers: 4,
        description: ''
      }
      this.createDialogVisible = true
    },
    async submitCreate() {
      if (!this.createForm.date || !this.createForm.timeSlot) {
        this.$message.warning('请选择日期和时段')
        return
      }
      try {
        await request.post('/match', {
          initiatorId: this.userInfo.id,
          ...this.createForm
        })
        this.$message.success('发起成功')
        this.createDialogVisible = false
        this.loadData()
      } catch (error) {
        console.error(error)
      }
    },
    async joinMatch(match) {
      try {
        await request.post('/match/' + match.id + '/join', null, {
          params: { userId: this.userInfo.id }
        })
        this.$message.success('加入成功')
        this.loadData()
      } catch (error) {
        console.error(error)
      }
    },
    async viewPlayers(match) {
      this.currentMatch = match
      try {
        this.players = await request.get('/match/' + match.id + '/players')
        this.playersDialogVisible = true
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>

<style scoped>
.match-page {
  padding: 20px;
}
.match-card {
  height: 100%;
}
</style>