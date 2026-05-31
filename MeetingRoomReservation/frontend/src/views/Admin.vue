<template>
    <div class="page-container">
        <div class="page-header">
            <h2 class="page-title">后台管理</h2>
        </div>
        
        <el-tabs v-model="activeTab">
            <el-tab-pane label="会议室管理" name="rooms">
                <div class="tab-header">
                    <el-button type="primary" @click="openRoomDialog(null)">
                        <el-icon><Plus /></el-icon>
                        添加会议室
                    </el-button>
                </div>
                
                <el-table :data="rooms" style="width: 100%" stripe>
                    <el-table-column prop="name" label="会议室名称" />
                    <el-table-column prop="code" label="会议室编号" width="120" />
                    <el-table-column prop="location" label="位置" width="150" />
                    <el-table-column prop="capacity" label="容纳人数" width="100" align="center" />
                    <el-table-column prop="equipment" label="设备配置" show-overflow-tooltip />
                    <el-table-column label="状态" width="100" align="center">
                        <template #default="{ row }">
                            <el-switch
                                v-model="row.status"
                                :active-value="1"
                                :inactive-value="0"
                                @change="handleRoomStatusChange(row)"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="150" align="center">
                        <template #default="{ row }">
                            <el-button size="small" @click="openRoomDialog(row)">编辑</el-button>
                            <el-button size="small" type="danger" @click="handleDeleteRoom(row)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
            
            <el-tab-pane label="预订管理" name="reservations">
                <div class="tab-header">
                    <el-form :inline="true">
                        <el-form-item label="会议室">
                            <el-select v-model="filterRoomId" placeholder="全部" clearable style="width: 150px">
                                <el-option
                                    v-for="room in rooms"
                                    :key="room.id"
                                    :label="room.name"
                                    :value="room.id"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="状态">
                            <el-select v-model="filterStatus" placeholder="全部" clearable style="width: 120px">
                                <el-option label="已预订" :value="1" />
                                <el-option label="已取消" :value="0" />
                                <el-option label="已完成" :value="2" />
                            </el-select>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="loadReservations">查询</el-button>
                        </el-form-item>
                    </el-form>
                </div>
                
                <el-table :data="reservations" style="width: 100%" stripe>
                    <el-table-column prop="title" label="会议主题" />
                    <el-table-column label="会议室" min-width="120">
                        <template #default="{ row }">
                            {{ getRoomName(row.roomId) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="userName" label="预订人" width="100" />
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
                    <el-table-column label="状态" width="100" align="center">
                        <template #default="{ row }">
                            <el-tag :type="getStatusTagType(row.status)" size="small">
                                {{ getStatusText(row.status) }}
                            </el-tag>
                        </template>
                    </el-table-column>
                </el-table>
                
                <el-pagination
                    style="margin-top: 20px; justify-content: center"
                    v-model:current-page="pageNum"
                    v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 50]"
                    :total="total"
                    layout="total, sizes, prev, pager, next, jumper"
                    @size-change="loadReservations"
                    @current-change="loadReservations"
                />
            </el-tab-pane>
        </el-tabs>
        
        <el-dialog v-model="roomDialogVisible" title="会议室信息" width="500px">
            <el-form ref="roomFormRef" :model="roomForm" :rules="roomRules" label-width="100px">
                <el-form-item label="会议室名称" prop="name">
                    <el-input v-model="roomForm.name" placeholder="请输入会议室名称" />
                </el-form-item>
                <el-form-item label="会议室编号" prop="code">
                    <el-input v-model="roomForm.code" placeholder="请输入会议室编号" />
                </el-form-item>
                <el-form-item label="位置" prop="location">
                    <el-input v-model="roomForm.location" placeholder="请输入会议室位置" />
                </el-form-item>
                <el-form-item label="容纳人数" prop="capacity">
                    <el-input-number v-model="roomForm.capacity" :min="1" :max="100" />
                </el-form-item>
                <el-form-item label="设备配置">
                    <el-input
                        v-model="roomForm.equipment"
                        type="textarea"
                        :rows="2"
                        placeholder="请输入设备配置（可选）"
                    />
                </el-form-item>
                <el-form-item label="描述">
                    <el-input
                        v-model="roomForm.description"
                        type="textarea"
                        :rows="3"
                        placeholder="请输入描述（可选）"
                    />
                </el-form-item>
                <el-form-item label="状态">
                    <el-switch v-model="roomForm.status" :active-value="1" :inactive-value="0" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="roomDialogVisible = false">取消</el-button>
                <el-button type="primary" :loading="submitting" @click="submitRoom">确认</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { getRoomList, addRoom, updateRoom, deleteRoom } from '@/api/room'
import { getReservationPage } from '@/api/reservation'

const activeTab = ref('rooms')
const rooms = ref([])
const reservations = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const filterRoomId = ref(null)
const filterStatus = ref(null)

const roomDialogVisible = ref(false)
const roomFormRef = ref(null)
const submitting = ref(false)
const isEdit = ref(false)

const roomForm = reactive({
    id: null,
    name: '',
    code: '',
    location: '',
    capacity: 10,
    equipment: '',
    description: '',
    status: 1
})

const roomRules = {
    name: [{ required: true, message: '请输入会议室名称', trigger: 'blur' }],
    code: [{ required: true, message: '请输入会议室编号', trigger: 'blur' }],
    location: [{ required: true, message: '请输入位置', trigger: 'blur' }],
    capacity: [{ required: true, message: '请输入容纳人数', trigger: 'blur' }]
}

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

const getRoomName = (roomId) => {
    const room = rooms.value.find(r => r.id === roomId)
    return room ? room.name : '-'
}

const loadRooms = async () => {
    try {
        const res = await getRoomList()
        rooms.value = res.data
    } catch (error) {
        ElMessage.error('加载会议室列表失败')
    }
}

const loadReservations = async () => {
    try {
        const params = {
            pageNum: pageNum.value,
            pageSize: pageSize.value
        }
        if (filterRoomId.value) params.roomId = filterRoomId.value
        if (filterStatus.value !== null && filterStatus.value !== undefined) {
            params.status = filterStatus.value
        }
        
        const res = await getReservationPage(params)
        reservations.value = res.data.records
        total.value = res.data.total
    } catch (error) {
        ElMessage.error('加载预订列表失败')
    }
}

const openRoomDialog = (room) => {
    if (room) {
        isEdit.value = true
        Object.assign(roomForm, room)
    } else {
        isEdit.value = false
        roomForm.id = null
        roomForm.name = ''
        roomForm.code = ''
        roomForm.location = ''
        roomForm.capacity = 10
        roomForm.equipment = ''
        roomForm.description = ''
        roomForm.status = 1
    }
    roomDialogVisible.value = true
}

const submitRoom = async () => {
    if (!roomFormRef.value) return
    
    await roomFormRef.value.validate(async (valid) => {
        if (valid) {
            submitting.value = true
            try {
                if (isEdit.value) {
                    await updateRoom(roomForm)
                    ElMessage.success('更新成功')
                } else {
                    await addRoom(roomForm)
                    ElMessage.success('添加成功')
                }
                roomDialogVisible.value = false
                loadRooms()
            } catch (error) {
                // 错误已在拦截器中处理
            } finally {
                submitting.value = false
            }
        }
    })
}

const handleRoomStatusChange = async (room) => {
    try {
        await updateRoom(room)
        ElMessage.success('状态更新成功')
    } catch (error) {
        room.status = room.status === 1 ? 0 : 1
    }
}

const handleDeleteRoom = (room) => {
    ElMessageBox.confirm(
        `确定要删除会议室"${room.name}"吗？`,
        '提示',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(async () => {
        try {
            await deleteRoom(room.id)
            ElMessage.success('删除成功')
            loadRooms()
        } catch (error) {
            // 错误已在拦截器中处理
        }
    }).catch(() => {})
}

onMounted(() => {
    loadRooms()
    loadReservations()
})
</script>

<style scoped>
.tab-header {
    margin-bottom: 20px;
    display: flex;
    justify-content: flex-end;
}

.tab-header .el-form {
    width: 100%;
}
</style>
