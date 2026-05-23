<template>
  <div class="page-container">
    <div v-if="contest" class="card">
      <div class="page-header">
        <h2>{{ contest.title }}</h2>
        <div>
          <el-tag :type="getStatusTagType(contest.status)" size="large">
            {{ getStatusText(contest.status) }}
          </el-tag>
          <el-button v-if="contest.hasPassword && contest.status !== 2" type="primary" @click="showJoinDialog = true" style="margin-left: 10px;">
            加入竞赛
          </el-button>
        </div>
      </div>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="开始时间">{{ contest.startTime }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ contest.endTime }}</el-descriptions-item>
        <el-descriptions-item label="类型">
          {{ contest.type === 2 ? 'CF赛' : '标准赛' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          {{ getStatusText(contest.status) }}
        </el-descriptions-item>
      </el-descriptions>
      <div v-if="contest.description" class="problem-description" style="margin-top: 20px;">
        <h3>竞赛说明</h3>
        <pre>{{ contest.description }}</pre>
      </div>
    </div>

    <div v-if="contest?.problems" class="card">
      <h3>题目列表</h3>
      <el-table :data="contest.problems" stripe>
        <el-table-column label="序号" width="80">
          <template #default="scope">
            {{ String.fromCharCode(65 + scope.$index) }}
          </template>
        </el-table-column>
        <el-table-column label="标题">
          <template #default="scope">
            <router-link :to="`/problem/detail/${scope.row.id}`" style="color: #409eff; text-decoration: none;">
              {{ scope.row.title }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="难度" width="100">
          <template #default="scope">
            <span :class="getDifficultyClass(scope.row.difficulty)">
              {{ getDifficultyText(scope.row.difficulty) }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-if="contest" class="card">
      <h3>排行榜</h3>
      <el-table :data="rankList" stripe>
        <el-table-column label="排名" width="80">
          <template #default="scope">
            <span :class="getRankClass(scope.row.rank)">{{ scope.row.rank }}</span>
          </template>
        </el-table-column>
        <el-table-column label="用户" prop="user.nickname" />
        <el-table-column label="通过数" prop="solvedCount" width="100" />
        <el-table-column label="罚时" width="100">
          <template #default="scope">
            {{ formatPenalty(scope.row.penalty) }}
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="showJoinDialog" title="加入竞赛" width="400px">
      <el-form v-if="contest.hasPassword">
        <el-form-item label="竞赛密码">
          <el-input v-model="joinPassword" type="password" placeholder="请输入竞赛密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showJoinDialog = false">取消</el-button>
        <el-button type="primary" @click="handleJoin">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const route = useRoute()
const contest = ref(null)
const rankList = ref([])
const showJoinDialog = ref(false)
const joinPassword = ref('')

const fetchContest = async () => {
  const res = await request.get(`/contest/detail/${route.params.id}`)
  contest.value = res.data
}

const fetchRank = async () => {
  const res = await request.get(`/contest/rank/${route.params.id}`)
  rankList.value = res.data
}

const handleJoin = async () => {
  try {
    await request.post(`/contest/join/${route.params.id}`, {
      password: joinPassword.value
    })
    ElMessage.success('加入成功')
    showJoinDialog.value = false
    fetchContest()
  } catch (e) {
    // error handled
  }
}

const getStatusText = (s) => ({ 0: '未开始', 1: '进行中', 2: '已结束' }[s] || '未知')
const getStatusTagType = (s) => ({ 0: 'info', 1: 'success', 2: 'info' }[s] || 'info')
const getDifficultyText = (d) => ({ 1: '简单', 2: '中等', 3: '困难' }[d] || '未知')
const getDifficultyClass = (d) => ({ 1: 'difficulty-easy', 2: 'difficulty-medium', 3: 'difficulty-hard' }[d] || '')

const getRankClass = (r) => {
  if (r === 1) return 'rank-gold'
  if (r === 2) return 'rank-silver'
  if (r === 3) return 'rank-bronze'
  return ''
}

const formatPenalty = (seconds) => {
  if (!seconds) return '0:00:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

onMounted(() => {
  fetchContest()
  fetchRank()
})
</script>
