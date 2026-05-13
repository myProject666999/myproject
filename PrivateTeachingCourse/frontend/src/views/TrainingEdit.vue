<template>
  <div class="edit-page">
    <van-nav-bar :title="isEdit ? '编辑记录' : '新建记录'" left-arrow @click-left="$router.back()" />
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="form.trainingDate"
          name="trainingDate"
          label="训练日期"
          placeholder="请选择日期"
          type="datetime-local"
          :rules="[{ required: true, message: '请选择日期' }]"
        />
        <van-field
          v-model.number="form.totalDuration"
          name="totalDuration"
          label="训练时长"
          placeholder="请输入时长（分钟）"
          type="number"
        />
      </van-cell-group>

      <div class="section-title">训练动作</div>
      <div v-for="(ex, index) in form.exercises" :key="index" class="exercise-card">
        <div class="ex-header flex-between">
          <span class="ex-order">动作 {{ index + 1 }}</span>
          <van-icon name="delete" size="18" color="#ee0a24" @click="removeExercise(index)" />
        </div>
        <van-field v-model="ex.name" placeholder="动作名称" label="名称" />
        <van-field v-model.number="ex.sets" placeholder="组数" label="组数" type="number" />
        <van-field v-model.number="ex.reps" placeholder="次数" label="次数" type="number" />
        <van-field v-model.number="ex.weight" placeholder="重量(kg)" label="重量" type="number" />
      </div>
      <div class="add-exercise" @click="addExercise">
        <van-icon name="plus" /> 添加动作
      </div>

      <van-cell-group inset>
        <van-field
          v-model="form.notes"
          name="notes"
          label="备注"
          type="textarea"
          placeholder="请输入备注"
          rows="2"
          autosize
        />
      </van-cell-group>

      <div style="margin: 16px">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          保存
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script>
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showSuccessToast, showFailToast } from 'vant'
import { trainingAPI } from '@/api'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(false)
    const isEdit = ref(!!route.params.id)

    const form = reactive({
      trainingDate: new Date().toISOString().split('T')[0],
      totalDuration: 60,
      notes: '',
      exercises: [{ name: '', sets: 4, reps: 12, weight: 0 }]
    })

    const addExercise = () => {
      form.exercises.push({ name: '', sets: 4, reps: 12, weight: 0 })
    }

    const removeExercise = (index) => {
      if (form.exercises.length > 1) {
        form.exercises.splice(index, 1)
      }
    }

    const loadRecord = async () => {
      try {
        const res = await trainingAPI.getById(route.params.id)
        const r = res.record
        form.trainingDate = r.trainingDate
        form.totalDuration = r.totalDuration
        form.notes = r.notes || ''
        form.exercises = r.Exercises?.map(e => ({
          id: e.id,
          name: e.name,
          sets: e.sets,
          reps: e.reps,
          weight: parseFloat(e.weight)
        })) || []
      } catch (e) {
        console.error(e)
      }
    }

    const onSubmit = async () => {
      if (!form.exercises.some(e => e.name)) {
        showFailToast('请至少添加一个训练动作')
        return
      }
      loading.value = true
      try {
        const validExercises = form.exercises.filter(e => e.name)
        if (isEdit.value) {
          await trainingAPI.update(route.params.id, {
            trainingDate: form.trainingDate,
            totalDuration: form.totalDuration,
            notes: form.notes,
            exercises: validExercises
          })
          showSuccessToast('更新成功')
        } else {
          await trainingAPI.create({
            trainingDate: form.trainingDate,
            totalDuration: form.totalDuration,
            notes: form.notes,
            exercises: validExercises
          })
          showSuccessToast('创建成功')
        }
        router.back()
      } catch (e) {
        console.error(e)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      if (isEdit.value) loadRecord()
    })

    return { form, loading, isEdit, addExercise, removeExercise, onSubmit }
  }
}
</script>

<style scoped>
.edit-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 20px;
}
.section-title {
  font-size: 14px;
  color: #969799;
  margin: 16px 12px 8px;
}
.exercise-card {
  background: #fff;
  margin: 0 12px 12px;
  border-radius: 8px;
  padding: 12px;
}
.ex-header {
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebedf0;
}
.ex-order {
  font-size: 14px;
  font-weight: 500;
  color: #1989fa;
}
.add-exercise {
  background: #fff;
  margin: 0 12px;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  color: #1989fa;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
</style>
