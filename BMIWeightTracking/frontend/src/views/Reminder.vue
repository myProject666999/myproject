<template>
  <div class="reminder-page">
    <el-card style="max-width:500px;margin:0 auto">
      <div slot="header" class="card-header"><span>⏰ 体重记录提醒</span></div>
      <el-form label-width="100px">
        <el-form-item label="提醒时间">
          <el-time-select v-model="form.reminderTime" start="06:00" step="00:30" end="22:00"></el-time-select>
        </el-form-item>
        <el-form-item label="启用提醒">
          <el-switch v-model="form.enabled" :active-value="1" :inactive-value="0" active-text="开" inactive-text="关"></el-switch>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="save">保存</el-button>
        </el-form-item>
      </el-form>
      <el-alert v-if="reminder" :title="'当前提醒时间: ' + reminder.reminderTime + (reminder.enabled === 1 ? ' (已启用)' : ' (已关闭)')" type="info" :closable="false"></el-alert>
    </el-card>
  </div>
</template>

<script>
import { getReminder, setReminder } from '../api'

export default {
  data() {
    return {
      form: { reminderTime: '08:00', enabled: 1 },
      reminder: null
    }
  },
  async created() {
    const res = await getReminder()
    if (res.data) {
      this.reminder = res.data
      this.form.reminderTime = res.data.reminderTime
      this.form.enabled = res.data.enabled
    }
  },
  methods: {
    async save() {
      const res = await setReminder(this.form.reminderTime, this.form.enabled)
      this.reminder = res.data
      this.$message.success('提醒设置已保存')
    }
  }
}
</script>

<style scoped>
.reminder-page { max-width: 1100px; margin: 0 auto; }
.card-header { font-weight: bold; }
</style>
