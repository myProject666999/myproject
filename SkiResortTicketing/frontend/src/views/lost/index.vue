<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>失物招领管理</span>
          <div>
            <el-button type="success" @click="handleFound">招领登记</el-button>
            <el-button type="primary" @click="handleLost">失物登记</el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="待认领" name="pending">
          <el-table :data="pendingList" border>
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                <el-tag :type="row.type === 1 ? 'warning' : 'success'">
                  {{ row.type === 1 ? '失物登记' : '招领登记' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="itemName" label="物品名称" />
            <el-table-column prop="itemType" label="物品类型" width="100" />
            <el-table-column prop="location" label="地点" />
            <el-table-column prop="registrantName" label="登记人" width="100" />
            <el-table-column prop="registrantPhone" label="联系电话" width="130" />
            <el-table-column prop="lostTime" label="丢失/拾取时间" width="160" />
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button type="success" link size="small" @click="handleClaim(row)">认领</el-button>
                <el-button type="primary" link size="small">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="已完成" name="done">
          <el-table :data="doneList" border>
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                <el-tag :type="row.type === 1 ? 'warning' : 'success'">
                  {{ row.type === 1 ? '失物登记' : '招领登记' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="itemName" label="物品名称" />
            <el-table-column prop="claimerName" label="认领人" width="100" />
            <el-table-column prop="claimerPhone" label="认领电话" width="130" />
            <el-table-column prop="claimTime" label="认领时间" width="160" />
            <el-table-column label="操作" width="100">
              <template>
                <el-button type="primary" link size="small">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="物品名称">
          <el-input v-model="formData.itemName" placeholder="请输入物品名称" />
        </el-form-item>
        <el-form-item label="物品类型">
          <el-select v-model="formData.itemType" placeholder="请选择物品类型" style="width: 100%">
            <el-option label="证件" value="证件" />
            <el-option label="电子设备" value="电子设备" />
            <el-option label="衣物" value="衣物" />
            <el-option label="雪具" value="雪具" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="地点">
          <el-input v-model="formData.location" placeholder="请输入丢失/拾取地点" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入物品描述" />
        </el-form-item>
        <el-form-item label="登记人姓名">
          <el-input v-model="formData.registrantName" placeholder="请输入登记人姓名" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="formData.registrantPhone" placeholder="请输入联系电话" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('pending')
const dialogVisible = ref(false)
const dialogTitle = ref('失物登记')

const formData = reactive({
  type: 1,
  itemName: '',
  itemType: '',
  location: '',
  description: '',
  registrantName: '',
  registrantPhone: ''
})

const pendingList = ref([
  { id: 1, type: 1, itemName: '黑色钱包', itemType: '证件', location: '雪道A入口', registrantName: '张三', registrantPhone: '13800000001', lostTime: '2024-05-14 10:30:00' },
  { id: 2, type: 2, itemName: '苹果手机', itemType: '电子设备', location: '储物柜B区', registrantName: '李四', registrantPhone: '13800000002', lostTime: '2024-05-14 11:20:00' },
  { id: 3, type: 1, itemName: '滑雪手套', itemType: '衣物', location: '雪具大厅', registrantName: '王五', registrantPhone: '13800000003', lostTime: '2024-05-14 09:45:00' },
  { id: 4, type: 2, itemName: '车钥匙一把', itemType: '其他', location: '主入口闸机处', registrantName: '赵六', registrantPhone: '13800000004', lostTime: '2024-05-14 08:30:00' }
])

const doneList = ref([
  { id: 5, type: 1, itemName: '身份证', itemType: '证件', claimerName: '钱七', claimerPhone: '13800000005', claimTime: '2024-05-14 14:20:00' },
  { id: 6, type: 2, itemName: '蓝色围巾', itemType: '衣物', claimerName: '孙八', claimerPhone: '13800000006', claimTime: '2024-05-14 15:00:00' }
])

const handleLost = () => {
  formData.type = 1
  dialogTitle.value = '失物登记'
  resetForm()
  dialogVisible.value = true
}

const handleFound = () => {
  formData.type = 2
  dialogTitle.value = '招领登记'
  resetForm()
  dialogVisible.value = true
}

const resetForm = () => {
  Object.assign(formData, {
    itemName: '',
    itemType: '',
    location: '',
    description: '',
    registrantName: '',
    registrantPhone: ''
  })
}

const handleClaim = (row) => {
  ElMessage.success('认领登记成功')
  const index = pendingList.value.findIndex(item => item.id === row.id)
  if (index > -1) {
    const item = pendingList.value.splice(index, 1)[0]
    doneList.value.unshift({
      ...item,
      claimerName: '用户',
      claimerPhone: '13800000000',
      claimTime: new Date().toLocaleString()
    })
  }
}

const submitForm = () => {
  pendingList.value.unshift({
    id: Date.now(),
    ...formData,
    lostTime: new Date().toLocaleString()
  })
  dialogVisible.value = false
  ElMessage.success('登记成功')
}
</script>
