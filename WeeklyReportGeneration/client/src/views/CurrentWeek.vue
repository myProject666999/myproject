<template>
    <div class="current-week">
        <el-row :gutter="20">
            <el-col :span="24">
                <el-card class="week-info-card">
                    <template #header>
                        <div class="card-header">
                            <span>本周工作 ({{ weekStart }} ~ {{ weekEnd }})</span>
                            <el-radio-group v-model="dataSourceType" size="small">
                                <el-radio-button label="all">全部</el-radio-button>
                                <el-radio-button label="manual">手动</el-radio-button>
                                <el-radio-button label="todo">待办</el-radio-button>
                                <el-radio-button label="git">Git</el-radio-button>
                            </el-radio-group>
                        </div>
                    </template>
                    <div class="data-source-list">
                        <div class="action-bar">
                            <el-button type="primary" @click="showAddDialog = true">
                                <el-icon><Plus /></el-icon>
                                添加数据
                            </el-button>
                            <el-button @click="showGitImportDialog = true">
                                <el-icon><Download /></el-icon>
                                导入Git
                            </el-button>
                            <el-button type="success" @click="generateReport" :loading="generating">
                                <el-icon><MagicStick /></el-icon>
                                生成周报
                            </el-button>
                        </div>
                        <el-table :data="filteredDataSources" stripe style="width: 100%" @selection-change="handleSelectionChange">
                            <el-table-column type="selection" width="55" />
                            <el-table-column label="类型" width="80">
                                <template #default="{ row }">
                                    <el-tag :type="getTypeTag(row.source_type)" size="small">
                                        {{ getTypeLabel(row.source_type) }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column prop="title" label="标题" min-width="200" />
                            <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
                            <el-table-column label="状态" width="100">
                                <template #default="{ row }">
                                    <el-tag :type="getStatusTag(row.status)" size="small">
                                        {{ getStatusLabel(row.status) }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column label="优先级" width="90">
                                <template #default="{ row }">
                                    <el-tag :type="getPriorityTag(row.priority)" size="small" v-if="row.priority">
                                        {{ getPriorityLabel(row.priority) }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column prop="created_at" label="创建时间" width="170">
                                <template #default="{ row }">
                                    {{ formatDate(row.created_at) }}
                                </template>
                            </el-table-column>
                            <el-table-column label="操作" width="150" fixed="right">
                                <template #default="{ row }">
                                    <el-button link type="primary" size="small" @click="editDataSource(row)">
                                        编辑
                                    </el-button>
                                    <el-popconfirm title="确定删除？" @confirm="deleteDataSource(row.id)">
                                        <template #reference>
                                            <el-button link type="danger" size="small">删除</el-button>
                                        </template>
                                    </el-popconfirm>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px">
            <el-col :span="24">
                <el-card v-if="currentReport">
                    <template #header>
                        <div class="card-header">
                            <span>周报预览</span>
                            <div>
                                <el-button size="small" @click="aiPolishReport" :loading="polishing">
                                    <el-icon><Sparkles /></el-icon>
                                    AI润色
                                </el-button>
                                <el-button size="small" type="primary" @click="publishReport">
                                    <el-icon><Promotion /></el-icon>
                                    发布
                                </el-button>
                                <el-button size="small" type="success" @click="exportReport">
                                    <el-icon><Download /></el-icon>
                                    导出Markdown
                                </el-button>
                                <el-button size="small" type="info" @click="archiveReport">
                                    <el-icon><FolderOpened /></el-icon>
                                    归档
                                </el-button>
                            </div>
                        </div>
                    </template>
                    <div class="report-preview">
                        <div class="report-meta">
                            <el-tag v-if="currentReport.status === 'draft'" type="info">草稿</el-tag>
                            <el-tag v-else-if="currentReport.status === 'published'" type="success">已发布</el-tag>
                            <el-tag v-else-if="currentReport.status === 'archived'" type="warning">已归档</el-tag>
                            <el-tag v-if="currentReport.ai_polished" type="primary" style="margin-left: 8px">
                                <el-icon><Sparkles /></el-icon>
                                AI润色
                            </el-tag>
                        </div>
                        <el-input
                            v-model="reportContent"
                            type="textarea"
                            :rows="15"
                            placeholder="周报内容..."
                        />
                    </div>
                </el-card>
                <el-card v-else class="empty-report">
                    <el-empty description="选择数据源后点击生成周报" />
                </el-card>
            </el-col>
        </el-row>

        <el-dialog v-model="showAddDialog" title="添加数据源" width="500px">
            <el-form :model="formData" label-width="80px">
                <el-form-item label="类型">
                    <el-select v-model="formData.source_type">
                        <el-option label="手动" value="manual" />
                        <el-option label="待办" value="todo" />
                    </el-select>
                </el-form-item>
                <el-form-item label="标题">
                    <el-input v-model="formData.title" placeholder="请输入标题" />
                </el-form-item>
                <el-form-item label="描述">
                    <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入描述" />
                </el-form-item>
                <el-form-item label="状态">
                    <el-select v-model="formData.status">
                        <el-option label="待办" value="pending" />
                        <el-option label="进行中" value="in_progress" />
                        <el-option label="已完成" value="completed" />
                        <el-option label="已取消" value="cancelled" />
                    </el-select>
                </el-form-item>
                <el-form-item label="优先级">
                    <el-select v-model="formData.priority">
                        <el-option label="低" value="low" />
                        <el-option label="中" value="medium" />
                        <el-option label="高" value="high" />
                        <el-option label="紧急" value="urgent" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showAddDialog = false">取消</el-button>
                <el-button type="primary" @click="saveDataSource">确定</el-button>
            </template>
        </el-dialog>

        <el-dialog v-model="showGitImportDialog" title="导入Git提交记录" width="600px">
            <el-form :model="gitForm" label-width="100px">
                <el-form-item label="仓库地址">
                    <el-input v-model="gitForm.repository" placeholder="如: https://github.com/user/repo.git" />
                </el-form-item>
                <el-form-item label="分支">
                    <el-input v-model="gitForm.branch" placeholder="如: main, develop" />
                </el-form-item>
                <el-form-item label="起始日期">
                    <el-date-picker v-model="gitForm.startDate" type="date" />
                </el-form-item>
                <el-form-item label="结束日期">
                    <el-date-picker v-model="gitForm.endDate" type="date" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showGitImportDialog = false">取消</el-button>
                <el-button type="primary" @click="importGitCommits">导入</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { dataSourceApi, reportApi, templateApi } from '../api'
import dayjs from 'dayjs'

const weekStart = ref(dayjs().startOf('week').format('YYYY-MM-DD'))
const weekEnd = ref(dayjs().endOf('week').format('YYYY-MM-DD'))
const dataSourceType = ref('all')
const dataSources = ref([])
const selectedSources = ref([])
const currentReport = ref(null)
const reportContent = ref('')
const generating = ref(false)
const polishing = ref(false)

const showAddDialog = ref(false)
const showGitImportDialog = ref(false)
const editingId = ref(null)

const formData = ref({
    source_type: 'manual',
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium'
})

const gitForm = ref({
    repository: '',
    branch: 'main',
    startDate: '',
    endDate: ''
})

const filteredDataSources = computed(() => {
    if (dataSourceType.value === 'all') {
        return dataSources.value
    }
    return dataSources.value.filter(item => item.source_type === dataSourceType.value)
})

const getTypeLabel = (type) => {
    const map = { manual: '手动', todo: '待办', git: 'Git' }
    return map[type] || type
}

const getTypeTag = (type) => {
    const map = { manual: '', todo: 'warning', git: 'success' }
    return map[type] || ''
}

const getStatusLabel = (status) => {
    const map = { pending: '待办', in_progress: '进行中', completed: '已完成', cancelled: '已取消' }
    return map[status] || status
}

const getStatusTag = (status) => {
    const map = { pending: 'info', in_progress: 'warning', completed: 'success', cancelled: 'danger' }
    return map[status] || ''
}

const getPriorityLabel = (priority) => {
    const map = { low: '低', medium: '中', high: '高', urgent: '紧急' }
    return map[priority] || priority
}

const getPriorityTag = (priority) => {
    const map = { low: 'info', medium: '', high: 'warning', urgent: 'danger' }
    return map[priority] || ''
}

const formatDate = (date) => {
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const loadDataSources = async () => {
    try {
        const res = await dataSourceApi.getByWeek(weekStart.value, weekEnd.value)
        dataSources.value = res.data || []
    } catch (error) {
        console.error('加载数据源失败:', error)
    }
}

const handleSelectionChange = (selection) => {
    selectedSources.value = selection.map(item => item.id)
}

const saveDataSource = async () => {
    try {
        if (!formData.value.title) {
            ElMessage.warning('请输入标题')
            return
        }
        const data = {
            ...formData.value,
            week_start: weekStart.value,
            week_end: weekEnd.value
        }
        if (editingId.value) {
            await dataSourceApi.update(editingId.value, data)
            ElMessage.success('更新成功')
        } else {
            await dataSourceApi.create(data)
            ElMessage.success('创建成功')
        }
        showAddDialog.value = false
        resetForm()
        loadDataSources()
    } catch (error) {
        console.error('保存数据源失败:', error)
    }
}

const editDataSource = (row) => {
    editingId.value = row.id
    formData.value = {
        source_type: row.source_type,
        title: row.title,
        description: row.description,
        status: row.status,
        priority: row.priority
    }
    showAddDialog.value = true
}

const deleteDataSource = async (id) => {
    try {
        await dataSourceApi.delete(id)
        ElMessage.success('删除成功')
        loadDataSources()
    } catch (error) {
        console.error('删除数据源失败:', error)
    }
}

const resetForm = () => {
    formData.value = {
        source_type: 'manual',
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium'
    }
    editingId.value = null
}

const importGitCommits = async () => {
    try {
        const commits = [
            {
                hash: 'abc123def456',
                message: 'feat: 添加周报生成功能',
                author: 'admin',
                date: new Date().toISOString(),
                repository: gitForm.value.repository,
                branch: gitForm.value.branch
            },
            {
                hash: 'def789ghi012',
                message: 'fix: 修复模板渲染问题',
                author: 'admin',
                date: new Date().toISOString(),
                repository: gitForm.value.repository,
                branch: gitForm.value.branch
            }
        ]
        await dataSourceApi.importGit({
            commits,
            week_start: weekStart.value,
            week_end: weekEnd.value,
            repository: gitForm.value.repository,
            branch: gitForm.value.branch
        })
        ElMessage.success('导入成功')
        showGitImportDialog.value = false
        loadDataSources()
    } catch (error) {
        console.error('导入Git提交失败:', error)
    }
}

const generateReport = async () => {
    if (selectedSources.value.length === 0) {
        ElMessage.warning('请选择要生成周报的数据源')
        return
    }
    generating.value = true
    try {
        const templateRes = await templateApi.getAll()
        const templates = templateRes.data || []
        const defaultTemplate = templates.find(t => t.is_default) || templates[0]
        if (!defaultTemplate) {
            ElMessage.error('没有可用的模板')
            return
        }
        const selectedData = dataSources.value.filter(item => selectedSources.value.includes(item.id))
        const completedItems = selectedData.filter(d => d.status === 'completed' || d.source_type === 'git').map(d => d.title)
        const inProgressItems = selectedData.filter(d => d.status === 'in_progress').map(d => d.title)
        const gitCommits = selectedData.filter(d => d.source_type === 'git').map(d => ({
            short_hash: d.commit_hash ? d.commit_hash.substring(0, 7) : '',
            message: d.commit_message || d.title,
            author: d.commit_author || '',
            date: d.commit_date ? dayjs(d.commit_date).format('YYYY-MM-DD') : ''
        }))
        const renderRes = await templateApi.render(defaultTemplate.id, {
            week_start: weekStart.value,
            week_end: weekEnd.value,
            completed_items: completedItems,
            in_progress_items: inProgressItems,
            next_week_plan: [],
            issues_and_suggestions: '',
            git_commits: gitCommits
        })
        const res = await reportApi.create({
            title: `周报 ${weekStart.value} ~ ${weekEnd.value}`,
            content: renderRes.data.content,
            week_start: weekStart.value,
            week_end: weekEnd.value,
            template_id: defaultTemplate.id,
            data_source_ids: selectedSources.value
        })
        currentReport.value = { id: res.data.id, status: 'draft', ai_polished: 0 }
        reportContent.value = renderRes.data.content
        ElMessage.success('周报生成成功')
    } catch (error) {
        console.error('生成周报失败:', error)
        ElMessage.error('生成周报失败')
    } finally {
        generating.value = false
    }
}

const aiPolishReport = async () => {
    if (!currentReport.value) return
    polishing.value = true
    try {
        const res = await reportApi.aiPolish(currentReport.value.id)
        reportContent.value = res.data.content
        currentReport.value.ai_polished = 1
        ElMessage.success('AI润色完成')
    } catch (error) {
        console.error('AI润色失败:', error)
    } finally {
        polishing.value = false
    }
}

const publishReport = async () => {
    if (!currentReport.value) return
    try {
        await reportApi.publish(currentReport.value.id)
        currentReport.value.status = 'published'
        ElMessage.success('发布成功')
    } catch (error) {
        console.error('发布失败:', error)
    }
}

const archiveReport = async () => {
    if (!currentReport.value) return
    try {
        await reportApi.archive(currentReport.value.id)
        currentReport.value.status = 'archived'
        ElMessage.success('归档成功')
    } catch (error) {
        console.error('归档失败:', error)
    }
}

const exportReport = async () => {
    if (!currentReport.value) return
    try {
        const blob = new Blob([reportContent.value], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `weekly_report_${weekStart.value}_${weekEnd.value}.md`
        a.click()
        URL.revokeObjectURL(url)
        ElMessage.success('导出成功')
    } catch (error) {
        console.error('导出失败:', error)
    }
}

onMounted(() => {
    loadDataSources()
})
</script>

<style scoped>
.current-week {
    min-height: 100%;
}

.week-info-card {
    margin-bottom: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.action-bar {
    margin-bottom: 16px;
    display: flex;
    gap: 12px;
}

.report-preview {
    margin-top: 16px;
}

.report-meta {
    margin-bottom: 16px;
}

.empty-report {
    text-align: center;
}
</style>
