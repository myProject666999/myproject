<template>
  <div class="edit-page">
    <van-nav-bar :title="isEdit ? '编辑体测' : '新建体测'" left-arrow @click-left="$router.back()" />
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="form.testDate"
          name="testDate"
          label="测试日期"
          placeholder="请选择日期"
          type="datetime-local"
          :rules="[{ required: true, message: '请选择日期' }]"
        />
        <van-field
          v-model.number="form.weight"
          name="weight"
          label="体重"
          placeholder="请输入体重(kg)"
          type="number"
          :rules="[{ required: true, message: '请输入体重' }]"
        />
        <van-field
          v-model.number="form.height"
          name="height"
          label="身高"
          placeholder="请输入身高(cm)"
          type="number"
          :rules="[{ required: true, message: '请输入身高' }]"
        />
        <van-field
          v-model.number="form.bodyFat"
          name="bodyFat"
          label="体脂率"
          placeholder="请输入体脂率(%)"
          type="number"
        />
        <van-field
          v-model.number="form.muscleMass"
          name="muscleMass"
          label="肌肉量"
          placeholder="请输入肌肉量(kg)"
          type="number"
        />
        <van-field
          v-model.number="form.waist"
          name="waist"
          label="腰围"
          placeholder="请输入腰围(cm)"
          type="number"
        />
        <van-field
          v-model.number="form.hip"
          name="hip"
          label="臀围"
          placeholder="请输入臀围(cm)"
          type="number"
        />
        <van-field
          v-model.number="form.chest"
          name="chest"
          label="胸围"
          placeholder="请输入胸围(cm)"
          type="number"
        />
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
import { showSuccessToast } from 'vant'
import { bodyTestAPI } from '@/api'

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const loading = ref(false)
    const isEdit = ref(!!route.params.id)

    const form = reactive({
      testDate: new Date().toISOString().split('T')[0],
      weight: '',
      height: '',
      bodyFat: '',
      muscleMass: '',
      waist: '',
      hip: '',
      chest: '',
      notes: ''
    })

    const loadTest = async () => {
      try {
        const res = await bodyTestAPI.getById(route.params.id)
        const t = res.test
        Object.assign(form, {
          testDate: t.testDate,
          weight: t.weight,
          height: t.height,
          bodyFat: t.bodyFat || '',
          muscleMass: t.muscleMass || '',
          waist: t.waist || '',
          hip: t.hip || '',
          chest: t.chest || '',
          notes: t.notes || ''
        })
      } catch (e) {
        console.error(e)
      }
    }

    const onSubmit = async () => {
      loading.value = true
      try {
        if (isEdit.value) {
          await bodyTestAPI.update(route.params.id, form)
          showSuccessToast('更新成功')
        } else {
          await bodyTestAPI.create(form)
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
      if (isEdit.value) loadTest()
    })

    return { form, loading, isEdit, onSubmit }
  }
}
</script>

<style scoped>
.edit-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 20px;
}
</style>
