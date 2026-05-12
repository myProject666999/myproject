<template>
  <div class="page-container">
    <van-nav-bar title="选择阿姨" left-arrow @click-left="router.back()" />

    <van-search v-model="keyword" placeholder="搜索阿姨名称或技能" @search="onSearch" />

    <van-loading v-if="loading" style="text-align: center; padding: 30px" />

    <div v-else class="worker-list">
      <div
        v-for="w in workers"
        :key="w.id"
        class="worker-card"
        @click="router.push(`/workers/${w.id}`)"
      >
        <div class="worker-avatar">
          <van-icon name="user-o" size="36" />
        </div>
        <div class="worker-info">
          <div class="worker-name">
            {{ w.realName }}
            <van-rate v-model="w.rating" readonly size="14" color="#ffd21e" />
            <span class="rating">{{ w.rating }}</span>
          </div>
          <div class="worker-tags">
            <van-tag v-for="tag in (w.skillTags?.split(',') || []).slice(0, 3)" :key="tag" size="mini" type="primary">
              {{ tag }}
            </van-tag>
          </div>
          <div class="worker-meta text-secondary">
            从业{{ w.experience }}年 · 完成{{ w.orderCount }}单
          </div>
        </div>
        <van-icon name="arrow" color="#ccc" />
      </div>

      <van-empty v-if="workers.length === 0" description="暂无阿姨" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { workers as workersApi } from '@/api';

const router = useRouter();
const keyword = ref('');
const workers = ref([]);
const loading = ref(false);

async function loadWorkers() {
  loading.value = true;
  try {
    const params = { pageSize: 50 };
    if (keyword.value) {
      params.keyword = keyword.value;
    }
    const res = await workersApi.list(params);
    workers.value = res.data?.list || [];
  } catch (e) {
  } finally {
    loading.value = false;
  }
}

function onSearch() {
  loadWorkers();
}

onMounted(() => {
  loadWorkers();
});
</script>

<style scoped>
.worker-list {
  padding: 12px 0;
}

.worker-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.worker-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #e8f5e9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.worker-info {
  flex: 1;
}

.worker-name {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 16px;
}

.rating {
  font-size: 12px;
  color: #ff976a;
}

.worker-tags {
  margin-bottom: 4px;
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.worker-meta {
  font-size: 12px;
}
</style>
