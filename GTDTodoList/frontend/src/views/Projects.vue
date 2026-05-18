<template>
    <div class="projects-page">
        <div class="page-header">
            <h2>项目管理</h2>
            <el-button type="primary" @click="showAddDialog = true">
                <el-icon><Plus /></el-icon>
                新建项目
            </el-button>
        </div>

        <div class="projects-grid">
            <div
                v-for="project in projects"
                :key="project.id"
                class="project-card"
                @click="selectProject(project)"
            >
                <div class="project-header" :style="{ borderLeftColor: project.color }">
                    <h3>{{ project.name }}</h3>
                    <span class="project-count">{{ getProjectTaskCount(project.id) }}</span>
                </div>
                <p v-if="project.description" class="project-desc">{{ project.description }}</p>
                <div class="project-footer">
                    <span>创建于 {{ formatDate(project.createdAt) }}</span>
                    <el-button
                        size="small"
                        type="danger"
                        text
                        @click.stop="deleteProject(project.id)"
                    >
                        删除
                    </el-button>
                </div>
            </div>
        </div>

        <el-drawer v-model="showProjectDetail" title="项目详情" size="600px">
            <div v-if="selectedProject" class="project-detail">
                <h3 :style="{ color: selectedProject.color }">{{ selectedProject.name }}</h3>
                <p v-if="selectedProject.description">{{ selectedProject.description }}</p>
                
                <div class="task-section">
                    <div class="section-header">
                        <h4>任务列表</h4>
                        <el-button size="small" type="primary" @click="showAddTaskDialog = true">
                            添加任务
                        </el-button>
                    </div>
                    
                    <div v-if="projectTasks.length === 0" class="empty-tasks">
                        <el-empty description="暂无任务" />
                    </div>
                    
                    <div v-else class="task-list">
                        <div
                            v-for="task in projectTasks"
                            :key="task.id"
                            class="task-item"
                            :class="{ completed: task.completed }"
                        >
                            <el-checkbox
                                :model-value="task.completed"
                                @change="toggleTask(task.id)"
                            />
                            <div class="task-content">
                                <span class="task-title">{{ task.title }}</span>
                                <div class="task-meta">
                                    <el-tag
                                        v-if="task.isUrgent"
                                        type="danger"
                                        size="small"
                                    >
                                        紧急
                                    </el-tag>
                                    <el-tag
                                        v-if="task.isImportant"
                                        type="warning"
                                        size="small"
                                    >
                                        重要
                                    </el-tag>
                                    <span v-if="task.dueDate" class="task-due">
                                        📅 {{ formatDate(task.dueDate) }}
                                    </span>
                                </div>
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
        </el-drawer>

        <el-dialog v-model="showAddDialog" title="新建项目" width="500px">
            <el-form :model="newProject" label-width="80px">
                <el-form-item label="项目名称">
                    <el-input v-model="newProject.name" placeholder="请输入项目名称" />
                </el-form-item>
                <el-form-item label="描述">
                    <el-input
                        v-model="newProject.description"
                        type="textarea"
                        :rows="3"
                        placeholder="请输入描述（可选）"
                    />
                </el-form-item>
                <el-form-item label="颜色">
                    <el-color-picker v-model="newProject.color" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showAddDialog = false">取消</el-button>
                <el-button type="primary" @click="addProject">确定</el-button>
            </template>
        </el-dialog>

        <el-dialog v-model="showAddTaskDialog" title="添加任务" width="500px">
            <el-form :model="newTask" label-width="80px">
                <el-form-item label="标题">
                    <el-input v-model="newTask.title" placeholder="请输入任务标题" />
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
                <el-button @click="showAddTaskDialog = false">取消</el-button>
                <el-button type="primary" @click="addTask">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { getProjects, createProject, deleteProject } from '@/api/project'
import { getTasksByProject, createTask, toggleTaskComplete, deleteTask } from '@/api/task'

const store = useStore()
const userId = store.state.userId

const projects = ref([])
const selectedProject = ref(null)
const projectTasks = ref([])
const showAddDialog = ref(false)
const showProjectDetail = ref(false)
const showAddTaskDialog = ref(false)

const newProject = ref({
    name: '',
    description: '',
    color: '#3B82F6'
})

const newTask = ref({
    title: '',
    isUrgent: false,
    isImportant: false,
    dueDate: null
})

const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('zh-CN')
}

const getProjectTaskCount = (projectId) => {
    return projectTasks.value.filter(t => t.projectId === projectId && !t.completed).length
}

const loadProjects = async () => {
    const res = await getProjects(userId)
    projects.value = res
}

const selectProject = async (project) => {
    selectedProject.value = project
    const res = await getTasksByProject(userId, project.id)
    projectTasks.value = res
    showProjectDetail.value = true
}

const addProject = async () => {
    if (!newProject.value.name.trim()) {
        ElMessage.warning('请输入项目名称')
        return
    }
    await createProject({
        ...newProject.value,
        userId
    })
    newProject.value = {
        name: '',
        description: '',
        color: '#3B82F6'
    }
    showAddDialog.value = false
    ElMessage.success('创建成功')
    loadProjects()
}

const deleteProject = async (id) => {
    await deleteProject(id)
    ElMessage.success('删除成功')
    loadProjects()
}

const addTask = async () => {
    if (!newTask.value.title.trim()) {
        ElMessage.warning('请输入标题')
        return
    }
    await createTask({
        ...newTask.value,
        userId,
        projectId: selectedProject.value.id
    })
    newTask.value = {
        title: '',
        isUrgent: false,
        isImportant: false,
        dueDate: null
    }
    showAddTaskDialog.value = false
    ElMessage.success('添加成功')
    selectProject(selectedProject.value)
}

const toggleTask = async (id) => {
    await toggleTaskComplete(id)
    selectProject(selectedProject.value)
}

const deleteTask = async (id) => {
    await deleteTask(id)
    ElMessage.success('删除成功')
    selectProject(selectedProject.value)
}

onMounted(() => {
    loadProjects()
})
</script>

<style scoped>
.projects-page {
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
.projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
}
.project-card {
    background: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}
.project-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}
.project-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    padding-left: 12px;
    border-left: 4px solid #3B82F6;
}
.project-header h3 {
    margin: 0;
    font-size: 18px;
    color: #333;
}
.project-count {
    background: #f0f0f0;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 14px;
    color: #666;
}
.project-desc {
    color: #666;
    font-size: 14px;
    margin-bottom: 12px;
}
.project-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #999;
}
.project-detail h3 {
    margin: 0 0 8px 0;
}
.project-detail p {
    color: #666;
    margin-bottom: 20px;
}
.task-section {
    margin-top: 20px;
}
.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}
.section-header h4 {
    margin: 0;
}
.empty-tasks {
    padding: 40px 0;
}
.task-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.task-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    background: #f8f9fa;
    border-radius: 6px;
}
.task-item.completed .task-title {
    text-decoration: line-through;
    color: #999;
}
.task-content {
    flex: 1;
}
.task-title {
    display: block;
    margin-bottom: 4px;
}
.task-meta {
    display: flex;
    gap: 8px;
    align-items: center;
}
.task-due {
    font-size: 12px;
    color: #666;
}
</style>
