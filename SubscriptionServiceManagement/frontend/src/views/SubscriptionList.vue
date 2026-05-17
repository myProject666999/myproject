<template>
    <div class="page-container">
        <div class="page-header">
            <h2 class="page-title">订阅列表</h2>
            <div class="header-actions">
                <el-input
                    v-model="searchKeyword"
                    placeholder="搜索订阅名称"
                    style="width: 200px; margin-right: 10px;"
                    clearable
                />
                <el-select v-model="categoryFilter" placeholder="分类筛选" style="width: 150px; margin-right: 10px;" clearable>
                    <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
                </el-select>
                <el-button type="primary" @click="goToAdd">
                    <el-icon><Plus /></el-icon>
                    添加订阅
                </el-button>
            </div>
        </div>

        <div class="card">
            <el-table :data="filteredList" v-loading="loading" stripe>
                <el-table-column prop="name" label="订阅名称" min-width="140" />
                <el-table-column prop="category" label="分类" width="100" />
                <el-table-column label="价格" width="130">
                    <template #default="{ row }">
                        <div><strong>{{ row.currency }} {{ row.price?.toFixed(2) }}</strong></div>
                        <div style="font-size: 12px; color: #909399;">
                            ≈ ¥{{ row.priceInCNY?.toFixed(2) }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="cycleType" label="周期" width="90">
                    <template #default="{ row }">
                        <el-tag :type="getCycleTypeColor(row.cycleType)" size="small">
                            {{ getCycleTypeLabel(row.cycleType) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="月均费用" width="100">
                    <template #default="{ row }">
                        ¥{{ row.monthlyPrice?.toFixed(2) }}
                    </template>
                </el-table-column>
                <el-table-column label="年均费用" width="100">
                    <template #default="{ row }">
                        ¥{{ row.yearlyPrice?.toFixed(2) }}
                    </template>
                </el-table-column>
                <el-table-column prop="nextRenewalDate" label="下次续费" width="120" />
                <el-table-column label="剩余天数" width="90">
                    <template #default="{ row }">
                        <span :class="getDaysClass(row.daysUntilRenewal)">
                            {{ row.daysUntilRenewal }}天
                        </span>
                    </template>
                </el-table-column>
                <el-table-column prop="isActive" label="状态" width="80">
                    <template #default="{ row }">
                        <span :class="row.isActive ? 'status-tag status-active' : 'status-tag status-inactive'">
                            {{ row.isActive ? '有效' : '已取消' }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" size="small" link @click="goToEdit(row)">编辑</el-button>
                        <el-button type="success" size="small" link @click="handleRenew(row)">续费</el-button>
                        <el-button type="danger" size="small" link @click="handleDelete(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-empty v-if="filteredList.length === 0 && !loading" description="暂无订阅数据" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSubscriptions, getCategories, deleteSubscription, renewSubscription } from '../api'

const router = useRouter()
const loading = ref(false)
const subscriptions = ref([])
const categories = ref([])
const searchKeyword = ref('')
const categoryFilter = ref('')

const filteredList = computed(() => {
    return subscriptions.value.filter(item => {
        const matchKeyword = !searchKeyword.value ||
            item.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
        const matchCategory = !categoryFilter.value || item.category === categoryFilter.value
        return matchKeyword && matchCategory
    })
})

const loadData = async () => {
    loading.value = true
    try {
        subscriptions.value = await getSubscriptions()
        categories.value = await getCategories()
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

const goToAdd = () => {
    router.push('/subscriptions/add')
}

const goToEdit = (row) => {
    router.push(`/subscriptions/edit/${row.id}`)
}

const handleRenew = async (row) => {
    try {
        await ElMessageBox.confirm(
            `确认续费【${row.name}】？将更新下次续费日期。`,
            '续费确认',
            { type: 'warning' }
        )
        await renewSubscription(row.id)
        ElMessage.success('续费成功')
        loadData()
    } catch (e) {
        if (e !== 'cancel') console.error(e)
    }
}

const handleDelete = async (row) => {
    try {
        await ElMessageBox.confirm(
            `确定删除【${row.name}】吗？`,
            '删除确认',
            { type: 'error' }
        )
        await deleteSubscription(row.id)
        ElMessage.success('删除成功')
        loadData()
    } catch (e) {
        if (e !== 'cancel') console.error(e)
    }
}

const getCycleTypeLabel = (type) => {
    const labels = { MONTHLY: '月付', YEARLY: '年付', CUSTOM: '自定义' }
    return labels[type] || type
}

const getCycleTypeColor = (type) => {
    const colors = { MONTHLY: 'primary', YEARLY: 'success', CUSTOM: 'warning' }
    return colors[type] || 'info'
}

const getDaysClass = (days) => {
    if (days <= 3) return 'days-remaining days-urgent'
    if (days <= 7) return 'days-remaining days-warning'
    return 'days-remaining days-normal'
}

onMounted(loadData)
</script>

<style scoped>
.header-actions {
    display: flex;
    align-items: center;
}
</style>
