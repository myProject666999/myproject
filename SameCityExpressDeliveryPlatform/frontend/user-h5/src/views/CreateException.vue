<template>
  <div class="create-exception-page page-container">
    <van-nav-bar
      title="申报异常"
      left-arrow
      @click-left="$router.back()"
    />

    <van-form @submit="handleSubmit">
      <van-cell-group inset>
        <van-field
          v-model="form.type"
          readonly
          is-link
          label="异常类型"
          placeholder="请选择异常类型"
          @click="showTypePicker = true"
        />
        <van-field
          v-model="form.description"
          type="textarea"
          label="问题描述"
          placeholder="请详细描述您遇到的问题"
          rows="4"
          :rules="[{ required: true, message: '请输入问题描述' }]"
        />
      </van-cell-group>

      <div style="margin: 16px">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          提交
        </van-button>
      </div>
    </van-form>

    <van-popup v-model:show="showTypePicker" position="bottom">
      <van-picker
        :columns="typeOptions"
        @confirm="onTypeConfirm"
        @cancel="showTypePicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { createException } from '@/api/exception'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const showTypePicker = ref(false)

const typeOptions = [
  { text: '丢件', value: 1 },
  { text: '超时', value: 2 },
  { text: '损坏', value: 3 },
  { text: '其他', value: 4 }
]

const form = reactive({
  order_id: 0,
  type: 0,
  description: ''
})

const typeText = computed(() => {
  const option = typeOptions.find(opt => opt.value === form.type)
  return option?.text || '请选择异常类型'
})

function onTypeConfirm({ selectedOptions }: any) {
  form.type = selectedOptions[0].value
  showTypePicker.value = false
}

async function handleSubmit() {
  if (!form.type) {
    showToast('请选择异常类型')
    return
  }

  loading.value = true
  try {
    await createException(form)
    showToast('提交成功')
    router.back()
  } catch (error: any) {
    showToast(error.message || '提交失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const orderIdParam = route.params.orderId as string
  form.order_id = parseInt(orderIdParam)
})
