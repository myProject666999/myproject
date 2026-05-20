<template>
  <div class="page-container">
    <h2 class="page-title">场景模板</h2>
    
    <el-tabs v-model="activeTab">
      <el-tab-pane label="系统模板" name="public">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" v-for="tpl in publicTemplates" :key="tpl.id">
            <el-card class="card-hover template-card">
              <div class="template-header">
                <span class="template-icon">{{ tpl.icon }}</span>
                <div class="template-info">
                  <h3>{{ tpl.name }}</h3>
                  <p>{{ tpl.description }}</p>
                </div>
              </div>
              <div class="template-footer">
                <span class="days">默认 {{ tpl.defaultDays }} 天</span>
                <el-button-group>
                  <el-button size="small" type="primary" @click="useTemplate(tpl)">
                    使用模板
                  </el-button>
                  <el-button size="small" @click="openInheritDialog(tpl)">
                    继承并自定义
                  </el-button>
                </el-button-group>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
      
      <el-tab-pane label="我的模板" name="my">
        <div class="my-templates-header">
          <el-button type="primary" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            新建模板
          </el-button>
        </div>
        <el-empty v-if="myTemplates.length === 0" description="还没有自定义模板" />
        <el-row v-else :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" v-for="tpl in myTemplates" :key="tpl.id">
            <el-card class="card-hover template-card">
              <div class="template-header">
                <span class="template-icon">{{ tpl.icon }}</span>
                <div class="template-info">
                  <h3>{{ tpl.name }}</h3>
                  <p>{{ tpl.description }}</p>
                </div>
              </div>
              <div class="template-footer">
                <span class="days">默认 {{ tpl.defaultDays }} 天</span>
                <el-button size="small" type="primary" @click="useTemplate(tpl)">
                  使用模板
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="showCreateDialog" title="新建自定义模板" width="500px">
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="模板名称">
          <el-input v-model="createForm.name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="场景类型">
          <el-select v-model="createForm.sceneType" placeholder="请选择场景类型">
            <el-option label="商务出差" value="business" />
            <el-option label="海岛度假" value="island" />
            <el-option label="滑雪旅行" value="ski" />
            <el-option label="城市旅游" value="city" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="createForm.icon" placeholder="请输入emoji图标" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="createForm.description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="默认天数">
          <el-input-number v-model="createForm.defaultDays" :min="1" :max="30" />
        </el-form-item>
        <el-form-item label="是否公开">
          <el-switch v-model="createForm.isPublic" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreateTemplate">创建</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showInheritDialog" title="继承模板" width="500px">
      <p>从模板「{{ inheritParent?.name }}」继承，创建自定义版本</p>
      <el-form :model="inheritForm" label-width="100px" style="margin-top: 20px;">
        <el-form-item label="新模板名称">
          <el-input v-model="inheritForm.name" placeholder="请输入新模板名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="inheritForm.description" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showInheritDialog = false">取消</el-button>
        <el-button type="primary" @click="handleInheritTemplate">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getPublicTemplates, getUserTemplates, createTemplate, inheritTemplate, createItinerary } from '@/api'

const router = useRouter()
const activeTab = ref('public')
const publicTemplates = ref([])
const myTemplates = ref([])
const showCreateDialog = ref(false)
const showInheritDialog = ref(false)
const inheritParent = ref(null)

const createForm = ref({
  name: '',
  sceneType: 'business',
  icon: '📋',
  description: '',
  defaultDays: 3,
  isPublic: 0
})

const inheritForm = ref({
  name: '',
  description: ''
})

onMounted(() => {
  loadPublicTemplates()
  loadMyTemplates()
})

async function loadPublicTemplates() {
  publicTemplates.value = await getPublicTemplates()
}

async function loadMyTemplates() {
  myTemplates.value = await getUserTemplates()
}

async function useTemplate(tpl) {
  const name = `${tpl.name}行程`
  const res = await createItinerary({
    name,
    templateId: tpl.id,
    days: tpl.defaultDays,
    destination: '',
    notes: ''
  })
  ElMessage.success('行程创建成功')
  router.push(`/itinerary/${res.id}`)
}

function openInheritDialog(tpl) {
  inheritParent.value = tpl
  inheritForm.value.name = `${tpl.name}（自定义）`
  inheritForm.value.description = tpl.description
  showInheritDialog.value = true
}

async function handleInheritTemplate() {
  if (!inheritForm.value.name) {
    ElMessage.warning('请输入模板名称')
    return
  }
  await inheritTemplate(inheritParent.value.id, inheritForm.value)
  ElMessage.success('模板继承成功')
  showInheritDialog.value = false
  loadMyTemplates()
}

async function handleCreateTemplate() {
  if (!createForm.value.name) {
    ElMessage.warning('请输入模板名称')
    return
  }
  await createTemplate(createForm.value)
  ElMessage.success('模板创建成功')
  showCreateDialog.value = false
  loadMyTemplates()
  createForm.value = { name: '', sceneType: 'business', icon: '📋', description: '', defaultDays: 3, isPublic: 0 }
}
</script>

<style scoped>
.page-title {
  margin-bottom: 20px;
}

.my-templates-header {
  margin-bottom: 20px;
}

.template-card {
  margin-bottom: 20px;
}

.template-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.template-icon {
  font-size: 36px;
  line-height: 1;
}

.template-info h3 {
  margin: 0 0 6px 0;
  font-size: 16px;
}

.template-info p {
  margin: 0;
  color: #606266;
  font-size: 13px;
}

.template-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.days {
  color: #909399;
  font-size: 12px;
}
</style>
