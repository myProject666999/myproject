<template>
    <div class="page-container">
        <div class="page-header">
            <h1>🌙 睡眠记录</h1>
            <p style="margin-top: 8px; opacity: 0.9;">记录你的睡眠，分析你的健康</p>
        </div>

        <div class="nav-tabs">
            <button class="nav-tab" :class="{ active: activeTab === 'record' }" @click="activeTab = 'record'">
                📝 录入
            </button>
            <button class="nav-tab" :class="{ active: activeTab === 'report' }" @click="goToReport">
                📊 报告
            </button>
        </div>

        <div v-if="activeTab === 'record'">
            <div class="card">
                <div class="card-title">{{ isEdit ? '编辑睡眠记录' : '新增睡眠记录' }}</div>
                <el-form :model="form" label-width="120px" @submit.prevent>
                    <el-form-item label="入睡时间">
                        <el-date-picker
                            v-model="form.sleepTime"
                            type="datetime"
                            placeholder="选择入睡时间"
                            format="YYYY-MM-DD HH:mm"
                            value-format="YYYY-MM-DDTHH:mm:ss"
                            style="width: 100%"
                        />
                    </el-form-item>
                    <el-form-item label="起床时间">
                        <el-date-picker
                            v-model="form.wakeTime"
                            type="datetime"
                            placeholder="选择起床时间"
                            format="YYYY-MM-DD HH:mm"
                            value-format="YYYY-MM-DDTHH:mm:ss"
                            style="width: 100%"
                        />
                    </el-form-item>
                    <el-form-item label="睡眠时长">
                        <span style="color: #667eea; font-size: 18px; font-weight: bold;">{{ sleepDuration }}</span>
                    </el-form-item>
                    <el-form-item label="质量打分">
                        <el-rate v-model="form.qualityScore" :max="10" show-text :texts="['极差', '较差', '一般', '良好', '优秀']" />
                    </el-form-item>
                    <el-form-item label="深睡眠(小时)">
                        <el-input-number v-model="form.deepSleep" :min="0" :max="12" :step="0.5" :precision="1" />
                    </el-form-item>
                    <el-form-item label="浅睡眠(小时)">
                        <el-input-number v-model="form.lightSleep" :min="0" :max="12" :step="0.5" :precision="1" />
                    </el-form-item>
                    <el-form-item label="备注">
                        <el-input
                            v-model="form.remark"
                            type="textarea"
                            :rows="3"
                            placeholder="记录睡眠感受..."
                        />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="saveRecord" :loading="saving">
                            {{ isEdit ? '更新' : '保存' }}
                        </el-button>
                        <el-button v-if="isEdit" @click="resetForm">取消</el-button>
                    </el-form-item>
                </el-form>
            </div>

            <div class="card">
                <div class="card-title">历史记录</div>
                <el-table :data="records" style="width: 100%" stripe>
                    <el-table-column prop="sleepDate" label="日期" width="120" />
                    <el-table-column prop="sleepTime" label="入睡时间" width="170">
                        <template #default="{ row }">
                            {{ formatDateTime(row.sleepTime) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="wakeTime" label="起床时间" width="170">
                        <template #default="{ row }">
                            {{ formatDateTime(row.wakeTime) }}
                        </template>
                    </el-table-column>
                    <el-table-column label="时长" width="100">
                        <template #default="{ row }">
                            {{ calculateDuration(row.sleepTime, row.wakeTime) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="qualityScore" label="质量" width="120">
                        <template #default="{ row }">
                            <el-rate :model-value="row.qualityScore" :max="10" disabled />
                        </template>
                    </el-table-column>
                    <el-table-column prop="deepSleep" label="深睡" width="80">
                        <template #default="{ row }">
                            {{ row.deepSleep }}h
                        </template>
                    </el-table-column>
                    <el-table-column prop="lightSleep" label="浅睡" width="80">
                        <template #default="{ row }">
                            {{ row.lightSleep }}h
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="150">
                        <template #default="{ row }">
                            <el-button size="small" @click="editRecord(row)">编辑</el-button>
                            <el-button size="small" type="danger" @click="deleteRecord(row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { sleepApi } from '../api'

const router = useRouter()
const activeTab = ref('record')
const saving = ref(false)
const records = ref([])
const isEdit = ref(false)
const editId = ref(null)

const form = ref({
    sleepTime: '',
    wakeTime: '',
    qualityScore: 8,
    deepSleep: 2.5,
    lightSleep: 5.0,
    remark: ''
})

const sleepDuration = computed(() => {
    if (!form.value.sleepTime || !form.value.wakeTime) {
        return '--'
    }
    const sleep = new Date(form.value.sleepTime)
    const wake = new Date(form.value.wakeTime)
    const diffMs = wake - sleep
    if (diffMs <= 0) {
        return '时间无效'
    }
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}小时${minutes}分钟`
})

const loadRecords = async () => {
    try {
        const today = new Date()
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        const startStr = formatDate(startDate)
        const endStr = formatDate(today)
        records.value = await sleepApi.getRecords(startStr, endStr)
    } catch (error) {
        console.error('加载记录失败:', error)
    }
}

const formatDate = (date) => {
    return date.toISOString().split('T')[0]
}

const formatDateTime = (dateStr) => {
    if (!dateStr) return '--'
    const date = new Date(dateStr)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const formatTimeForSubmit = (timeStr) => {
    if (!timeStr) return ''
    const formatted = timeStr.replace('T', ' ')
    if (formatted.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
        return formatted
    }
    return formatted + ':00'
}

const calculateDuration = (sleepTime, wakeTime) => {
    if (!sleepTime || !wakeTime) return '--'
    const sleep = new Date(sleepTime)
    const wake = new Date(wakeTime)
    const diffMs = wake - sleep
    if (diffMs <= 0) return '--'
    const hours = (diffMs / (1000 * 60 * 60)).toFixed(1)
    return `${hours}h`
}

const saveRecord = async () => {
    if (!form.value.sleepTime || !form.value.wakeTime) {
        ElMessage.warning('请选择入睡时间和起床时间')
        return
    }

    saving.value = true
    try {
        const data = {
            ...form.value,
            sleepTime: formatTimeForSubmit(form.value.sleepTime),
            wakeTime: formatTimeForSubmit(form.value.wakeTime)
        }

        if (isEdit.value) {
            await sleepApi.updateRecord(editId.value, data)
            ElMessage.success('更新成功')
        } else {
            await sleepApi.createRecord(data)
            ElMessage.success('保存成功')
        }

        resetForm()
        loadRecords()
    } catch (error) {
        ElMessage.error(error.message || '保存失败')
    } finally {
        saving.value = false
    }
}

const editRecord = (row) => {
    isEdit.value = true
    editId.value = row.id
    form.value = {
        sleepTime: row.sleepTime.replace(' ', 'T').substring(0, 16),
        wakeTime: row.wakeTime.replace(' ', 'T').substring(0, 16),
        qualityScore: row.qualityScore,
        deepSleep: row.deepSleep,
        lightSleep: row.lightSleep,
        remark: row.remark || ''
    }
}

const deleteRecord = async (row) => {
    try {
        await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })
        await sleepApi.deleteRecord(row.id)
        ElMessage.success('删除成功')
        loadRecords()
    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error('删除失败')
        }
    }
}

const resetForm = () => {
    isEdit.value = false
    editId.value = null
    form.value = {
        sleepTime: '',
        wakeTime: '',
        qualityScore: 8,
        deepSleep: 2.5,
        lightSleep: 5.0,
        remark: ''
    }
}

const goToReport = () => {
    router.push('/report')
}

onMounted(() => {
    loadRecords()
})
</script>
