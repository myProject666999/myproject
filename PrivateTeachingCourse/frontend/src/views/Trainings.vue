<template>
  <div class="page-container">
    <div class="page-header flex-between">
      <h3>训练记录</h3>
      <van-button type="primary" size="small" round @click="$router.push('/training-edit')">
        <van-icon name="plus" /> 新建
      </van-button>
    </div>

    <van-loading v-if="loading" class="flex-center" style="padding: 40px" />
    <van-empty v-else-if="records.length === 0" description="暂无训练记录" />
    <div v-else>
      <div v-for="record in records" :key="record.id" class="record-card">
        <div class="record-header flex-between">
          <span class="record-date">{{ record.trainingDate }}</span>
          <van-dropdown-menu>
            <van-dropdown-item v-model="actionIndex" :options="actionOptions" @change="handleAction(record, actionIndex)" />
          </van-dropdown-menu>
        </div>
        <div class="record-summary">
          <span>动作：{{ record.Exercises?.length || 0 }}个</span>
          <span v-if="record.totalDuration">时长：{{ record.totalDuration }}分钟</span>
        </div>
        <div class="exercise-list" v-if="record.Exercises?.length">
          <div v-for="ex in record.Exercises" :key="ex.id" class="exercise-item">
            <span class="ex-name">{{ ex.name }}</span>
            <span class="ex-detail">{{ ex.sets }}组 × {{ ex.reps }}次</span>
            <span v-if="ex.weight" class="ex-weight">{{ ex.weight }}kg</span>
          </div>
        </div>
        <div class="record-notes" v-if="record.notes">{{ record.notes }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showSuccessToast } from 'vant'
import { trainingAPI } from '@/api'

export default {
  setup() {
    const router = useRouter()
    const loading = ref(true)
    const records = ref([])
    const actionIndex = ref(null)
    const actionOptions = [
      { text: '操作', value: null },
      { text: '编辑', value: 'edit' },
      { text: '删除', value: 'delete' }
    ]

    const loadRecords = async () => {
      loading.value = true
      try {
        const res = await trainingAPI.getAll()
        records.value = res.records
      } finally {
        loading.value = false
      }
    }

    const handleAction = async (record, action) => {
      actionIndex.value = null
      if (action === 'edit') {
        router.push(`/training-edit/${record.id}`)
      } else if (action === 'delete') {
        try {
          await showConfirmDialog({ title: '确认删除', message: '确定要删除这条训练记录吗？' })
          await trainingAPI.delete(record.id)
          showSuccessToast('已删除')
          loadRecords()
        } catch (e) {
          if (e !== 'cancel') console.error(e)
        }
      }
    }

    onMounted(loadRecords)
    return { loading, records, actionIndex, actionOptions, handleAction }
  }
}
</script>

<style scoped>
.page-header {
  margin-bottom: 16px;
}
.page-header h3 {
  font-size: 18px;
  margin: 0;
}
.record-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}
.record-header {
  margin-bottom: 12px;
}
.record-date {
  font-size: 16px;
  font-weight: 600;
  color: #1989fa;
}
.record-summary {
  font-size: 13px;
  color: #969799;
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}
.exercise-list {
  background: #f7f8fa;
  border-radius: 6px;
  padding: 12px;
}
.exercise-item {
  display: flex;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #ebedf0;
}
.exercise-item:last-child {
  border-bottom: none;
}
.ex-name {
  flex: 1;
  font-size: 14px;
}
.ex-detail {
  font-size: 13px;
  color: #646566;
  margin-right: 12px;
}
.ex-weight {
  font-size: 13px;
  color: #1989fa;
  font-weight: 500;
}
.record-notes {
  font-size: 13px;
  color: #969799;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #ebedf0;
}
</style>
