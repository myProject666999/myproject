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
          <div class="page-title">新增体检报告</div>
          <el-button @click="goBack">返回</el-button>
        </div>
        <div class="card-container">
          <el-form :model="form" label-width="120px" ref="formRef">
            <el-form-item label="用户ID">
              <el-input v-model="form.userId" disabled />
            </el-form-item>
            <el-form-item label="体检日期" prop="examDate">
              <el-date-picker
                v-model="form.examDate"
                type="date"
                placeholder="选择体检日期"
                value-format="yyyy-MM-dd"
                style="width: 100%" />
            </el-form-item>
            <el-form-item label="体检医院">
              <el-input v-model="form.hospital" placeholder="请输入体检医院" />
            </el-form-item>
            <el-form-item label="报告编号">
              <el-input v-model="form.reportNo" placeholder="请输入报告编号" />
            </el-form-item>
            <el-form-item label="上传报告">
              <el-upload
                :action="uploadUrl"
                :headers="{}"
                :show-file-list="false"
                :on-success="handleUploadSuccess"
                :before-upload="beforeUpload">
                <el-button type="primary" icon="el-icon-upload">选择文件</el-button>
              </el-upload>
              <div v-if="form.fileName" style="margin-top: 10px; color: #67c23a;">
                <i class="el-icon-success"></i> {{ form.fileName }}
              </div>
            </el-form-item>
            <el-form-item label="体检医生">
              <el-input v-model="form.doctor" placeholder="请输入体检医生" />
            </el-form-item>
            <el-form-item label="总体结论">
              <el-input
                v-model="form.overallResult"
                type="textarea"
                :rows="3"
                placeholder="请输入总体结论" />
            </el-form-item>
            <el-form-item label="备注">
              <el-input
                v-model="form.remark"
                type="textarea"
                :rows="2"
                placeholder="请输入备注" />
            </el-form-item>

            <el-divider content-position="left">体检指标</el-divider>

            <div v-for="(indicator, index) in form.indicators" :key="index" class="indicator-item">
              <el-form :inline="true">
                <el-form-item label="指标名称">
                  <el-input v-model="indicator.indicatorName" placeholder="指标名称" />
                </el-form-item>
                <el-form-item label="指标值">
                  <el-input-number
                    v-model="indicator.indicatorValue"
                    :precision="4"
                    :step="0.1"
                    placeholder="指标值" />
                </el-form-item>
                <el-form-item label="单位">
                  <el-input v-model="indicator.valueUnit" placeholder="单位" style="width: 100px" />
                </el-form-item>
                <el-form-item label="参考范围">
                  <el-input v-model="indicator.referenceRange" placeholder="如: 0-40" style="width: 150px" />
                </el-form-item>
                <el-form-item label="最小值">
                  <el-input-number
                    v-model="indicator.minValue"
                    :precision="4"
                    :step="0.1"
                    placeholder="最小值" />
                </el-form-item>
                <el-form-item label="最大值">
                  <el-input-number
                    v-model="indicator.maxValue"
                    :precision="4"
                    :step="0.1"
                    placeholder="最大值" />
                </el-form-item>
                <el-form-item label="类别">
                  <el-select v-model="indicator.categoryId" placeholder="选择类别" style="width: 150px">
                    <el-option
                      v-for="cat in categories"
                      :key="cat.id"
                      :label="cat.name"
                      :value="cat.id" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="danger" icon="el-icon-delete" circle @click="removeIndicator(index)" />
                </el-form-item>
              </el-form>
            </div>

            <el-button type="primary" icon="el-icon-plus" @click="addIndicator" style="margin-bottom: 20px;">
              添加指标
            </el-button>

            <el-form-item>
              <el-button type="primary" @click="handleSubmit">保存</el-button>
              <el-button @click="goBack">取消</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { addReportWithIndicators, uploadReportFile } from '../api/report'
import { getCategories } from '../api/rule'

export default {
  name: 'ReportAdd',
  data() {
    return {
      uploadUrl: 'http://localhost:8080/api/report/upload',
      form: {
        userId: 1,
        examDate: '',
        hospital: '',
        reportNo: '',
        filePath: '',
        fileName: '',
        doctor: '',
        overallResult: '',
        remark: '',
        indicators: []
      },
      categories: []
    }
  },
  created() {
    this.loadCategories()
    this.addIndicator()
  },
  methods: {
    loadCategories() {
      getCategories().then(res => {
        this.categories = res.data || []
      })
    },
    addIndicator() {
      this.form.indicators.push({
        indicatorName: '',
        indicatorCode: '',
        indicatorValue: null,
        valueUnit: '',
        referenceRange: '',
        minValue: null,
        maxValue: null,
        categoryId: null,
        remark: ''
      })
    },
    removeIndicator(index) {
      this.form.indicators.splice(index, 1)
    },
    beforeUpload(file) {
      const isLt50M = file.size / 1024 / 1024 < 50
      if (!isLt50M) {
        this.$message.error('文件大小不能超过50MB!')
        return false
      }
      return true
    },
    handleUploadSuccess(response) {
      if (response.code === 200) {
        this.form.filePath = response.data
        this.form.fileName = response.data.split('/').pop()
        this.$message.success('文件上传成功')
      }
    },
    handleSubmit() {
      if (!this.form.examDate) {
        this.$message.error('请选择体检日期')
        return
      }

      const validIndicators = this.form.indicators.filter(i => i.indicatorName)
      if (validIndicators.length === 0) {
        this.$message.error('请至少添加一个体检指标')
        return
      }

      const data = {
        report: {
          userId: this.form.userId,
          examDate: this.form.examDate,
          hospital: this.form.hospital,
          reportNo: this.form.reportNo,
          filePath: this.form.filePath,
          fileName: this.form.fileName,
          doctor: this.form.doctor,
          overallResult: this.form.overallResult,
          remark: this.form.remark
        },
        indicators: validIndicators
      }

      addReportWithIndicators(data).then(res => {
        if (res.data) {
          this.$message.success('保存成功')
          this.$router.push('/report')
        }
      })
    },
    goBack() {
      this.$router.back()
    }
  }
}
</script>

<style scoped>
.indicator-item {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
}
</style>
