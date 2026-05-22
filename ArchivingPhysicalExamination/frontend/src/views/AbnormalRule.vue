<template>
  <div class="layout-container">
    <div class="sidebar">
      <div class="sidebar-header">体检报告归档</div>
      <ul class="sidebar-menu">
        <li :class="{ active: $route.path === '/report' }">
          <router-link to="/report">报告列表</router-link>
        </li>
        <li :class="{ active: $route.path === '/trend' }">
          <router-link to="/trend">指标趋势</router-link>
        </li>
        <li :class="{ active: $route.path === '/compare' }">
          <router-link to="/compare">年度对比</router-link>
        </li>
        <li :class="{ active: $route.path === '/rule' }">
          <router-link to="/rule">异常规则</router-link>
        </li>
      </ul>
    </div>
    <div class="main-content">
      <div class="page-container">
        <div class="page-header">
          <div class="page-title">异常规则配置</div>
          <el-button type="primary" icon="el-icon-plus" @click="showAddDialog">新增规则</el-button>
        </div>

        <div class="card-container">
          <el-table :data="ruleList" v-loading="loading" border>
            <el-table-column prop="indicatorName" label="指标名称" width="150" />
            <el-table-column prop="indicatorCode" label="指标编码" width="120" />
            <el-table-column label="正常范围" width="200">
              <template slot-scope="scope">
                {{ scope.row.minNormal }} - {{ scope.row.maxNormal }}
                <span v-if="scope.row.unit" style="color: #909399;">({{ scope.row.unit }})</span>
              </template>
            </el-table-column>
            <el-table-column label="警告级别" width="100">
              <template slot-scope="scope">
                <span :class="`warning-level-${scope.row.warningLevel}`">
                  {{ getWarningLevelText(scope.row.warningLevel) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="异常描述" show-overflow-tooltip />
            <el-table-column prop="suggestion" label="建议" show-overflow-tooltip />
            <el-table-column label="状态" width="80">
              <template slot-scope="scope">
                <el-switch
                  :value="scope.row.isActive === 1"
                  @change="handleToggleActive(scope.row)" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template slot-scope="scope">
                <el-button size="mini" type="primary" @click="showEditDialog(scope.row)">编辑</el-button>
                <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <el-dialog
          :title="dialogTitle"
          :visible.sync="dialogVisible"
          width="600px"
          @close="resetForm">
          <el-form :model="form" label-width="100px" ref="formRef">
            <el-form-item label="指标名称" prop="indicatorName">
              <el-input v-model="form.indicatorName" placeholder="请输入指标名称" />
            </el-form-item>
            <el-form-item label="指标编码">
              <el-input v-model="form.indicatorCode" placeholder="请输入指标编码" />
            </el-form-item>
            <el-form-item label="所属类别">
              <el-select v-model="form.categoryId" placeholder="选择类别" style="width: 100%">
                <el-option
                  v-for="cat in categories"
                  :key="cat.id"
                  :label="cat.name"
                  :value="cat.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="正常最小值">
              <el-input-number
                v-model="form.minNormal"
                :precision="4"
                :step="0.1"
                style="width: 100%"
                placeholder="正常最小值" />
            </el-form-item>
            <el-form-item label="正常最大值">
              <el-input-number
                v-model="form.maxNormal"
                :precision="4"
                :step="0.1"
                style="width: 100%"
                placeholder="正常最大值" />
            </el-form-item>
            <el-form-item label="单位">
              <el-input v-model="form.unit" placeholder="请输入单位" />
            </el-form-item>
            <el-form-item label="警告级别">
              <el-select v-model="form.warningLevel" style="width: 100%">
                <el-option label="轻度" :value="1" />
                <el-option label="中度" :value="2" />
                <el-option label="重度" :value="3" />
              </el-select>
            </el-form-item>
            <el-form-item label="异常描述">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="2"
                placeholder="请输入异常描述" />
            </el-form-item>
            <el-form-item label="建议">
              <el-input
                v-model="form.suggestion"
                type="textarea"
                :rows="2"
                placeholder="请输入建议" />
            </el-form-item>
          </el-form>
          <div slot="footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmit">确定</el-button>
          </div>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script>
import { getAllRules, addRule, updateRule, deleteRule, getCategories } from '../api/rule'

export default {
  name: 'AbnormalRule',
  data() {
    return {
      ruleList: [],
      categories: [],
      loading: false,
      dialogVisible: false,
      dialogTitle: '新增规则',
      form: {
        id: null,
        indicatorName: '',
        indicatorCode: '',
        categoryId: null,
        minNormal: null,
        maxNormal: null,
        unit: '',
        warningLevel: 1,
        description: '',
        suggestion: '',
        isActive: 1
      }
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    loadData() {
      this.loading = true
      Promise.all([getAllRules(), getCategories()]).then(([rulesRes, catsRes]) => {
        this.ruleList = rulesRes.data || []
        this.categories = catsRes.data || []
      }).finally(() => {
        this.loading = false
      })
    },
    showAddDialog() {
      this.dialogTitle = '新增规则'
      this.resetForm()
      this.dialogVisible = true
    },
    showEditDialog(row) {
      this.dialogTitle = '编辑规则'
      this.form = { ...row }
      this.dialogVisible = true
    },
    resetForm() {
      this.form = {
        id: null,
        indicatorName: '',
        indicatorCode: '',
        categoryId: null,
        minNormal: null,
        maxNormal: null,
        unit: '',
        warningLevel: 1,
        description: '',
        suggestion: '',
        isActive: 1
      }
    },
    handleSubmit() {
      if (!this.form.indicatorName) {
        this.$message.error('请输入指标名称')
        return
      }

      const action = this.form.id ? updateRule : addRule
      action(this.form).then(res => {
        if (res.data) {
          this.$message.success(this.form.id ? '更新成功' : '添加成功')
          this.dialogVisible = false
          this.loadData()
        }
      })
    },
    handleDelete(row) {
      this.$confirm('确定要删除该规则吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteRule(row.id).then(res => {
          if (res.data) {
            this.$message.success('删除成功')
            this.loadData()
          }
        })
      }).catch(() => {})
    },
    handleToggleActive(row) {
      const newStatus = row.isActive === 1 ? 0 : 1
      updateRule({ ...row, isActive: newStatus }).then(res => {
        if (res.data) {
          this.$message.success('状态更新成功')
          this.loadData()
        }
      })
    },
    getWarningLevelText(level) {
      const map = { 1: '轻度', 2: '中度', 3: '重度' }
      return map[level] || '未知'
    }
  }
}
</script>
