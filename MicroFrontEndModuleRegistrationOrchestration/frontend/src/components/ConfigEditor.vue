<template>
  <div class="config-editor">
    <el-tabs v-model="activeTab" class="editor-tabs">
      <el-tab-pane label="可视化编辑" name="visual">
        <div class="visual-editor">
          <el-form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            label-width="100px"
          >
            <el-form-item label="配置键" prop="configKey">
              <el-input
                v-model="formData.configKey"
                placeholder="请输入配置键，如：app.title"
                :disabled="isEdit"
              />
            </el-form-item>
            <el-form-item label="配置类型" prop="configType">
              <el-select v-model="formData.configType" placeholder="请选择配置类型">
                <el-option label="字符串" value="string" />
                <el-option label="数字" value="number" />
                <el-option label="布尔值" value="boolean" />
                <el-option label="JSON对象" value="json" />
                <el-option label="数组" value="array" />
              </el-select>
            </el-form-item>
            <el-form-item label="配置值" prop="configValue">
              <el-switch
                v-if="formData.configType === 'boolean'"
                v-model="formData.configValue"
                active-text="true"
                inactive-text="false"
              />
              <el-input-number
                v-else-if="formData.configType === 'number'"
                v-model="formData.configValue"
                :precision="2"
                style="width: 100%"
              />
              <el-input
                v-else-if="formData.configType === 'string'"
                v-model="formData.configValue"
                type="textarea"
                :rows="3"
                placeholder="请输入配置值"
              />
              <el-input
                v-else
                v-model="formData.configValue"
                type="textarea"
                :rows="6"
                placeholder="请输入JSON格式配置值"
              />
            </el-form-item>
            <el-form-item label="描述" prop="description">
              <el-input
                v-model="formData.description"
                type="textarea"
                :rows="2"
                placeholder="请输入配置描述"
              />
            </el-form-item>
            <el-form-item label="状态">
              <el-radio-group v-model="formData.status">
                <el-radio :value="1">启用</el-radio>
                <el-radio :value="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      <el-tab-pane label="JSON编辑" name="json">
        <div class="json-editor">
          <el-input
            v-model="jsonContent"
            type="textarea"
            :rows="15"
            placeholder="请输入JSON格式的配置"
            @blur="parseJsonToForm"
          />
          <p v-if="jsonError" class="error-text">{{ jsonError }}</p>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { createRules, validateRequired, validateConfigKey, validateJson } from '@/utils/validate'
import { isJson } from '@/utils/validate'
import type { RuntimeConfig } from '@/types'

const props = defineProps<{
  modelValue: Partial<RuntimeConfig>
  isEdit?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Partial<RuntimeConfig>): void
}>()

const activeTab = ref('visual')
const formRef = ref()
const jsonError = ref('')

const formData = ref<Partial<RuntimeConfig>>({
  configKey: '',
  configValue: '',
  configType: 'string',
  description: '',
  status: 1,
  scope: 'global',
  ...props.modelValue
})

const formRules = createRules({
  configKey: [validateConfigKey],
  configValue: [
    validateRequired('请输入配置值'),
    { validator: validateJsonValue, trigger: 'blur' }
  ],
  description: [validateRequired('请输入配置描述')]
})

function validateJsonValue(rule: any, value: any, callback: any) {
  if (formData.value.configType === 'json' || formData.value.configType === 'array') {
    if (!isJson(value)) {
      return callback(new Error('JSON格式错误'))
    }
  }
  callback()
}

const jsonContent = computed({
  get() {
    try {
      const data = {
        configKey: formData.value.configKey,
        configValue: formData.value.configType === 'json' || formData.value.configType === 'array'
          ? JSON.parse(formData.value.configValue || '{}')
          : formData.value.configValue,
        configType: formData.value.configType,
        description: formData.value.description,
        status: formData.value.status,
        scope: formData.value.scope
      }
      return JSON.stringify(data, null, 2)
    } catch {
      return JSON.stringify(formData.value, null, 2)
    }
  },
  set(value: string) {
    try {
      const data = JSON.parse(value)
      formData.value = { ...formData.value, ...data }
      if (typeof data.configValue === 'object') {
        formData.value.configValue = JSON.stringify(data.configValue, null, 2)
      }
      jsonError.value = ''
    } catch (e: any) {
      jsonError.value = e.message
    }
  }
})

function parseJsonToForm() {
  if (!jsonContent.value) return
  try {
    const data = JSON.parse(jsonContent.value)
    formData.value = { ...formData.value, ...data }
    if (typeof data.configValue === 'object') {
      formData.value.configValue = JSON.stringify(data.configValue, null, 2)
    }
    jsonError.value = ''
  } catch (e: any) {
    jsonError.value = e.message
    ElMessage.error('JSON格式错误')
  }
}

watch(() => formData.value, (newVal) => {
  emit('update:modelValue', newVal)
}, { deep: true })

watch(() => props.modelValue, (newVal) => {
  formData.value = { ...formData.value, ...newVal }
}, { deep: true })

defineExpose({
  validate: () => formRef.value?.validate()
})
</script>

<style lang="scss" scoped>
.config-editor {
  .editor-tabs {
    :deep(.el-tabs__content) {
      padding-top: 16px;
    }
  }

  .visual-editor {
    padding: 8px 0;
  }

  .json-editor {
    .error-text {
      color: #f56c6c;
      font-size: 12px;
      margin-top: 8px;
    }
  }
}
</style>
