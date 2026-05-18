<template>
    <div class="inbox-page">
        <div class="page-header">
            <h2>收件箱</h2>
            <el-button type="primary" @click="showAddDialog = true">
                <el-icon><Plus /></el-icon>
                添加事项
            </el-button>
        </div>
        <el-card class="inbox-card">
            <div v-if="items.length === 0" class="empty-state">
                <el-empty description="收件箱为空，添加新的事项开始吧" />
            </div>
            <div v-else ref="sortContainer" class="item-list">
                <div
                    v-for="item in items"
                    :key="item.id"
                    :data-id="item.id"
                    class="inbox-item"
                >
                    <div class="item-content">
                        <div class="item-title">{{ item.title }}</div>
                        <div v-if="item.description" class="item-desc">{{ item.description }}</div>
                        <div class="item-meta">
                            <span>创建于 {{ formatDate(item.createdAt) }}</span>
                        </div>
                    </div>
                    <div class="item-actions">
                        <el-button size="small" type="success" @click="processItem(item)">
                            处理
                        </el-button>
                        <el-button size="small" type="danger" @click="deleteItem(item.id)">
                            删除
                        </el-button>
                    </div>
                </div>
            </div>
        </el-card>

        <el-dialog v-model="showAddDialog" title="添加收件箱事项" width="500px">
            <el-form :model="newItem" label-width="80px">
                <el-form-item label="标题">
                    <el-input v-model="newItem.title" placeholder="请输入标题" />
                </el-form-item>
                <el-form-item label="描述">
                    <el-input
                        v-model="newItem.description"
                        type="textarea"
                        :rows="3"
                        placeholder="请输入描述（可选）"
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showAddDialog = false">取消</el-button>
                <el-button type="primary" @click="addItem">确定</el-button>
            </template>
        </el-dialog>

        <el-dialog v-model="showProcessDialog" title="处理事项 - 转为任务" width="500px">
            <el-form :model="taskForm" label-width="80px">
                <el-form-item label="标题">
                    <el-input v-model="taskForm.title" />
                </el-form-item>
                <el-form-item label="项目">
                    <el-select v-model="taskForm.projectId" placeholder="选择项目">
                        <el-option
                            v-for="project in projects"
                            :key="project.id"
                            :label="project.name"
                            :value="project.id"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="紧急">
                    <el-switch v-model="taskForm.isUrgent" />
                </el-form-item>
                <el-form-item label="重要">
                    <el-switch v-model="taskForm.isImportant" />
                </el-form-item>
                <el-form-item label="截止日期">
                    <el-date-picker
                        v-model="taskForm.dueDate"
                        type="date"
                        placeholder="选择日期"
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showProcessDialog = false">取消</el-button>
                <el-button type="primary" @click="convertToTask">转为任务</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import Sortable from 'sortablejs'
import { getInboxItems, createInboxItem, processInboxItem, deleteInboxItem, updateInboxSortOrder } from '@/api/inbox'
import { createTask } from '@/api/task'
import { getProjects } from '@/api/project'

const store = useStore()
const userId = store.state.userId

const items = ref([])
const projects = ref([])
const showAddDialog = ref(false)
const showProcessDialog = ref(false)
const sortContainer = ref(null)
const currentItem = ref(null)

const newItem = ref({
    title: '',
    description: ''
})

const taskForm = ref({
    title: '',
    projectId: null,
    isUrgent: false,
    isImportant: false,
    dueDate: null
})

const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('zh-CN')
}

const loadItems = async () => {
    const res = await getInboxItems(userId)
    items.value = res
}

const loadProjects = async () => {
    const res = await getProjects(userId)
    projects.value = res
}

const addItem = async () => {
    if (!newItem.value.title.trim()) {
        ElMessage.warning('请输入标题')
        return
    }
    await createInboxItem({
        ...newItem.value,
        userId
    })
    newItem.value = { title: '', description: '' }
    showAddDialog.value = false
    ElMessage.success('添加成功')
    loadItems()
}

const processItem = (item) => {
    currentItem.value = item
    taskForm.value = {
        title: item.title,
        projectId: null,
        isUrgent: false,
        isImportant: false,
        dueDate: null
    }
    showProcessDialog.value = true
}

const convertToTask = async () => {
    await createTask({
        ...taskForm.value,
        userId,
        description: currentItem.value.description
    })
    await processInboxItem(currentItem.value.id)
    showProcessDialog.value = false
    ElMessage.success('已转为任务')
    loadItems()
}

const deleteItem = async (id) => {
    await deleteInboxItem(id)
    ElMessage.success('删除成功')
    loadItems()
}

const initSortable = async () => {
    await nextTick()
    if (!sortContainer.value) return
    
    new Sortable(sortContainer.value, {
        animation: 150,
        handle: '.inbox-item',
        onEnd: async (evt) => {
            const itemIds = Array.from(sortContainer.value.children).map(el => el.getAttribute('data-id')).map(Number)
            await updateInboxSortOrder(itemIds)
        }
    })
}

onMounted(() => {
    loadItems()
    loadProjects()
    initSortable()
})
</script>

<style scoped>
.inbox-page {
    max-width: 800px;
    margin: 0 auto;
}
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}
.page-header h2 {
    margin: 0;
    color: #333;
}
.inbox-card {
    border-radius: 8px;
}
.empty-state {
    padding: 40px 0;
}
.item-list {
    min-height: 100px;
}
.inbox-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #eee;
    cursor: move;
    transition: background-color 0.2s;
}
.inbox-item:hover {
    background-color: #f5f5f5;
}
.inbox-item:last-child {
    border-bottom: none;
}
.item-content {
    flex: 1;
}
.item-title {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
}
.item-desc {
    font-size: 14px;
    color: #666;
    margin-bottom: 4px;
}
.item-meta {
    font-size: 12px;
    color: #999;
}
.item-actions {
    display: flex;
    gap: 8px;
}
</style>
