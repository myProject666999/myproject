<template>
  <div>
    <div class="page-header flex-between">
      <h2>课程管理</h2>
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon>
        添加课程
      </el-button>
    </div>

    <el-card>
      <el-table :data="courses" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="课程名称" min-width="150" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="level" label="难度">
          <template #default="{ row }">
            <el-tag>{{ row.level || '初级' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="teacher" label="讲师" width="100" />
        <el-table-column prop="duration" label="时长">
          <template #default="{ row }">
            {{ row.duration }}分钟
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格">
          <template #default="{ row }">
            {{ row.price > 0 ? '¥' + row.price : '免费' }}
          </template>
        </el-table-column>
        <el-table-column prop="view_count" label="学习人数" width="100" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEditDialog(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="loadData"
        @current-change="loadData"
        class="mt-20"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑课程' : '添加课程'" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="课程名称">
          <el-input v-model="form.title" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.category" placeholder="请选择" style="width: 100%">
            <el-option label="新生儿护理" value="新生儿护理" />
            <el-option label="产妇护理" value="产妇护理" />
            <el-option label="营养配餐" value="营养配餐" />
            <el-option label="早期教育" value="早期教育" />
          </el-select>
        </el-form-item>
        <el-form-item label="难度">
          <el-select v-model="form.level" placeholder="请选择" style="width: 100%">
            <el-option label="初级" value="初级" />
            <el-option label="中级" value="中级" />
            <el-option label="高级" value="高级" />
          </el-select>
        </el-form-item>
        <el-form-item label="讲师">
          <el-input v-model="form.teacher" placeholder="讲师姓名" />
        </el-form-item>
        <el-form-item label="时长 (分钟)">
          <el-input-number v-model="form.duration" :min="1" />
        </el-form-item>
        <el-form-item label="价格 (元)">
          <el-input-number v-model="form.price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="课程简介">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入课程简介" />
        </el-form-item>
        <el-form-item label="视频链接">
          <el-input v-model="form.video_url" placeholder="视频地址" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCourses, createCourse, updateCourse, deleteCourse } from '@/api'

const courses = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentCourse = ref(null)

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  title: '',
  category: '新生儿护理',
  level: '初级',
  teacher: '',
  duration: 60,
  price: 0,
  description: '',
  video_url: '',
  status: 'active'
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getCourses({
      page: pagination.page,
      page_size: pagination.pageSize
    })
    courses.value = res.data.list
    pagination.total = res.data.total
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const openAddDialog = () => {
  isEdit.value = false
  Object.assign(form, {
    title: '',
    category: '新生儿护理',
    level: '初级',
    teacher: '',
    duration: 60,
    price: 0,
    description: '',
    video_url: '',
    status: 'active'
  })
  dialogVisible.value = true
}

const openEditDialog = (course) => {
  isEdit.value = true
  currentCourse.value = course
  Object.assign(form, {
    title: course.title,
    category: course.category,
    level: course.level,
    teacher: course.teacher,
    duration: course.duration,
    price: course.price,
    description: course.description,
    video_url: course.video_url,
    status: course.status
  })
  dialogVisible.value = true
}

const submitForm = async () => {
  try {
    if (isEdit.value) {
      await updateCourse(currentCourse.value.id, form)
      ElMessage.success('更新成功')
    } else {
      await createCourse(form)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (error) {
    console.error(error)
  }
}

const handleDelete = async (course) => {
  try {
    await ElMessageBox.confirm('确定要删除该课程吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteCourse(course.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

onMounted(loadData)
</script>
