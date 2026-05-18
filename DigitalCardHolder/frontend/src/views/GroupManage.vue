<template>
  <div class="group-manage">
    <van-nav-bar title="分组管理" left-arrow @click-left="$router.back()">
      <template #right>
        <van-icon name="plus" size="20" @click="showAddDialog = true" />
      </template>
    </van-nav-bar>

    <van-cell-group inset>
      <van-cell
        v-for="group in groups"
        :key="group.id"
        :title="group.name"
        is-link
        editable
        @click="editGroup(group)"
      >
        <template #right-icon>
          <van-icon name="delete-o" size="18" @click.stop="onDelete(group.id)" />
        </template>
      </van-cell>
    </van-cell-group>

    <van-dialog
      v-model:show="showAddDialog"
      :title="editingGroup ? '编辑分组' : '新建分组'"
      show-cancel-button
      @confirm="onConfirm"
    >
      <van-field
        v-model="groupName"
        placeholder="请输入分组名称"
        style="padding: 16px"
      />
    </van-dialog>

    <van-tabbar v-model:active="active">
      <van-tabbar-item icon="friends-o" to="/">名片夹</van-tabbar-item>
      <van-tabbar-item icon="search" to="/search">搜索</van-tabbar-item>
      <van-tabbar-item icon="scan" to="/scan">扫描</van-tabbar-item>
      <van-tabbar-item icon="apps-o" to="/groups">分组</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { getGroups, saveGroup, updateGroup, deleteGroup } from '@/api'
import { showToast, showConfirmDialog } from 'vant'

export default {
  name: 'GroupManage',
  setup() {
    const groups = ref([])
    const active = ref(3)
    const showAddDialog = ref(false)
    const groupName = ref('')
    const editingGroup = ref(null)

    const loadGroups = async () => {
      try {
        groups.value = await getGroups()
      } catch (e) {
        showToast('加载失败')
      }
    }

    const editGroup = (group) => {
      editingGroup.value = group
      groupName.value = group.name
      showAddDialog.value = true
    }

    const onConfirm = async () => {
      if (!groupName.value.trim()) {
        showToast('请输入分组名称')
        return
      }
      try {
        if (editingGroup.value) {
          await updateGroup({
            id: editingGroup.value.id,
            name: groupName.value
          })
          showToast('修改成功')
        } else {
          await saveGroup({
            name: groupName.value,
            sortOrder: groups.value.length + 1
          })
          showToast('创建成功')
        }
        showAddDialog.value = false
        groupName.value = ''
        editingGroup.value = null
        loadGroups()
      } catch (e) {
        showToast('操作失败')
      }
    }

    const onDelete = async (id) => {
      try {
        await showConfirmDialog({
          title: '确认删除',
          message: '删除分组后，该分组下的名片将移至默认分组，确定删除吗？'
        })
        await deleteGroup(id)
        showToast('删除成功')
        loadGroups()
      } catch (e) {
        if (e !== 'cancel') {
          showToast('删除失败')
        }
      }
    }

    onMounted(() => {
      loadGroups()
    })

    return {
      groups,
      active,
      showAddDialog,
      groupName,
      editingGroup,
      editGroup,
      onConfirm,
      onDelete
    }
  }
}
</script>

<style lang="scss" scoped>
.group-manage {
  padding-bottom: 50px;
  padding-top: 10px;
}
</style>
