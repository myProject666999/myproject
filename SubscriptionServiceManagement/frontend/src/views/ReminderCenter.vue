<template>
    <div class="page-container">
        <div class="page-header">
            <h2 class="page-title">提醒中心</h2>
            <el-button type="primary" @click="handleGenerate">
                <el-icon><Refresh /></el-icon>
                生成提醒
            </el-button>
        </div>

        <div class="card">
            <el-table :data="reminders" v-loading="loading" stripe>
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="subscriptionId" label="订阅ID" width="100" />
                <el-table-column prop="message" label="提醒内容" min-width="300" />
                <el-table-column prop="reminderDate" label="提醒日期" width="140" />
                <el-table-column prop="isSent" label="状态" width="100">
                    <template #default="{ row }">
                        <el-tag :type="row.isSent ? 'success' : 'warning'" size="small">
                            {{ row.isSent ? '已发送' : '待发送' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="createdAt" label="创建时间" width="180" />
                <el-table-column label="操作" width="150" fixed="right">
                    <template #default="{ row }">
                        <el-button
                            v-if="!row.isSent"
                            type="success"
                            size="small"
                            link
                            @click="handleMarkSent(row)"
                        >
                            标记已读
                        </el-button>
                        <el-button type="danger" size="small" link @click="handleDelete(row)">
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-empty v-if="reminders.length === 0 && !loading" description="暂无提醒" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPendingReminders, markReminderSent, generateReminders } from '../api'

const loading = ref(false)
const reminders = ref([])

const loadData = async () => {
    loading.value = true
    try {
        reminders.value = await getPendingReminders()
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

const handleGenerate = async () => {
    try {
        await ElMessageBox.confirm('确定要生成提醒吗？', '确认', { type: 'info' })
        await generateReminders()
        ElMessage.success('提醒生成成功')
        loadData()
    } catch (e) {
        if (e !== 'cancel') console.error(e)
    }
}

const handleMarkSent = async (row) => {
    try {
        await markReminderSent(row.id)
        ElMessage.success('已标记为已读')
        loadData()
    } catch (e) {
        console.error(e)
    }
}

const handleDelete = async (row) => {
    try {
        await ElMessageBox.confirm('确定删除此提醒吗？', '删除确认', { type: 'warning' })
        ElMessage.success('删除成功')
        loadData()
    } catch (e) {
        if (e !== 'cancel') console.error(e)
    }
}

onMounted(loadData)
</script>
