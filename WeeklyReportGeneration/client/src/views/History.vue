<template>
    <div class="history">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>历史周报</span>
                    <div>
                        <el-select v-model="filterStatus" placeholder="选择状态" clearable style="width: 120px; margin-right: 10px">
                            <el-option label="草稿" value="draft" />
                            <el-option label="已发布" value="published" />
                            <el-option label="已归档" value="archived" />
                        </el-select>
                        <el-date-picker
                            v-model="filterWeek"
                            type="week"
                            placeholder="选择周"
                            style="width: 200px"
                            @change="filterByWeek"
                        />
                    </div>
                </div>
            </template>
            <el-table :data="filteredReports" stripe style="width: 100%">
                <el-table-column prop="title" label="标题" min-width="200" />
                <el-table-column prop="week_start" label="周开始" width="120">
                    <template #default="{ row }">
                        {{ formatDate(row.week_start) }}
                    </template>
                </el-table-column>
                <el-table-column prop="week_end" label="周结束" width="120">
                    <template #default="{ row }">
                        {{ formatDate(row.week_end) }}
                    </template>
                </el-table-column>
                <el-table-column prop="template_name" label="模板" width="150" />
                <el-table-column label="状态" width="100">
                    <template #default="{ row }">
                        <el-tag :type="getStatusTag(row.status)" size="small">
                            {{ getStatusLabel(row.status) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="AI润色" width="90">
                    <template #default="{ row }">
                        <el-tag v-if="row.ai_polished" type="primary" size="small">
                            <el-icon><Sparkles /></el-icon>
                        </el-tag>
                        <span v-else>-</span>
                    </template>
                </el-table-column>
                <el-table-column prop="created_at" label="创建时间" width="170">
                    <template #default="{ row }">
                        {{ formatDateTime(row.created_at) }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="{ row }">
                        <el-button link type="primary" size="small" @click="viewReport(row)">
                            查看
                        </el-button>
                        <el-button link type="primary" size="small" @click="exportReport(row)">
                            导出
                        </el-button>
                        <el-button v-if="row.status !== 'archived'" link type="info" size="small" @click="archiveReport(row)">
                            归档
                        </el-button>
                        <el-popconfirm title="确定删除？" @confirm="deleteReport(row.id)">
                            <template #reference>
                                <el-button link type="danger" size="small">删除</el-button>
                            </template>
                        </el-popconfirm>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <el-dialog v-model="showDetailDialog" title="周报详情" width="800px">
            <div v-if="currentReport" class="report-detail">
                <div class="report-meta">
                    <el-descriptions :column="3" border>
                        <el-descriptions-item label="标题">{{ currentReport.title }}</el-descriptions-item>
                        <el-descriptions-item label="周期">{{ currentReport.week_start }} ~ {{ currentReport.week_end }}</el-descriptions-item>
                        <el-descriptions-item label="状态">
                            <el-tag :type="getStatusTag(currentReport.status)">
                                {{ getStatusLabel(currentReport.status) }}
                            </el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="模板">{{ currentReport.template_name || '-' }}</el-descriptions-item>
                        <el-descriptions-item label="AI润色">
                            <el-tag v-if="currentReport.ai_polished" type="primary">已润色</el-tag>
                            <span v-else>未润色</span>
                        </el-descriptions-item>
                        <el-descriptions-item label="创建时间">{{ formatDateTime(currentReport.created_at) }}</el-descriptions-item>
                    </el-descriptions>
                </div>
                <div class="report-content" style="margin-top: 20px">
                    <el-input
                        v-model="currentReport.content"
                        type="textarea"
                        :rows="15"
                        readonly
                    />
                </div>
                <div v-if="currentReport.data_sources && currentReport.data_sources.length > 0" class="data-sources">
                    <h4>关联数据源</h4>
                    <el-table :data="currentReport.data_sources" size="small" stripe>
                        <el-table-column label="类型" width="80">
                            <template #default="{ row }">
                                <el-tag size="small">{{ getTypeLabel(row.source_type) }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="title" label="标题" />
                        <el-table-column label="状态" width="100">
                            <template #default="{ row }">
                                <el-tag size="small" :type="getStatusTag(row.status)">
                                    {{ getStatusLabel(row.status) }}
                                </el-tag>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
            <template #footer>
                <el-button @click="showDetailDialog = false">关闭</el-button>
                <el-button type="success" @click="exportReport(currentReport)">导出</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { reportApi } from '../api'
import dayjs from 'dayjs'

const reports = ref([])
const filterStatus = ref('')
const filterWeek = ref(null)
const showDetailDialog = ref(false)
const currentReport = ref(null)

const filteredReports = computed(() => {
    let result = reports.value
    if (filterStatus.value) {
        result = result.filter(r => r.status === filterStatus.value)
    }
    return result
})

const formatDate = (date) => {
    return dayjs(date).format('YYYY-MM-DD')
}

const formatDateTime = (date) => {
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const getStatusLabel = (status) => {
    const map = { draft: '草稿', published: '已发布', archived: '已归档' }
    return map[status] || status
}

const getStatusTag = (status) => {
    const map = { draft: 'info', published: 'success', archived: 'warning' }
    return map[status] || ''
}

const getTypeLabel = (type) => {
    const map = { manual: '手动', todo: '待办', git: 'Git' }
    return map[type] || type
}

const loadReports = async () => {
    try {
        const res = await reportApi.getAll()
        reports.value = res.data || []
    } catch (error) {
        console.error('加载周报失败:', error)
    }
}

const filterByWeek = async () => {
    if (filterWeek.value) {
        const start = dayjs(filterWeek.value).startOf('week').format('YYYY-MM-DD')
        const end = dayjs(filterWeek.value).endOf('week').format('YYYY-MM-DD')
        try {
            const res = await reportApi.getByWeek(start, end)
            reports.value = res.data || []
        } catch (error) {
            console.error('筛选周报失败:', error)
        }
    } else {
        loadReports()
    }
}

const viewReport = async (row) => {
    try {
        const res = await reportApi.getById(row.id)
        currentReport.value = res.data
        showDetailDialog.value = true
    } catch (error) {
        console.error('获取周报详情失败:', error)
    }
}

const exportReport = (report) => {
    if (!report) return
    const blob = new Blob([report.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `weekly_report_${report.week_start}_${report.week_end}.md`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
}

const archiveReport = async (row) => {
    try {
        await reportApi.archive(row.id)
        ElMessage.success('归档成功')
        loadReports()
    } catch (error) {
        console.error('归档失败:', error)
    }
}

const deleteReport = async (id) => {
    try {
        await reportApi.delete(id)
        ElMessage.success('删除成功')
        loadReports()
    } catch (error) {
        console.error('删除失败:', error)
    }
}

onMounted(() => {
    loadReports()
})
</script>

<style scoped>
.history {
    min-height: 100%;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.report-detail {
    max-height: 600px;
    overflow-y: auto;
}

.data-sources {
    margin-top: 20px;
}

.data-sources h4 {
    margin-bottom: 10px;
}
</style>
