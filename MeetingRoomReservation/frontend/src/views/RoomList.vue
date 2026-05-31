<template>
    <div class="page-container">
        <div class="page-header">
            <h2 class="page-title">会议室列表</h2>
            <el-input
                v-model="searchKeyword"
                placeholder="搜索会议室..."
                style="width: 250px"
                clearable
            >
                <template #prefix>
                    <el-icon><Search /></el-icon>
                </template>
            </el-input>
        </div>
        
        <el-row :gutter="20">
            <el-col :span="8" v-for="room in filteredRooms" :key="room.id">
                <el-card class="room-card" shadow="hover" @click="viewRoomDetail(room)">
                    <div class="room-header">
                        <div class="room-icon">
                            <el-icon size="32"><OfficeBuilding /></el-icon>
                        </div>
                        <div class="room-info">
                            <h3>{{ room.name }}</h3>
                            <p class="room-code">{{ room.code }}</p>
                        </div>
                        <el-tag :type="room.status === 1 ? 'success' : 'info'" size="small">
                            {{ room.status === 1 ? '可用' : '禁用' }}
                        </el-tag>
                    </div>
                    
                    <div class="room-details">
                        <div class="detail-item">
                            <el-icon><Location /></el-icon>
                            <span>{{ room.location }}</span>
                        </div>
                        <div class="detail-item">
                            <el-icon><User /></el-icon>
                            <span>容纳 {{ room.capacity }} 人</span>
                        </div>
                        <div class="detail-item" v-if="room.equipment">
                            <el-icon><Tools /></el-icon>
                            <span>{{ room.equipment }}</span>
                        </div>
                    </div>
                    
                    <div class="room-footer">
                        <el-button type="primary" size="small" @click.stop="goToBooking(room)">
                            立即预订
                        </el-button>
                        <el-button size="small" @click.stop="viewRoomDetail(room)">
                            查看详情
                        </el-button>
                    </div>
                </el-card>
            </el-col>
        </el-row>
        
        <el-empty v-if="filteredRooms.length === 0" description="暂无会议室" />
        
        <el-dialog v-model="detailVisible" title="会议室详情" width="500px">
            <div v-if="selectedRoom" class="room-detail">
                <el-descriptions :column="1" border>
                    <el-descriptions-item label="会议室名称">{{ selectedRoom.name }}</el-descriptions-item>
                    <el-descriptions-item label="会议室编号">{{ selectedRoom.code }}</el-descriptions-item>
                    <el-descriptions-item label="位置">{{ selectedRoom.location }}</el-descriptions-item>
                    <el-descriptions-item label="容纳人数">{{ selectedRoom.capacity }} 人</el-descriptions-item>
                    <el-descriptions-item label="设备配置">{{ selectedRoom.equipment || '无' }}</el-descriptions-item>
                    <el-descriptions-item label="描述">{{ selectedRoom.description || '无' }}</el-descriptions-item>
                    <el-descriptions-item label="状态">
                        <el-tag :type="selectedRoom.status === 1 ? 'success' : 'info'">
                            {{ selectedRoom.status === 1 ? '可用' : '禁用' }}
                        </el-tag>
                    </el-descriptions-item>
                </el-descriptions>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, OfficeBuilding, Location, User, Tools } from '@element-plus/icons-vue'
import { getRoomList } from '@/api/room'

const router = useRouter()
const rooms = ref([])
const searchKeyword = ref('')
const detailVisible = ref(false)
const selectedRoom = ref(null)

const filteredRooms = computed(() => {
    if (!searchKeyword.value) return rooms.value
    const keyword = searchKeyword.value.toLowerCase()
    return rooms.value.filter(room => 
        room.name.toLowerCase().includes(keyword) ||
        room.code.toLowerCase().includes(keyword) ||
        room.location.toLowerCase().includes(keyword)
    )
})

const loadRooms = async () => {
    try {
        const res = await getRoomList()
        rooms.value = res.data
    } catch (error) {
        ElMessage.error('加载会议室列表失败')
    }
}

const viewRoomDetail = (room) => {
    selectedRoom.value = room
    detailVisible.value = true
}

const goToBooking = (room) => {
    router.push({
        path: '/booking',
        query: { roomId: room.id }
    })
}

onMounted(() => {
    loadRooms()
})
</script>

<style scoped>
.room-card {
    margin-bottom: 20px;
    cursor: pointer;
    transition: transform 0.2s;
}

.room-card:hover {
    transform: translateY(-4px);
}

.room-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
}

.room-icon {
    width: 48px;
    height: 48px;
    background: #ecf5ff;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #409EFF;
    margin-right: 12px;
}

.room-info {
    flex: 1;
}

.room-info h3 {
    margin: 0;
    color: #303133;
    font-size: 16px;
}

.room-code {
    margin: 4px 0 0;
    color: #909399;
    font-size: 12px;
}

.room-details {
    margin-bottom: 16px;
}

.detail-item {
    display: flex;
    align-items: center;
    color: #606266;
    font-size: 14px;
    margin-bottom: 8px;
}

.detail-item .el-icon {
    margin-right: 8px;
    color: #909399;
}

.room-footer {
    display: flex;
    gap: 8px;
    padding-top: 12px;
    border-top: 1px solid #ebeef5;
}

.room-detail :deep(.el-descriptions__label) {
    width: 100px;
}
</style>
