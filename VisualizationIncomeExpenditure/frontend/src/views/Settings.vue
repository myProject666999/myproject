<template>
  <div class="settings-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-icon><Setting /></el-icon>
          <span>自定义设置</span>
        </div>
      </template>

      <el-form :model="settingsForm" label-width="120px" style="max-width: 600px;">
        <el-divider content-position="left">颜色阈值设置</el-divider>
        <el-form-item label="阈值1（最低）">
          <el-input-number v-model="settingsForm.colorThreshold1" :min="0" :precision="2" />
          <span class="form-tip">支出小于此值使用颜色1</span>
        </el-form-item>
        <el-form-item label="阈值2">
          <el-input-number v-model="settingsForm.colorThreshold2" :min="0" :precision="2" />
          <span class="form-tip">支出在此值与阈值1之间使用颜色2</span>
        </el-form-item>
        <el-form-item label="阈值3（最高）">
          <el-input-number v-model="settingsForm.colorThreshold3" :min="0" :precision="2" />
          <span class="form-tip">支出在此值与阈值2之间使用颜色3，超过此值使用颜色4</span>
        </el-form-item>

        <el-divider content-position="left">颜色设置</el-divider>
        <el-form-item label="颜色1（最低消费）">
          <el-color-picker v-model="settingsForm.color1" />
          <span class="color-preview" :style="{ backgroundColor: settingsForm.color1 }"></span>
        </el-form-item>
        <el-form-item label="颜色2">
          <el-color-picker v-model="settingsForm.color2" />
          <span class="color-preview" :style="{ backgroundColor: settingsForm.color2 }"></span>
        </el-form-item>
        <el-form-item label="颜色3">
          <el-color-picker v-model="settingsForm.color3" />
          <span class="color-preview" :style="{ backgroundColor: settingsForm.color3 }"></span>
        </el-form-item>
        <el-form-item label="颜色4（最高消费）">
          <el-color-picker v-model="settingsForm.color4" />
          <span class="color-preview" :style="{ backgroundColor: settingsForm.color4 }"></span>
        </el-form-item>

        <el-divider content-position="left">预览效果</el-divider>
        <div class="preview-section">
          <div class="preview-item">
            <div class="preview-box" :style="{ backgroundColor: settingsForm.color1 }"></div>
            <span>0 - {{ settingsForm.colorThreshold1 }}</span>
          </div>
          <div class="preview-item">
            <div class="preview-box" :style="{ backgroundColor: settingsForm.color2 }"></div>
            <span>{{ settingsForm.colorThreshold1 }} - {{ settingsForm.colorThreshold2 }}</span>
          </div>
          <div class="preview-item">
            <div class="preview-box" :style="{ backgroundColor: settingsForm.color3 }"></div>
            <span>{{ settingsForm.colorThreshold2 }} - {{ settingsForm.colorThreshold3 }}</span>
          </div>
          <div class="preview-item">
            <div class="preview-box" :style="{ backgroundColor: settingsForm.color4 }"></div>
            <span>{{ settingsForm.colorThreshold3 }} 以上</span>
          </div>
        </div>

        <el-form-item>
          <el-button type="primary" @click="saveSettings">保存设置</el-button>
          <el-button @click="resetSettings">恢复默认</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getSettings, updateSettings } from '../api'

const settingsForm = ref({
  colorThreshold1: 100,
  colorThreshold2: 300,
  colorThreshold3: 500,
  color1: '#e8f5e9',
  color2: '#c8e6c9',
  color3: '#81c784',
  color4: '#4caf50'
})

const loadData = async () => {
  try {
    const data = await getSettings()
    settingsForm.value = { ...data }
  } catch (error) {
    console.error('加载设置失败', error)
  }
}

const saveSettings = async () => {
  if (settingsForm.value.colorThreshold1 >= settingsForm.value.colorThreshold2 ||
      settingsForm.value.colorThreshold2 >= settingsForm.value.colorThreshold3) {
    ElMessage.warning('阈值必须满足：阈值1 < 阈值2 < 阈值3')
    return
  }
  try {
    await updateSettings(settingsForm.value)
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存失败', error)
  }
}

const resetSettings = () => {
  settingsForm.value = {
    colorThreshold1: 100,
    colorThreshold2: 300,
    colorThreshold3: 500,
    color1: '#e8f5e9',
    color2: '#c8e6c9',
    color3: '#81c784',
    color4: '#4caf50'
  }
  ElMessage.info('已恢复默认设置，点击保存按钮生效')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.settings-page {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
}

.form-tip {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

.color-preview {
  display: inline-block;
  width: 30px;
  height: 30px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  margin-left: 10px;
  vertical-align: middle;
}

.preview-section {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.preview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.preview-box {
  width: 60px;
  height: 60px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
}

.preview-item span {
  font-size: 12px;
  color: #606266;
}
</style>
