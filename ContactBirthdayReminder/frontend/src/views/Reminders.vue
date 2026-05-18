<template>
  <div class="reminders-page">
    <el-card class="reminder-card">
      <template #header>
        <div class="card-header">
          <span>🎁 即将到来的生日</span>
          <el-input v-model="searchDays" type="number" min="1" max="365" style="width: 120px" placeholder="提前N天" @change="loadReminders" />
        </div>
      </template>
      <el-table :data="reminders" v-loading="loading" stripe>
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="relation" label="关系" width="100" />
        <el-table-column label="生日" width="150">
          <template #default="{ row }">
            {{ formatDate(row.birthday) }}
            <el-tag size="small" :type="row.calendarType === 1 ? 'primary' : 'success'" style="margin-left: 8px">
              {{ row.calendarType === 1 ? '公历' : '农历' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="age" label="年龄" width="80" />
        <el-table-column label="距离天数" width="120">
          <template #default="{ row }">
            <el-tag :type="getDaysTagType(row.daysUntil)">
              {{ row.daysUntil === 0 ? '今天' : row.daysUntil + ' 天' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="sendGreeting(row)">发送贺卡</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="reminders.length === 0 && !loading" description="近期没有生日提醒" />
    </el-card>

    <el-dialog v-model="greetingDialogVisible" title="选择贺卡模板" width="600px">
      <el-row :gutter="20">
        <el-col :span="8" v-for="card in greetingCards" :key="card.id">
          <el-card :body-style="{ padding: '10px' }" class="greeting-card" @click="selectCard(card)">
            <div v-html="card.templateContent" class="card-preview"></div>
            <div style="text-align: center; margin-top: 10px">{{ card.name }}</div>
          </el-card>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import { getUpcomingReminders, getGreetingCards } from '@/api/contact'
import { ElMessage } from 'element-plus'

export default {
  name: 'Reminders',
  data() {
    return {
      reminders: [],
      loading: false,
      searchDays: 7,
      greetingDialogVisible: false,
      greetingCards: [],
      selectedContact: null
    }
  },
  mounted() {
    this.loadReminders()
    this.loadGreetingCards()
  },
  methods: {
    async loadReminders() {
      this.loading = true
      try {
        const res = await getUpcomingReminders(1, this.searchDays)
        if (res.code === 200) {
          this.reminders = res.data
        }
      } catch (e) {
        ElMessage.error('加载提醒失败')
      } finally {
        this.loading = false
      }
    },
    async loadGreetingCards() {
      try {
        const res = await getGreetingCards('生日')
        if (res.code === 200) {
          this.greetingCards = res.data
        }
      } catch (e) {
        console.error(e)
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('zh-CN')
    },
    getDaysTagType(days) {
      if (days === 0) return 'danger'
      if (days <= 3) return 'warning'
      return 'info'
    },
    sendGreeting(row) {
      this.selectedContact = row
      this.greetingDialogVisible = true
    },
    selectCard(card) {
      ElMessage.success(`已为 ${this.selectedContact.name} 选择贺卡：${card.name}`)
      this.greetingDialogVisible = false
    }
  }
}
</script>

<style scoped>
.reminders-page {
  max-width: 900px;
  margin: 0 auto;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.greeting-card {
  cursor: pointer;
  transition: all 0.3s;
}
.greeting-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.card-preview {
  min-height: 100px;
  overflow: hidden;
}
</style>
