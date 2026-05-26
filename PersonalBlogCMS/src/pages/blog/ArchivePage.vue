<template>
  <div class="archive-page">
    <h1 class="page-title">文章归档</h1>

    <div v-loading="loading" class="archive-content">
      <div v-for="item in groupedArchive" :key="item.year" class="year-section">
        <h2 class="year-title">
          <el-icon><Document /></el-icon>
          {{ item.year }} 年
          <span class="year-count">{{ item.total }} 篇</span>
        </h2>
        <ul class="month-list">
          <li v-for="month in item.months" :key="month.month" class="month-item">
            <span class="month-label">{{ item.year }}-{{ String(month.month).padStart(2, '0') }}</span>
            <span class="month-count">{{ month.count }} 篇</span>
          </li>
        </ul>
      </div>
      <el-empty v-if="!loading && groupedArchive.length === 0" description="暂无归档" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { articleApi } from '../../api/articles';

const archive = ref<{ year: number; month: number; count: number }[]>([]);
const loading = ref(false);

const groupedArchive = computed(() => {
  const map = new Map<number, { total: number; months: { month: number; count: number }[] }>();
  for (const item of archive.value) {
    if (!map.has(item.year)) {
      map.set(item.year, { total: 0, months: [] });
    }
    const group = map.get(item.year)!;
    group.total += item.count;
    group.months.push({ month: item.month, count: item.count });
  }
  return Array.from(map.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([year, data]) => ({ year, ...data }));
});

async function loadArchive() {
  loading.value = true;
  try {
    archive.value = await articleApi.getArchive();
  } catch (err: any) {
    ElMessage.error(err.message || '加载归档失败');
  } finally {
    loading.value = false;
  }
}

onMounted(loadArchive);
</script>

<style scoped>
.archive-page {
  background: #fff;
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.page-title {
  margin: 0 0 24px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  padding-bottom: 16px;
  border-bottom: 2px solid #10b981;
  display: inline-block;
}

.archive-content {
  min-height: 200px;
}

.year-section {
  margin-bottom: 32px;
}

.year-section:last-child {
  margin-bottom: 0;
}

.year-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
}

.year-count {
  font-size: 14px;
  font-weight: normal;
  color: #94a3b8;
}

.month-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.month-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: #f8fafc;
  border-radius: 6px;
  margin-bottom: 8px;
  transition: background 0.2s;
}

.month-item:hover {
  background: #f1f5f9;
}

.month-label {
  color: #475569;
  font-size: 14px;
}

.month-count {
  color: #10b981;
  font-size: 13px;
  font-weight: 500;
}
</style>
