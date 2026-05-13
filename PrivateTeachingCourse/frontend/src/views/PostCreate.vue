<template>
  <div class="post-create-page">
    <van-nav-bar title="发布动态" left-arrow @click-left="$router.back()">
      <template #right>
        <van-button type="primary" size="small" plain :loading="loading" @click="handleSubmit">发布</van-button>
      </template>
    </van-nav-bar>
    <div class="post-editor">
      <van-field
        v-model="content"
        type="textarea"
        placeholder="分享你的健身日常..."
        rows="6"
        autosize
        :rules="[{ required: true, message: '请输入动态内容' }]"
      />
      <van-uploader v-model="fileList" :max-count="9" accept="image/*" />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showFailToast } from 'vant'
import { communityAPI } from '@/api'

export default {
  setup() {
    const router = useRouter()
    const content = ref('')
    const fileList = ref([])
    const loading = ref(false)

    const handleSubmit = async () => {
      if (!content.value.trim()) {
        showFailToast('请输入动态内容')
        return
      }
      loading.value = true
      try {
        await communityAPI.create({
          content: content.value,
          images: []
        })
        showSuccessToast('发布成功')
        router.back()
      } catch (e) {
        console.error(e)
      } finally {
        loading.value = false
      }
    }

    return { content, fileList, loading, handleSubmit }
  }
}
</script>

<style scoped>
.post-create-page {
  min-height: 100vh;
  background: #fff;
}
.post-editor {
  padding: 16px;
}
</style>
