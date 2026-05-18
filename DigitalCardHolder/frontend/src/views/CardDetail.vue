<template>
  <div class="card-detail">
    <van-nav-bar :title="card?.name || '名片详情'" left-arrow @click-left="$router.back()">
      <template #right>
        <van-icon name="edit" size="18" @click="goToEdit" />
      </template>
    </van-nav-bar>

    <div v-if="card" class="card-content">
      <van-cell-group inset>
        <van-cell title="姓名" :value="card.name" />
        <van-cell v-if="card.title" title="职位" :value="card.title" />
        <van-cell v-if="card.company" title="公司" :value="card.company" />
        <van-cell v-if="card.department" title="部门" :value="card.department" />
        <van-cell v-if="card.mobile" title="手机" :value="card.mobile">
          <template #right-icon>
            <van-icon name="phone-o" size="18" @click="callPhone(card.mobile)" />
          </template>
        </van-cell>
        <van-cell v-if="card.phone" title="电话" :value="card.phone">
          <template #right-icon>
            <van-icon name="phone-o" size="18" @click="callPhone(card.phone)" />
          </template>
        </van-cell>
        <van-cell v-if="card.email" title="邮箱" :value="card.email">
          <template #right-icon>
            <van-icon name="envelope-o" size="18" @click="sendEmail(card.email)" />
          </template>
        </van-cell>
        <van-cell v-if="card.website" title="网站" :value="card.website" is-link @click="openWebsite(card.website)" />
        <van-cell v-if="card.address" title="地址" :value="card.address" />
        <van-cell v-if="card.wechat" title="微信" :value="card.wechat" />
        <van-cell v-if="card.qq" title="QQ" :value="card.qq" />
        <van-cell v-if="card.remark" title="备注" :value="card.remark" />
      </van-cell-group>

      <div class="action-area">
        <van-button block type="primary" @click="exportVCard">导出 vCard</van-button>
        <van-button block style="margin-top: 10px" type="warning" @click="toggleFavorite">
          {{ card.isFavorite ? '取消收藏' : '收藏' }}
        </van-button>
        <van-button block style="margin-top: 10px" type="danger" @click="onDelete">删除</van-button>
      </div>
    </div>

    <van-loading v-else class="loading">加载中...</van-loading>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getCard, deleteCard, toggleFavorite, exportVCard as exportCard } from '@/api'
import { showToast, showConfirmDialog } from 'vant'

export default {
  name: 'CardDetail',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const card = ref(null)

    const loadCard = async () => {
      try {
        card.value = await getCard(route.params.id)
      } catch (e) {
        showToast('加载失败')
      }
    }

    const goToEdit = () => {
      router.push(`/card/edit/${card.value.id}`)
    }

    const callPhone = (phone) => {
      window.location.href = `tel:${phone}`
    }

    const sendEmail = (email) => {
      window.location.href = `mailto:${email}`
    }

    const openWebsite = (website) => {
      window.open(website, '_blank')
    }

    const toggleFavoriteStatus = async () => {
      try {
        await toggleFavorite(card.value.id)
        card.value.isFavorite = !card.value.isFavorite
        showToast(card.value.isFavorite ? '已收藏' : '已取消收藏')
      } catch (e) {
        showToast('操作失败')
      }
    }

    const exportVCard = () => {
      exportCard(card.value.id)
    }

    const onDelete = async () => {
      try {
        await showConfirmDialog({
          title: '确认删除',
          message: '确定要删除这张名片吗？'
        })
        await deleteCard(card.value.id)
        showToast('删除成功')
        setTimeout(() => {
          router.back()
        }, 1000)
      } catch (e) {
        if (e !== 'cancel') {
          showToast('删除失败')
        }
      }
    }

    onMounted(() => {
      loadCard()
    })

    return {
      card,
      goToEdit,
      callPhone,
      sendEmail,
      openWebsite,
      toggleFavorite: toggleFavoriteStatus,
      exportVCard,
      onDelete
    }
  }
}
</script>

<style lang="scss" scoped>
.card-detail {
  padding-bottom: 20px;
}

.action-area {
  padding: 16px;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 40px;
}
</style>
