<template>
  <div class="scan-page">
    <van-nav-bar title="扫描名片" left-arrow @click-left="$router.back()" />

    <div class="upload-area">
      <van-uploader
        v-model="fileList"
        :max-count="1"
        :after-read="afterRead"
        accept="image/*"
        :preview-image="false"
      >
        <div class="upload-btn">
          <van-icon name="photograph" size="48" />
          <p>点击拍照或上传名片</p>
        </div>
      </van-uploader>
    </div>

    <van-form v-if="recognized" @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="form.name"
          label="姓名"
          placeholder="请输入姓名"
          :rules="[{ required: true, message: '请填写姓名' }]"
        />
        <van-field
          v-model="form.title"
          label="职位"
          placeholder="请输入职位"
        />
        <van-field
          v-model="form.company"
          label="公司"
          placeholder="请输入公司"
        />
        <van-field
          v-model="form.department"
          label="部门"
          placeholder="请输入部门"
        />
        <van-field
          v-model="form.mobile"
          label="手机"
          placeholder="请输入手机号"
          type="tel"
        />
        <van-field
          v-model="form.phone"
          label="电话"
          placeholder="请输入座机"
          type="tel"
        />
        <van-field
          v-model="form.email"
          label="邮箱"
          placeholder="请输入邮箱"
          type="email"
        />
        <van-field
          v-model="form.address"
          label="地址"
          placeholder="请输入地址"
        />
        <van-field
          v-model="form.website"
          label="网站"
          placeholder="请输入网站"
        />
        <van-field
          v-model="form.wechat"
          label="微信"
          placeholder="请输入微信号"
        />
        <van-field
          v-model="form.qq"
          label="QQ"
          placeholder="请输入QQ号"
        />
        <van-field
          v-model="form.remark"
          label="备注"
          placeholder="请输入备注"
          type="textarea"
          rows="2"
        />
        <van-field
          v-model="form.groupId"
          label="分组"
          is-link
          readonly
          placeholder="选择分组"
          @click="showGroupPicker = true"
        />
      </van-cell-group>

      <div class="submit-area">
        <van-button block type="primary" native-type="submit" :loading="submitting">
          保存名片
        </van-button>
      </div>
    </van-form>

    <van-popup v-model:show="showGroupPicker" position="bottom">
      <van-picker
        :columns="groupColumns"
        @confirm="onGroupConfirm"
        @cancel="showGroupPicker = false"
      />
    </van-popup>

    <van-loading v-if="recognizing" size="24px" class="loading">识别中...</van-loading>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ocrRecognize, saveCard, getGroups } from '@/api'
import { showToast } from 'vant'

export default {
  name: 'Scan',
  setup() {
    const router = useRouter()
    const fileList = ref([])
    const recognized = ref(false)
    const recognizing = ref(false)
    const submitting = ref(false)
    const showGroupPicker = ref(false)
    const groups = ref([])
    const groupColumns = ref([])

    const form = reactive({
      name: '',
      title: '',
      company: '',
      department: '',
      mobile: '',
      phone: '',
      email: '',
      address: '',
      website: '',
      wechat: '',
      qq: '',
      remark: '',
      groupId: null
    })

    const afterRead = async (file) => {
      recognizing.value = true
      try {
        const result = await ocrRecognize(file.file)
        Object.assign(form, result)
        recognized.value = true
      } catch (e) {
        showToast('识别失败，请手动输入')
        recognized.value = true
      } finally {
        recognizing.value = false
      }
    }

    const loadGroups = async () => {
      try {
        groups.value = await getGroups()
        groupColumns.value = groups.value.map(g => ({ text: g.name, value: g.id }))
      } catch (e) {
        console.error(e)
      }
    }

    const onGroupConfirm = ({ selectedOptions }) => {
      form.groupId = selectedOptions[0].value
      showGroupPicker.value = false
    }

    const onSubmit = async () => {
      submitting.value = true
      try {
        await saveCard(form)
        showToast('保存成功')
        setTimeout(() => {
          router.push('/')
        }, 1000)
      } catch (e) {
        showToast('保存失败')
      } finally {
        submitting.value = false
      }
    }

    onMounted(() => {
      loadGroups()
    })

    return {
      fileList,
      recognized,
      recognizing,
      submitting,
      showGroupPicker,
      form,
      groupColumns,
      afterRead,
      onGroupConfirm,
      onSubmit
    }
  }
}
</script>

<style lang="scss" scoped>
.scan-page {
  padding-bottom: 20px;
}

.upload-area {
  padding: 20px;
  display: flex;
  justify-content: center;
}

.upload-btn {
  width: 200px;
  height: 120px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;

  p {
    margin-top: 10px;
    font-size: 14px;
  }
}

.submit-area {
  padding: 16px;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 20px;
}
</style>
