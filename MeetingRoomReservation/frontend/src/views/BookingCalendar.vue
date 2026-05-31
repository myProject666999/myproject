<template>
    <div class="page-container">
        <div class="page-header">
            <h2 class="page-title">预订日历</h2>
            <div class="filter-bar">
                <el-select v-model="selectedRoomId" placeholder="选择会议室" clearable style="width: 200px; margin-right: 12px" @change="handleFilter">
                    <el-option
                        v-for="room in rooms"
                        :key="room.id"
                        :label="room.name"
                        :value="room.id"
                    />
                </el-select>
                <el-button type="primary" @click="openBookingDialog">
                    <el-icon><Plus /></el-icon>
                    新建预订
                </el-button>
            </div>
        </div>
        
        <div class="calendar-wrapper">
            <div class="time-column">
                <div class="date-header">{{ currentWeekStart }} ~ {{ currentWeekEnd }}</div>
                <div class="time-slots">
                    <div v-for="slot in timeSlots" :key="slot" class="time-slot">
                        {{ slot }}
                    </div>
                </div>
            </div>
            
            <div class="rooms-column">
                <div class="room-headers">
                    <div v-for="room in displayRooms" :key="room.id" class="room-header">
                        {{ room.name }}
                    </div>
                </div>
                <div class="room-slots-container">
                    <div v-for="room in displayRooms" :key="room.id" class="room-slots">
                        <div
                            v-for="slot in timeSlots"
                            :key="slot"
                            class="slot"
                            :class="getSlotClass(room.id, slot)"
                            @click="handleSlotClick(room, slot)"
                        >
                            <div v-if="getReservation(room.id, slot)" class="reservation-info">
                                <div class="reservation-title">
                                    {{ getReservation(room.id, slot).title }}
                                </div>
                                <div class="reservation-user">
                                    {{ getReservation(room.id, slot).userName || '已预订' }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <el-dialog v-model="bookingDialogVisible" title="新建预订" width="500px">
            <el-form ref="bookingFormRef" :model="bookingForm" :rules="bookingRules" label-width="100px">
                <el-form-item label="会议室" prop="roomId">
                    <el-select v-model="bookingForm.roomId" placeholder="请选择会议室" style="width: 100%">
                        <el-option
                            v-for="room in rooms"
                            :key="room.id"
                            :label="`${room.name} (${room.location}, ${room.capacity}人)`"
                            :value="room.id"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="会议主题" prop="title">
                    <el-input v-model="bookingForm.title" placeholder="请输入会议主题" maxlength="100" show-word-limit />
                </el-form-item>
                <el-form-item label="开始时间" prop="startTime">
                    <el-date-picker
                        v-model="bookingForm.startTime"
                        type="datetime"
                        placeholder="选择开始时间"
                        format="YYYY-MM-DD HH:mm"
                        style="width: 100%"
                    />
                </el-form-item>
                <el-form-item label="结束时间" prop="endTime">
                    <el-date-picker
                        v-model="bookingForm.endTime"
                        type="datetime"
                        placeholder="选择结束时间"
                        format="YYYY-MM-DD HH:mm"
                        style="width: 100%"
                    />
                </el-form-item>
                <el-form-item label="参会人数">
                    <el-input-number v-model="bookingForm.attendees" :min="1" :max="100" />
                </el-form-item>
                <el-form-item label="会议说明">
                    <el-input
                        v-model="bookingForm.description"
                        type="textarea"
                        :rows="3"
                        placeholder="请输入会议说明（可选）"
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="bookingDialogVisible = false">取消</el-button>
                <el-button type="primary" :loading="submitting" @click="submitBooking">确认预订</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { getRoomList } from '@/api/room'
import { getRoomReservations, createReservation } from '@/api/reservation'

const route = useRoute()
const rooms = ref([])
const reservations = ref([])
const selectedRoomId = ref(null)
const bookingDialogVisible = ref(false)
const bookingFormRef = ref(null)
const submitting = ref(false)

const timeSlots = []
for (let hour = 8; hour <= 17; hour++) {
    timeSlots.push(`${String(hour).padStart(2, '0')}:00`)
    timeSlots.push(`${String(hour).padStart(2, '0')}:30`)
}
timeSlots.push('18:00')

const currentWeekStart = ref(dayjs().startOf('week').add(1, 'day').format('YYYY-MM-DD'))
const currentWeekEnd = ref(dayjs().startOf('week').add(7, 'day').format('YYYY-MM-DD'))

const displayRooms = computed(() => {
    if (!selectedRoomId.value) return rooms.value
    return rooms.value.filter(room => room.id === selectedRoomId.value)
})

const bookingForm = reactive({
    roomId: null,
    title: '',
    startTime: null,
    endTime: null,
    attendees: 1,
    description: ''
})

const bookingRules = {
    roomId: [{ required: true, message: '请选择会议室', trigger: 'change' }],
    title: [{ required: true, message: '请输入会议主题', trigger: 'blur' }],
    startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
    endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

const getSlotClass = (roomId, slot) => {
    const reservation = getReservation(roomId, slot)
    if (reservation) return 'slot-booked'
    return 'slot-available'
}

const getReservation = (roomId, slot) => {
    return reservations.value.find(r => {
        if (r.roomId !== roomId) return false
        const start = dayjs(r.startTime)
        const end = dayjs(r.endTime)
        const slotTime = dayjs(`${currentWeekStart.value} ${slot}`)
        return slotTime.isAfter(start.subtract(1, 'minute')) && slotTime.isBefore(end)
    })
}

const handleSlotClick = (room, slot) => {
    const slotTime = dayjs(`${currentWeekStart.value} ${slot}`)
    if (slotTime.isBefore(dayjs())) {
        ElMessage.warning('不能预订过去的时段')
        return
    }
    
    const reservation = getReservation(room.id, slot)
    if (reservation) {
        ElMessage.info('该时段已被预订')
        return
    }
    
    bookingForm.roomId = room.id
    bookingForm.startTime = slotTime.toDate()
    bookingForm.endTime = slotTime.add(1, 'hour').toDate()
    bookingDialogVisible.value = true
}

const handleFilter = () => {
    loadAllReservations()
}

const openBookingDialog = () => {
    bookingForm.roomId = null
    bookingForm.title = ''
    bookingForm.startTime = null
    bookingForm.endTime = null
    bookingForm.attendees = 1
    bookingForm.description = ''
    bookingDialogVisible.value = true
}

const submitBooking = async () => {
    if (!bookingFormRef.value) return
    
    await bookingFormRef.value.validate(async (valid) => {
        if (valid) {
            submitting.value = true
            try {
                await createReservation({
                    ...bookingForm,
                    startTime: dayjs(bookingForm.startTime).format('YYYY-MM-DD HH:mm:ss'),
                    endTime: dayjs(bookingForm.endTime).format('YYYY-MM-DD HH:mm:ss')
                })
                ElMessage.success('预订成功')
                bookingDialogVisible.value = false
                loadAllReservations()
            } catch (error) {
                // 错误已在拦截器中处理
            } finally {
                submitting.value = false
            }
        }
    })
}

const loadRooms = async () => {
    try {
        const res = await getRoomList()
        rooms.value = res.data
    } catch (error) {
        ElMessage.error('加载会议室列表失败')
    }
}

const loadAllReservations = async () => {
    try {
        const allReservations = []
        const roomIds = displayRooms.value.map(r => r.id)
        for (const roomId of roomIds) {
            const res = await getRoomReservations(roomId)
            allReservations.push(...res.data)
        }
        reservations.value = allReservations
    } catch (error) {
        ElMessage.error('加载预订信息失败')
    }
}

onMounted(async () => {
    await loadRooms()
    if (route.query.roomId) {
        selectedRoomId.value = Number(route.query.roomId)
    }
    loadAllReservations()
})
</script>

<style scoped>
.filter-bar {
    display: flex;
    align-items: center;
}

.calendar-wrapper {
    display: flex;
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.time-column {
    width: 80px;
    background: #f5f7fa;
    border-right: 1px solid #ebeef5;
}

.date-header {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    color: #303133;
    border-bottom: 1px solid #ebeef5;
    font-size: 12px;
}

.time-slots {
    display: flex;
    flex-direction: column;
}

.time-slot {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #606266;
    border-bottom: 1px solid #ebeef5;
}

.rooms-column {
    flex: 1;
    overflow-x: auto;
}

.room-headers {
    display: flex;
    min-width: 100%;
}

.room-header {
    min-width: 150px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    color: #303133;
    border-bottom: 1px solid #ebeef5;
    border-right: 1px solid #ebeef5;
    background: #fafafa;
}

.room-slots-container {
    display: flex;
    min-width: 100%;
}

.room-slots {
    min-width: 150px;
    border-right: 1px solid #ebeef5;
}

.slot {
    height: 40px;
    border-bottom: 1px solid #ebeef5;
    cursor: pointer;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
}

.slot-available {
    background: #f0f9eb;
}

.slot-available:hover {
    background: #e1f3d8;
}

.slot-booked {
    background: #fef0f0;
    cursor: not-allowed;
}

.reservation-info {
    font-size: 10px;
    text-align: center;
    overflow: hidden;
}

.reservation-title {
    font-weight: 500;
    color: #f56c6c;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.reservation-user {
    color: #909399;
    font-size: 9px;
}
</style>
