<template>
  <div class="card-edit">
    <van-nav-bar :title="isEdit ? '编辑名片' : '新建名片'" left-arrow @click-left="$router.back()" />

    <van-form @submit="onSubmit">
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
          {{ isEdit ? '保存修改' : '创建名片' }}
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
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getCard, saveCard, updateCard, getGroups } from '@/api'
import { showToast } from 'vant'

export default {
  name: 'CardEdit',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const submitting = ref(false)
    const showGroupPicker = ref(false)
    const groups = ref([])
    const groupColumns = ref([])
    const isEdit = computed(() => !!route.params.id)

    const form = reactive({
      id: null,
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

    const loadGroups = async () => {
      try {
        groups.value = await getGroups()
        groupColumns.value = groups.value.map(g => ({ text: g.name, value: g.id }))
      } catch (e) {
        console.error(e)
      }
    }

    const loadCard = async () => {
      try {
        const card = await getCard(route.params.id)
        Object.assign(form, card)
      } catch (e) {
        showToast('加载失败')
      }
    }

    const onGroupConfirm = ({ selectedOptions }) => {
      form.groupId = selectedOptions[0].value
      showGroupPicker.value = false
    }

    const onSubmit = async () => {
      submitting.value = true
      try {
        if (isEdit.value) {
          await updateCard(form)
        } else {
          await saveCard(form)
        }
        showToast(isEdit.value ? '修改成功' : '创建成功')
        setTimeout(() => {
          router.back()
        }, 1000)
      } catch (e) {
        showToast('操作失败')
      } finally {
        submitting.value = false
      }
    }

    onMounted(() => {
      loadGroups()
      if (isEdit.value) {
        loadCard()
      }
    })

    return {
      form,
      isEdit,
      submitting,
      showGroupPicker,
      groupColumns,
      onGroupConfirm,
      onSubmit
    }
  }
}
</script>

<style lang="scss" scoped>
.submit-area {
  padding: 16px;
}
</style>
