<template>
  <div class="contacts-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>👥 联系人列表</span>
          <el-button type="primary" @click="openDialog">
            <el-icon><Plus /></el-icon>
            添加联系人
          </el-button>
        </div>
      </template>
      <el-table :data="contacts" v-loading="loading" stripe>
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            {{ row.gender === 1 ? '男' : row.gender === 2 ? '女' : '未知' }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="电话" width="130" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column label="生日" width="180">
          <template #default="{ row }">
            {{ formatDate(row.birthday) }}
            <el-tag size="small" :type="row.calendarType === 1 ? 'primary' : 'success'" style="margin-left: 8px">
              {{ row.calendarType === 1 ? '公历' : '农历' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="relation" label="关系" width="100" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button size="small" @click="editContact(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteContact(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑联系人' : '添加联系人'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="姓名" required>
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="form.gender">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
            <el-radio :label="0">未知</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="日期类型">
          <el-radio-group v-model="form.calendarType">
            <el-radio :label="1">公历</el-radio>
            <el-radio :label="2">农历</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="生日" v-if="form.calendarType === 1">
          <el-date-picker v-model="form.birthday" type="date" value-format="YYYY-MM-DD" />
        </el-form-item>
        <template v-if="form.calendarType === 2">
          <el-form-item label="农历月份">
            <el-select v-model="form.lunarMonth" placeholder="请选择月份">
              <el-option v-for="m in 12" :key="m" :label="m + '月'" :value="m" />
            </el-select>
            <el-checkbox v-model="form.isLeap" style="margin-left: 10px">闰月</el-checkbox>
          </el-form-item>
          <el-form-item label="农历日期">
            <el-select v-model="form.lunarDay" placeholder="请选择日期">
              <el-option v-for="d in 30" :key="d" :label="'初' + (d <= 10 ? d : d <= 20 ? '十' + (d - 10) : d <= 30 ? '廿' + (d - 20) : d)" :value="d" />
            </el-select>
          </el-form-item>
        </template>
        <el-form-item label="关系">
          <el-select v-model="form.relation" placeholder="请选择关系">
            <el-option label="家人" value="家人" />
            <el-option label="朋友" value="朋友" />
            <el-option label="同事" value="同事" />
            <el-option label="同学" value="同学" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveContact">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getContacts, addContact, updateContact, deleteContact } from '@/api/contact'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

export default {
  name: 'Contacts',
  components: { Plus },
  data() {
    return {
      contacts: [],
      loading: false,
      dialogVisible: false,
      isEdit: false,
      form: {
        id: null,
        userId: 1,
        name: '',
        gender: 0,
        phone: '',
        email: '',
        birthday: '',
        calendarType: 1,
        lunarMonth: null,
        lunarDay: null,
        isLeap: 0,
        relation: '',
        remark: ''
      }
    }
  },
  mounted() {
    this.loadContacts()
  },
  methods: {
    async loadContacts() {
      this.loading = true
      try {
        const res = await getContacts(1)
        if (res.code === 200) {
          this.contacts = res.data
        }
      } catch (e) {
        ElMessage.error('加载联系人失败')
      } finally {
        this.loading = false
      }
    },
    openDialog() {
      this.isEdit = false
      this.resetForm()
      this.dialogVisible = true
    },
    editContact(row) {
      this.isEdit = true
      this.form = { ...row }
      this.dialogVisible = true
    },
    async saveContact() {
      if (!this.form.name) {
        ElMessage.warning('请输入姓名')
        return
      }
      try {
        if (this.isEdit) {
          await updateContact(this.form.id, this.form)
          ElMessage.success('更新成功')
        } else {
          await addContact(this.form)
          ElMessage.success('添加成功')
        }
        this.dialogVisible = false
        this.loadContacts()
      } catch (e) {
        ElMessage.error('保存失败')
      }
    },
    async deleteContact(row) {
      try {
        await ElMessageBox.confirm('确定要删除该联系人吗？', '提示', { type: 'warning' })
        await deleteContact(row.id)
        ElMessage.success('删除成功')
        this.loadContacts()
      } catch (e) {
        if (e !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    },
    resetForm() {
      this.form = {
        id: null,
        userId: 1,
        name: '',
        gender: 0,
        phone: '',
        email: '',
        birthday: '',
        calendarType: 1,
        lunarMonth: null,
        lunarDay: null,
        isLeap: 0,
        relation: '',
        remark: ''
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('zh-CN')
    }
  }
}
</script>

<style scoped>
.contacts-page {
  max-width: 1000px;
  margin: 0 auto;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
