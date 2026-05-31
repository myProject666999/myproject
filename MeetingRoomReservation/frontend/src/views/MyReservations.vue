<template>
    <div class="page-container">
        <div class="page-header">
            <h2 class="page-title">我的预订</h2>
            <div class="filter-bar">
                <el-select v-model="filterStatus" placeholder="筛选状态" clearable style="width: 160px">
                    <el-option label="全部" :value="null" />
                    <el-option label="已预订" :value="1" />
                    <el-option label="已取消" :value="0" />
                    <el-option label="已完成" :value="2" />
                </el-select>
            </div>
        </div>
        
        <el-table :data="filteredReservations" style="width: 100%" stripe>
            <el-table-column prop="title" label="会议主题" min-width="150" />
            <el-table-column prop="roomName" label="会议室" width="120" />
            <el-table-column prop="roomLocation" label="位置" width="120" />
            <el-table-column label="开始时间" width="170">
                <template #default="{ row }">
                    {{ formatDateTime(row.startTime) }}
                </template>
            </el-table-column>
            <el-table-column label="结束时间" width="170">
                <template #default="{ row }">
                    {{ formatDateTime(row.endTime) }}
                </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
                <template #default="{ row }">
                    <el-tag :type="getStatusTagType(row.status)" size="small">
                        {{ getStatusText(row.status) }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
                <template #default="{ row }">
                    <el-button
                        v-if="row.status === 1 && canCancel(row)"
                        type="danger"
                        size="small"
                        @click="handleCancel(row)"
                    >
                        取消
                    </el-button>
                    <span v-else class="no-action">-</span>
                </template>
            </el-table-column>
        </el-table>
        
        <el-empty v-if="filteredReservations.length === 0" description="暂无预订记录" />
        
        <el-dialog v-model="cancelDialogVisible" title="取消预订" width="450px">
            <el-form :model="cancelForm" :rules="cancelRules" ref="cancelFormRef" label-width="100px">
                <el-form-item label="取消原因" prop="cancelReason">
                    <el-input
                        v-model="cancelForm.cancelReason"
                        type="textarea"
                        :rows="3"
                        placeholder="请输入取消原因"
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="cancelDialogVisible = false">取消</el-button>
                <el-button type="danger" :loading="canceling" @click="confirmCancel">
                    确认取消
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { getMyReservations, cancelReservation } from '@/api/reservation'

const reservations = ref([])
const filterStatus = ref(null)
const cancelDialogVisible = ref(false)
const cancelFormRef = ref(null)
const canceling = ref(false)

const cancelForm = reactive({
    id: null,
    cancelReason: ''
})

const cancelRules = {
    cancelReason: [{ required: true, message: '请输入取消原因', trigger: 'blur' }]
}

const filteredReservations = computed(() => {
    if (filterStatus.value === null || filterStatus.value === undefined) {
        return reservations.value
    }
    return reservations.value.filter(r => r.status === filterStatus.value)
})

const formatDateTime = (dateTime) => {
    return dayjs(dateTime).format('YYYY-MM-DD HH:mm')
}

const getStatusTagType = (status) => {
    const types = {
        0: 'info',
        1: 'success',
        2: 'warning'
    }
    return types[status] || 'info'
}

const getStatusText = (status) => {
    const texts = {
        0: '已取消',
        1: '已预订',
        2: '已完成'
    }
    return texts[status] || '未知'
}

const canCancel = (reservation) => {
    const now = dayjs()
    const startTime = dayjs(reservation.startTime)
    return startTime.diff(now, 'hour') >= 2
}

const handleCancel = (reservation) => {
    ElMessageBox.confirm(
        '确定要取消这个预订吗？',
        '提示',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(() => {
        cancelForm.id = reservation.id
        cancelForm.cancelReason = ''
        cancelDialogVisible.value = true
    }).catch(() => {})
}

const confirmCancel = async () => {
    if (!cancelFormRef.value) return
    
    await cancelFormRef.value.validate(async (valid) => {
        if (valid) {
            canceling.value = true
            try {
                await cancelReservation(cancelForm)
                ElMessage.success('取消成功')
                cancelDialogVisible.value = false
                loadMyReservations()
            } catch (error) {
                // 错误已在拦截器中处理
            } finally {
                canceling.value = false
            }
        }
    })
}

const loadMyReservations = async () => {
    try {
        const res = await getMyReservations()
        reservations.value = res.data
    } catch (error) {
        ElMessage.error('加载预订列表失败')
    }
}

onMounted(() => {
    loadMyReservations()
})
</script>

<style scoped>
.filter-bar {
    display: flex;
    align-items: center;
}

.no-action {
    color: #c0c4cc;
}
</style>
