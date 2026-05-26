<template>
  <div class="comment-page">
    <div class="page-header">
      <h2 class="page-title">评论管理</h2>
    </div>

    <el-card shadow="hover">
      <div class="filter-bar">
        <el-select v-model="statusFilter" placeholder="全部状态" clearable style="width: 140px" @change="loadComments">
          <el-option label="待审核" value="pending" />
          <el-option label="已通过" value="approved" />
          <el-option label="已拒绝" value="rejected" />
        </el-select>
      </div>

      <el-table v-loading="loading" :data="comments" stripe style="width: 100%">
        <el-table-column prop="articleTitle" label="文章" min-width="180" show-overflow-tooltip />
        <el-table-column prop="authorName" label="评论者" width="120" />
        <el-table-column prop="content" label="评论内容" min-width="300" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 'approved' ? 'success' : row.status === 'rejected' ? 'danger' : 'warning'"
              effect="light"
              size="small"
            >
              {{ row.status === 'approved' ? '已通过' : row.status === 'rejected' ? '已拒绝' : '待审核' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'pending'"
              size="small"
              type="success"
              @click="approveComment(row.id)"
            >通过</el-button>
            <el-button
              v-if="row.status === 'pending'"
              size="small"
              type="danger"
              @click="rejectComment(row.id)"
            >拒绝</el-button>
            <el-button
              size="small"
              @click="showReplyDialog(row)"
            >回复</el-button>
            <el-button size="small" type="danger" text @click="deleteComment(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="loadComments"
        />
      </div>
    </el-card>

    <el-dialog v-model="replyDialogVisible" title="回复评论" width="500px">
      <el-input
        v-model="replyContent"
        type="textarea"
        :rows="4"
        placeholder="请输入回复内容"
      />
      <template #footer>
        <el-button @click="replyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReply">发送回复</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { commentApi } from '../../api/comments';
import type { Comment, CommentStatus } from '../../../shared/types';

const comments = ref<(Comment & { articleTitle?: string })[]>([]);
const loading = ref(false);
const statusFilter = ref<CommentStatus | ''>('pending');
const currentPage = ref(1);
const pageSize = 20;
const total = ref(0);

const replyDialogVisible = ref(false);
const replyContent = ref('');
const replyId = ref<number | null>(null);

function formatDate(date: Date | string) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

async function loadComments() {
  loading.value = true;
  try {
    const result = await commentApi.getAll(
      statusFilter.value || undefined,
      currentPage.value,
      pageSize
    );
    comments.value = result.list;
    total.value = result.total;
  } catch (err: any) {
    ElMessage.error(err.message || '加载评论失败');
  } finally {
    loading.value = false;
  }
}

async function approveComment(id: number) {
  try {
    await commentApi.approve(id);
    ElMessage.success('审核通过');
    loadComments();
  } catch (err: any) {
    ElMessage.error(err.message || '操作失败');
  }
}

async function rejectComment(id: number) {
  try {
    await commentApi.reject(id);
    ElMessage.success('已拒绝');
    loadComments();
  } catch (err: any) {
    ElMessage.error(err.message || '操作失败');
  }
}

function showReplyDialog(row: Comment) {
  replyId.value = row.id;
  replyContent.value = '';
  replyDialogVisible.value = true;
}

async function submitReply() {
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容');
    return;
  }
  try {
    await commentApi.reply(replyId.value!, replyContent.value);
    ElMessage.success('回复成功');
    replyDialogVisible.value = false;
    loadComments();
  } catch (err: any) {
    ElMessage.error(err.message || '回复失败');
  }
}

async function deleteComment(row: Comment) {
  try {
    await ElMessageBox.confirm('确定删除该评论吗？', '提示', { type: 'warning' });
    await commentApi.delete(row.id);
    ElMessage.success('删除成功');
    loadComments();
  } catch (_) { /* cancelled */ }
}

onMounted(loadComments);
</script>

<style scoped>
.comment-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
