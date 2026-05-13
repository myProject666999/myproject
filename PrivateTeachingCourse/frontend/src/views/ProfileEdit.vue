<template>
  <div class="edit-page">
    <van-nav-bar title="编辑资料" left-arrow @click-left="$router.back()" />
    <van-form @submit="onSubmit">
      <div class="avatar-section">
        <van-image
          round
          width="80"
          height="80"
          :src="form.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
        />
      </div>
      <van-cell-group inset>
        <van-field
          v-model="form.name"
          name="name"
          label="姓名"
          placeholder="请输入姓名"
          :rules="[{ required: true, message: '请输入姓名' }]"
        />
        <van-field
          v-model="form.gender"
          name="gender"
          label="性别"
          readonly
          is-link
          placeholder="请选择性别"
          @click="showGenderPicker = true"
        />
        <van-field
          v-model="form.birthdate"
          name="birthdate"
          label="生日"
          type="datetime-local"
          placeholder="请选择生日"
        />
      </van-cell-group>

      <div style="margin: 16px">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          保存
        </van-button>
      </div>
    </van-form>

    <van-popup v-model:show="showGenderPicker" position="bottom">
      <van-picker
        :columns="genderColumns"
        @confirm="onConfirmGender"
        @cancel="showGenderPicker = false"
        show-toolbar
        title="选择性别"
      />
    </van-popup>
  </div>
</template>

<script>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { showSuccessToast } from 'vant'
import { authAPI } from '@/api'

export default {
  setup() {
    const router = useRouter()
    const store = useStore()
    const loading = ref(false)
    const showGenderPicker = ref(false)
    const genderColumns = [
      { text: '男', value: 'male' },
      { text: '女', value: 'female' }
    ]

    const form = reactive({
      name: '',
      gender: 'male',
      birthdate: '',
      avatar: ''
    })

    const loadProfile = async () => {
      try {
        const res = await authAPI.getProfile()
        const u = res.user
        Object.assign(form, {
          name: u.name,
          gender: u.gender,
          birthdate: u.birthdate || '',
          avatar: u.avatar || ''
        })
      } catch (e) {
        console.error(e)
      }
    }

    const onConfirmGender = ({ value, text }) => {
      form.gender = value
      showGenderPicker.value = false
    }

    const onSubmit = async () => {
      loading.value = true
      try {
        const res = await authAPI.updateProfile(form)
        store.dispatch('updateUser', res.user)
        showSuccessToast('保存成功')
        router.back()
      } catch (e) {
        console.error(e)
      } finally {
        loading.value = false
      }
    }

    onMounted(loadProfile)
    return { form, loading, showGenderPicker, genderColumns, onConfirmGender, onSubmit }
  }
}
</script>

<style scoped>
.edit-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 20px;
}
.avatar-section {
  display: flex;
  justify-content: center;
  padding: 24px 0;
}
</style>
