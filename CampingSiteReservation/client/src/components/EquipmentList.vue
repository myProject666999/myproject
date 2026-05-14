<template>
  <div class="equipment-list">
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多装备了"
      @load="onLoad"
    >
      <van-card
        v-for="item in equipments"
        :key="item.id"
        :title="item.name"
        :desc="item.description"
        :price="item.price"
        :thumb="getThumb(item)"
      >
        <template #footer>
          <div class="card-footer">
            <span class="stock">库存: {{ item.stock }}</span>
            <van-button size="mini" type="primary" @click="$emit('add', item)">
              添加
            </van-button>
          </div>
        </template>
      </van-card>
    </van-list>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  equipments: {
    type: Array,
    default: () => []
  }
})

defineEmits(['add'])

const loading = ref(false)
const finished = ref(true)

const onLoad = () => {
  loading.value = false
}

const getThumb = (item) => {
  if (item.category === 'tent') {
    return 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=camping%20tent%20equipment&image_size=square'
  }
  if (item.category === 'chair') {
    return 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=camping%20foldable%20table%20chair&image_size=square'
  }
  return 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=camping%20accessories%20gear&image_size=square'
}
</script>

<style scoped>
.equipment-list {
  padding: 8px;
}

:deep(.van-card) {
  margin-bottom: 12px;
  border-radius: 12px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.stock {
  font-size: 12px;
  color: #969799;
}
</style>
