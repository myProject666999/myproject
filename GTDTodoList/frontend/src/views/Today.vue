<template>
    <div class="today-page">
        <div class="page-header">
            <h2>今日待办</h2>
            <el-button type="primary" @click="showAddDialog = true">
                <el-icon><Plus /></el-icon>
                添加任务
            </el-button>
        </div>

        <div class="quadrant-container">
            <div class="quadrant-row">
                <div class="quadrant quadrant-urgent-important">
                    <div class="quadrant-header">
                        <h3>重要且紧急</h3>
                        <span class="quadrant-count">{{ urgentImportant.length }}</span>
                    </div>
                    <div ref="urgentImportantContainer" class="quadrant-content">
                        <div
                            v-for="task in urgentImportant"
                            :key="task.id"
                            :data-id="task.id"
                            class="task-item"
                            :class="{ completed: task.completed }"
                        >
                            <el-checkbox
                                :model-value="task.completed"
                                @change="toggleTask(task.id)"
                            />
                            <div class="task-info">
                                <span class="task-title">{{ task.title }}</span>
                                <span v-if="task.dueDate" class="task-due">
                                    📅 {{ formatDate(task.dueDate) }}
                                </span>
                            </div>
                            <el-button
                                size="small"
                                type="danger"
                                text
                                @click="deleteTask(task.id)"
                            >
                                删除
                            </el-button>
                        </div>
                    </div>
                </div>

                <div class="quadrant quadrant-not-urgent-important">
                    <div class="quadrant-header">
                        <h3>重要不紧急</h3>
                        <span class="quadrant-count">{{ notUrgentImportant.length }}</span>
                    </div>
                    <div ref="notUrgentImportantContainer" class="quadrant-content">
                        <div
                            v-for="task in notUrgentImportant"
                            :key="task.id"
                            :data-id="task.id"
                            class="task-item"
                            :class="{ completed: task.completed }"
                        >
                            <el-checkbox
                                :model-value="task.completed"
                                @change="toggleTask(task.id)"
                            />
                            <div class="task-info">
                                <span class="task-title">{{ task.title }}</span>
                                <span v-if="task.dueDate" class="task-due">
                                    📅 {{ formatDate(task.dueDate) }}
                                </span>
                            </div>
                            <el-button
                                size="small"
                                type="danger"
                                text
                                @click="deleteTask(task.id)"
                            >
                                删除
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="quadrant-row">
                <div class="quadrant quadrant-urgent-not-important">
                    <div class="quadrant-header">
                        <h3>紧急不重要</h3>
                        <span class="quadrant-count">{{ urgentNotImportant.length }}</span>
                    </div>
                    <div ref="urgentNotImportantContainer" class="quadrant-content">
                        <div
                            v-for="task in urgentNotImportant"
                            :key="task.id"
                            :data-id="task.id"
                            class="task-item"
                            :class="{ completed: task.completed }"
                        >
                            <el-checkbox
                                :model-value="task.completed"
                                @change="toggleTask(task.id)"
                            />
                            <div class="task-info">
                                <span class="task-title">{{ task.title }}</span>
                                <span v-if="task.dueDate" class="task-due">
                                    📅 {{ formatDate(task.dueDate) }}
                                </span>
                            </div>
                            <el-button
                                size="small"
                                type="danger"
                                text
                                @click="deleteTask(task.id)"
                            >
                                删除
                            </el-button>
                        </div>
                    </div>
                </div>

                <div class="quadrant quadrant-not-urgent-not-important">
                    <div class="quadrant-header">
                        <h3>不紧急不重要</h3>
                        <span class="quadrant-count">{{ notUrgentNotImportant.length }}</span>
                    </div>
                    <div ref="notUrgentNotImportantContainer" class="quadrant-content">
                        <div
                            v-for="task in notUrgentNotImportant"
                            :key="task.id"
                            :data-id="task.id"
                            class="task-item"
                            :class="{ completed: task.completed }"
                        >
                            <el-checkbox
                                :model-value="task.completed"
                                @change="toggleTask(task.id)"
                            />
                            <div class="task-info">
                                <span class="task-title">{{ task.title }}</span>
                                <span v-if="task.dueDate" class="task-due">
                                    📅 {{ formatDate(task.dueDate) }}
                                </span>
                            </div>
                            <el-button
                                size="small"
                                type="danger"
                                text
                                @click="deleteTask(task.id)"
                            >
                                删除
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <el-dialog v-model="showAddDialog" title="添加任务" width="500px">
            <el-form :model="newTask" label-width="80px">
                <el-form-item label="标题">
                    <el-input v-model="newTask.title" placeholder="请输入任务标题" />
                </el-form-item>
                <el-form-item label="项目">
                    <el-select v-model="newTask.projectId" placeholder="选择项目">
                        <el-option
                            v-for="project in projects"
                            :key="project.id"
                            :label="project.name"
                            :value="project.id"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="紧急">
                    <el-switch v-model="newTask.isUrgent" />
                </el-form-item>
                <el-form-item label="重要">
                    <el-switch v-model="newTask.isImportant" />
                </el-form-item>
                <el-form-item label="截止日期">
                    <el-date-picker
                        v-model="newTask.dueDate"
                        type="date"
                        placeholder="选择日期"
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showAddDialog = false">取消</el-button>
                <el-button type="primary" @click="addTask">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import Sortable from 'sortablejs'
import { getTodayTasks, createTask, toggleTaskComplete, deleteTask, updateTaskSortOrder } from '@/api/task'
import { getProjects } from '@/api/project'

const store = useStore()
const userId = store.state.userId

const tasks = ref([])
const projects = ref([])
const showAddDialog = ref(false)
const urgentImportantContainer = ref(null)
const notUrgentImportantContainer = ref(null)
const urgentNotImportantContainer = ref(null)
const notUrgentNotImportantContainer = ref(null)

const newTask = ref({
    title: '',
    projectId: null,
    isUrgent: false,
    isImportant: false,
    dueDate: null
})

const urgentImportant = computed(() => 
    tasks.value.filter(t => t.isUrgent && t.isImportant)
)
const notUrgentImportant = computed(() => 
    tasks.value.filter(t => !t.isUrgent && t.isImportant)
)
const urgentNotImportant = computed(() => 
    tasks.value.filter(t => t.isUrgent && !t.isImportant)
)
const notUrgentNotImportant = computed(() => 
    tasks.value.filter(t => !t.isUrgent && !t.isImportant)
)

const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('zh-CN')
}

const loadTasks = async () => {
    const res = await getTodayTasks(userId)
    tasks.value = res
}

const loadProjects = async () => {
    const res = await getProjects(userId)
    projects.value = res
}

const addTask = async () => {
    if (!newTask.value.title.trim()) {
        ElMessage.warning('请输入标题')
        return
    }
    await createTask({
        ...newTask.value,
        userId
    })
    newTask.value = {
        title: '',
        projectId: null,
        isUrgent: false,
        isImportant: false,
        dueDate: null
    }
    showAddDialog.value = false
    ElMessage.success('添加成功')
    loadTasks()
}

const toggleTask = async (id) => {
    await toggleTaskComplete(id)
    loadTasks()
}

const deleteTask = async (id) => {
    await deleteTask(id)
    ElMessage.success('删除成功')
    loadTasks()
}

const initSortable = async () => {
    await nextTick()
    
    const containers = [
        urgentImportantContainer.value,
        notUrgentImportantContainer.value,
        urgentNotImportantContainer.value,
        notUrgentNotImportantContainer.value
    ]
    
    containers.forEach(container => {
        if (!container) return
        
        new Sortable(container, {
            animation: 150,
            group: 'tasks',
            onEnd: async (evt) => {
                const allTaskIds = []
                containers.forEach(c => {
                    if (c) {
                        const ids = Array.from(c.children).map(el => el.getAttribute('data-id')).filter(id => id).map(Number)
                        allTaskIds.push(...ids)
                    }
                })
                await updateTaskSortOrder(allTaskIds)
            }
        })
    })
}

onMounted(() => {
    loadTasks()
    loadProjects()
    initSortable()
})
</script>

<style scoped>
.today-page {
    max-width: 1200px;
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
.quadrant-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.quadrant-row {
    display: flex;
    gap: 16px;
}
.quadrant {
    flex: 1;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.quadrant-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    color: white;
}
.quadrant-urgent-important .quadrant-header {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
}
.quadrant-not-urgent-important .quadrant-header {
    background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
}
.quadrant-urgent-not-important .quadrant-header {
    background: linear-gradient(135deg, #feca57 0%, #ff9ff3 100%);
}
.quadrant-not-urgent-not-important .quadrant-header {
    background: linear-gradient(135deg, #a0a0a0 0%, #636e72 100%);
}
.quadrant-header h3 {
    margin: 0;
    font-size: 16px;
}
.quadrant-count {
    background: rgba(255, 255, 255, 0.3);
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 14px;
}
.quadrant-content {
    background: white;
    padding: 12px;
    min-height: 150px;
}
.task-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    margin-bottom: 8px;
    background: #f8f9fa;
    border-radius: 6px;
    cursor: move;
    transition: all 0.2s;
}
.task-item:hover {
    background: #e9ecef;
}
.task-item.completed .task-title {
    text-decoration: line-through;
    color: #999;
}
.task-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.task-title {
    font-size: 14px;
    color: #333;
}
.task-due {
    font-size: 12px;
    color: #666;
}
</style>
