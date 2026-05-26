<script setup lang="ts">
import { computed } from 'vue'
import type { Message } from '@/types'
import { MessageType } from '@/types'

const props = defineProps<{
  message: Message
  isSelf: boolean
}>()

const formattedTime = computed(() => {
  const date = new Date(props.message.created_at)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
})

const isImage = computed(() => props.message.message_type === MessageType.Image)

const handleImageClick = () => {
  if (props.message.image_url) {
    window.open(props.message.image_url, '_blank')
  }
}
</script>

<template>
  <div class="flex mb-3" :class="isSelf ? 'justify-end' : 'justify-start'">
    <div class="max-w-[70%]" :class="isSelf ? 'order-2' : 'order-1'">
      <div class="flex items-center gap-2 mb-1" :class="isSelf ? 'justify-end' : 'justify-start'">
        <span class="text-xs text-gray-500 font-medium">{{ message.nickname }}</span>
        <span class="text-xs text-gray-400">{{ formattedTime }}</span>
      </div>
      <div
        class="px-4 py-2 rounded-2xl shadow-sm"
        :class="[
          isSelf
            ? 'bg-blue-500 text-white rounded-br-sm'
            : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100',
          isImage ? 'p-1' : '',
        ]"
      >
        <template v-if="isImage && message.image_url">
          <img
            :src="message.image_url"
            alt="Shared image"
            class="rounded-xl max-w-full max-h-64 object-contain cursor-pointer hover:opacity-90 transition-opacity"
            @click="handleImageClick"
          />
        </template>
        <template v-else>
          <p class="whitespace-pre-wrap break-words">{{ message.content }}</p>
        </template>
      </div>
    </div>
  </div>
</template>
