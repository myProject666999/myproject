<template>
  <div class="entry-page">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <div slot="header" class="card-header">
            <span>📝 今日体重录入</span>
          </div>
          <el-form :model="form" label-width="100px">
            <el-form-item label="身高(cm)">
              <el-input-number v-model="height" :min="100" :max="250" :step="0.1" @change="saveHeight"></el-input-number>
              <el-button type="text" size="small" style="margin-left:10px" @click="saveHeight">保存身高</el-button>
            </el-form-item>
            <el-form-item label="日期">
              <el-date-picker v-model="form.recordDate" type="date" value-format="yyyy-MM-dd"></el-date-picker>
            </el-form-item>
            <el-form-item label="体重(kg)">
              <el-input-number v-model="form.weight" :min="20" :max="300" :step="0.1" :precision="1"></el-input-number>
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="form.note" placeholder="今天的感受..." maxlength="255" show-word-limit></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submit">提交记录</el-button>
            </el-form-item>
          </el-form>
          <div class="bmi-display" v-if="form.weight && height">
            <el-alert :title="bmiText" :type="bmiType" show-icon :closable="false">
              <div slot="default">BMI 指数: <b>{{ bmiValue }}</b></div>
            </el-alert>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div slot="header" class="card-header">
            <span>📋 最近记录</span>
          </div>
          <el-table :data="records" style="width:100%">
            <el-table-column prop="recordDate" label="日期" width="130"></el-table-column>
            <el-table-column prop="weight" label="体重(kg)" width="100"></el-table-column>
            <el-table-column prop="note" label="备注"></el-table-column>
            <el-table-column label="操作" width="120">
              <template slot-scope="scope">
                <el-button size="mini" type="text" @click="editRow(scope.row)">编辑</el-button>
                <el-button size="mini" type="text" style="color:#f56c6c" @click="removeRow(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog :visible.sync="editDialog.visible" title="编辑记录">
      <el-form label-width="100px">
        <el-form-item label="体重(kg)">
          <el-input-number v-model="editDialog.weight" :min="20" :max="300" :step="0.1" :precision="1"></el-input-number>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="editDialog.note" type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="editDialog.visible=false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { addWeight, updateWeight, deleteWeight, listWeight, getMe, updateHeight } from '../api'

export default {
  data() {
    return {
      height: 170,
      form: { weight: 65, recordDate: '', note: '' },
      records: [],
      editDialog: { visible: false, id: null, weight: 0, note: '' }
    }
  },
  computed: {
    bmiValue() {
      if (!this.form.weight || !this.height) return '-'
      const h = this.height / 100
      return (this.form.weight / (h * h)).toFixed(1)
    },
    bmiText() {
      const v = parseFloat(this.bmiValue)
      if (v < 18.5) return '偏瘦'
      if (v < 24) return '正常'
      if (v < 28) return '偏胖'
      return '肥胖'
    },
    bmiType() {
      const v = parseFloat(this.bmiValue)
      if (v < 18.5) return 'info'
      if (v < 24) return 'success'
      if (v < 28) return 'warning'
      return 'error'
    }
  },
  async created() {
    this.form.recordDate = this.today()
    await this.loadMe()
    await this.loadRecords()
  },
  methods: {
    today() {
      const d = new Date()
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
    },
    async loadMe() {
      const res = await getMe()
      if (res.data && res.data.height) {
        this.height = parseFloat(res.data.height)
      }
    },
    async saveHeight() {
      await updateHeight(this.height)
      this.$message.success('身高已更新')
    },
    async loadRecords() {
      const res = await listWeight()
      this.records = res.data || []
    },
    async submit() {
      if (!this.form.weight) return this.$message.warning('请输入体重')
      await addWeight(this.form.weight, this.form.recordDate, this.form.note)
      this.$message.success('记录成功')
      this.form.note = ''
      this.loadRecords()
    },
    editRow(row) {
      this.editDialog = { visible: true, id: row.id, weight: row.weight, note: row.note }
    },
    async saveEdit() {
      await updateWeight(this.editDialog.id, this.editDialog.weight, this.editDialog.note)
      this.editDialog.visible = false
      this.loadRecords()
    },
    removeRow(row) {
      this.$confirm('确认删除该记录?', '提示', { type: 'warning' }).then(async () => {
        await deleteWeight(row.id)
        this.loadRecords()
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.entry-page { max-width: 1100px; margin: 0 auto; }
.card-header { font-weight: bold; }
.bmi-display { margin-top: 20px; }
</style>
