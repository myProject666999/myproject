<template>
    <div class="templates">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>模板管理</span>
                    <el-button type="primary" @click="showAddDialog = true">
                        <el-icon><Plus /></el-icon>
                        新建模板
                    </el-button>
                </div>
            </template>
            <el-table :data="templates" stripe style="width: 100%">
                <el-table-column prop="name" label="模板名称" width="200" />
                <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
                <el-table-column label="默认模板" width="100">
                    <template #default="{ row }">
                        <el-tag v-if="row.is_default" type="success">默认</el-tag>
                        <el-button v-else link type="primary" size="small" @click="setDefault(row.id)">
                            设为默认
                        </el-button>
                    </template>
                </el-table-column>
                <el-table-column label="变量" width="100">
                    <template #default="{ row }">
                        <el-tag size="small">{{ row.variables ? Object.keys(row.variables).length : 0 }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="created_at" label="创建时间" width="170">
                    <template #default="{ row }">
                        {{ formatDate(row.created_at) }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="{ row }">
                        <el-button link type="primary" size="small" @click="previewTemplate(row)">
                            预览
                        </el-button>
                        <el-button link type="primary" size="small" @click="editTemplate(row)">
                            编辑
                        </el-button>
                        <el-popconfirm title="确定删除？" @confirm="deleteTemplate(row.id)">
                            <template #reference>
                                <el-button link type="danger" size="small">删除</el-button>
                            </template>
                        </el-popconfirm>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <el-dialog v-model="showAddDialog" :title="editingId ? '编辑模板' : '新建模板'" width="700px">
            <el-form :model="formData" label-width="80px">
                <el-form-item label="模板名称">
                    <el-input v-model="formData.name" placeholder="请输入模板名称" />
                </el-form-item>
                <el-form-item label="描述">
                    <el-input v-model="formData.description" type="textarea" :rows="2" placeholder="请输入模板描述" />
                </el-form-item>
                <el-form-item label="模板内容">
                    <el-input
                        v-model="formData.content"
                        type="textarea"
                        :rows="10"
                        placeholder="使用 {{变量名}} 表示变量，使用 {{#each list}}...{{/each}} 遍历列表"
                    />
                </el-form-item>
                <el-form-item label="设为默认">
                    <el-switch v-model="formData.is_default" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showAddDialog = false">取消</el-button>
                <el-button type="primary" @click="saveTemplate">确定</el-button>
            </template>
        </el-dialog>

        <el-dialog v-model="showPreviewDialog" title="模板预览" width="700px">
            <div class="preview-content">
                <el-input
                    v-model="previewContent"
                    type="textarea"
                    :rows="15"
                    readonly
                />
            </div>
            <template #footer>
                <el-button @click="showPreviewDialog = false">关闭</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { templateApi } from '../api'
import dayjs from 'dayjs'

const templates = ref([])
const showAddDialog = ref(false)
const showPreviewDialog = ref(false)
const editingId = ref(null)
const previewContent = ref('')

const formData = ref({
    name: '',
    description: '',
    content: '',
    is_default: false,
    variables: {}
})

const formatDate = (date) => {
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const loadTemplates = async () => {
    try {
        const res = await templateApi.getAll()
        templates.value = res.data || []
    } catch (error) {
        console.error('加载模板失败:', error)
    }
}

const saveTemplate = async () => {
    try {
        if (!formData.value.name) {
            ElMessage.warning('请输入模板名称')
            return
        }
        if (!formData.value.content) {
            ElMessage.warning('请输入模板内容')
            return
        }
        if (editingId.value) {
            await templateApi.update(editingId.value, formData.value)
            ElMessage.success('更新成功')
        } else {
            await templateApi.create(formData.value)
            ElMessage.success('创建成功')
        }
        showAddDialog.value = false
        resetForm()
        loadTemplates()
    } catch (error) {
        console.error('保存模板失败:', error)
    }
}

const editTemplate = (row) => {
    editingId.value = row.id
    formData.value = {
        name: row.name,
        description: row.description,
        content: row.content,
        is_default: row.is_default,
        variables: row.variables || {}
    }
    showAddDialog.value = true
}

const deleteTemplate = async (id) => {
    try {
        await templateApi.delete(id)
        ElMessage.success('删除成功')
        loadTemplates()
    } catch (error) {
        console.error('删除模板失败:', error)
    }
}

const setDefault = async (id) => {
    try {
        const template = templates.value.find(t => t.id === id)
        if (template) {
            await templateApi.update(id, { ...template, is_default: 1 })
            ElMessage.success('设置成功')
            loadTemplates()
        }
    } catch (error) {
        console.error('设置默认模板失败:', error)
    }
}

const previewTemplate = async (row) => {
    try {
        const res = await templateApi.render(row.id, {
            week_start: '2024-01-01',
            week_end: '2024-01-07',
            completed_items: ['示例已完成工作1', '示例已完成工作2'],
            in_progress_items: ['示例进行中工作'],
            next_week_plan: ['示例下周计划'],
            issues_and_suggestions: '示例问题与建议',
            git_commits: [
                { short_hash: 'abc1234', message: 'feat: 示例提交', author: 'admin', date: '2024-01-01' }
            ]
        })
        previewContent.value = res.data.content
        showPreviewDialog.value = true
    } catch (error) {
        console.error('预览模板失败:', error)
    }
}

const resetForm = () => {
    formData.value = {
        name: '',
        description: '',
        content: '',
        is_default: false,
        variables: {}
    }
    editingId.value = null
}

onMounted(() => {
    loadTemplates()
})
</script>

<style scoped>
.templates {
    min-height: 100%;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.preview-content {
    max-height: 500px;
    overflow-y: auto;
}
</style>
