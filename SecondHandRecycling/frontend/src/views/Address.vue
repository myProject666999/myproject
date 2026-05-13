<template>
  <div class="page-container">
    <van-nav-bar title="地址管理" left-arrow @click-left="router.back()" fixed placeholder />

    <div class="content-wrapper">
      <van-empty v-if="addresses.length === 0" description="暂无地址" />

      <van-cell-group v-for="addr in addresses" :key="addr.id" inset>
        <van-cell
          :title="addr.name + ' ' + addr.phone"
          :value="addr.province + addr.city + addr.district + addr.detailAddress"
          :is-link="false"
        >
          <template #right-icon>
            <van-tag v-if="addr.isDefault" type="primary" plain>默认</van-tag>
          </template>
        </van-cell>
        <div class="cell-actions">
          <div class="action-item" @click="setDefault(addr)">
            <van-icon name="star-o" />
            <span>设为默认</span>
          </div>
          <div class="action-item" @click="editAddress(addr)">
            <van-icon name="edit" />
            <span>编辑</span>
          </div>
          <div class="action-item" @click="deleteAddress(addr)">
            <van-icon name="delete-o" />
            <span>删除</span>
          </div>
        </div>
      </van-cell-group>

      <div class="add-btn">
        <van-button type="primary" block round @click="showAddAddress = true">
          添加新地址
        </van-button>
      </div>
    </div>

    <van-popup
      v-model:show="showAddAddress"
      position="bottom"
      round
      :style="{ height: '80%' }"
    >
      <van-nav-bar
        :title="editingAddress ? '编辑地址' : '添加地址'"
        left-arrow
        @click-left="showAddAddress = false"
      />
      <van-form @submit="saveAddress">
        <van-cell-group inset>
          <van-field
            v-model="formData.name"
            label="联系人"
            placeholder="请输入联系人姓名"
            :rules="[{ required: true, message: '请填写联系人' }]"
          />
          <van-field
            v-model="formData.phone"
            label="手机号"
            placeholder="请输入手机号"
            :rules="[{ required: true, pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }]"
          />
          <van-field
            v-model="formData.province"
            label="省"
            placeholder="请输入省"
          />
          <van-field
            v-model="formData.city"
            label="市"
            placeholder="请输入市"
          />
          <van-field
            v-model="formData.district"
            label="区"
            placeholder="请输入区"
          />
          <van-field
            v-model="formData.detailAddress"
            label="详细地址"
            placeholder="请输入详细地址"
            :rules="[{ required: true, message: '请填写详细地址' }]"
          />
          <van-cell title="设为默认地址" is-link>
            <template #right-icon>
              <van-switch v-model="formData.isDefault" />
            </template>
          </van-cell>
        </van-cell-group>
        <div class="form-footer">
          <van-button type="primary" round block native-type="submit">
            保存
          </van-button>
        </div>
      </van-form>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { addressApi } from '@/api'

const router = useRouter()

const addresses = ref([])
const showAddAddress = ref(false)
const editingAddress = ref(null)

const formData = reactive({
  id: null,
  name: '',
  phone: '',
  province: '北京市',
  city: '北京市',
  district: '朝阳区',
  detailAddress: '',
  isDefault: false
})

const loadAddresses = async () => {
  try {
    const res = await addressApi.list()
    addresses.value = res.data || []
  } catch (e) {
    showToast('加载失败')
  }
}

const editAddress = (addr) => {
  editingAddress.value = addr
  formData.id = addr.id
  formData.name = addr.name
  formData.phone = addr.phone
  formData.province = addr.province
  formData.city = addr.city
  formData.district = addr.district
  formData.detailAddress = addr.detailAddress
  formData.isDefault = addr.isDefault === 1
  showAddAddress.value = true
}

const saveAddress = async () => {
  try {
    const data = {
      ...formData,
      isDefault: formData.isDefault ? 1 : 0
    }
    if (editingAddress.value) {
      await addressApi.update(data)
    } else {
      await addressApi.add(data)
    }
    showToast('保存成功')
    showAddAddress.value = false
    resetForm()
    loadAddresses()
  } catch (e) {
    console.error('Save address error:', e)
    showToast('保存失败')
  }
}

const setDefault = async (addr) => {
  try {
    await addressApi.setDefault(addr.id)
    showToast('设置成功')
    loadAddresses()
  } catch (e) {
    showToast('设置失败')
  }
}

const deleteAddress = async (addr) => {
  try {
    await showConfirmDialog({
      title: '确认删除该地址吗？'
    })
    await addressApi.delete(addr.id)
    showToast('删除成功')
    loadAddresses()
  } catch (e) {
    if (e !== 'cancel') {
      showToast('删除失败')
    }
  }
}

const resetForm = () => {
  editingAddress.value = null
  formData.id = null
  formData.name = ''
  formData.phone = ''
  formData.province = '北京市'
  formData.city = '北京市'
  formData.district = '朝阳区'
  formData.detailAddress = ''
  formData.isDefault = false
}

onMounted(() => {
  loadAddresses()
})
</script>

<style lang="less" scoped>
.cell-actions {
  display: flex;
  padding: 12px 16px;
  border-top: 1px solid #ebedf0;

  .action-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: 13px;
    color: #646566;
  }
}

.add-btn {
  padding: 24px 16px;
}

.form-footer {
  padding: 16px;
}
</style>
