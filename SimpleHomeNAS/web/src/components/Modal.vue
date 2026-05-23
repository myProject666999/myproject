<template>
  <div class="modal-mask" @click.self="$emit('close')">
    <div class="modal">
      <header class="modal-header">
        <h3>{{ title }}</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </header>
      <div class="modal-body">
        <slot />
      </div>
      <footer class="modal-footer">
        <button class="btn" @click="$emit('close')">取消</button>
        <button class="btn btn-primary" @click="$emit('confirm')">确认</button>
      </footer>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' }
})
defineEmits(['close', 'confirm'])
</script>

<style scoped>
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, .45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.modal {
  background: #fff;
  border-radius: 8px;
  width: 420px;
  max-width: 90vw;
  box-shadow: 0 8px 30px rgba(0,0,0,.2);
  overflow: hidden;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid #ecf0f1;
}
.modal-header h3 { font-size: 16px; }
.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #7f8c8d;
  cursor: pointer;
}
.modal-body {
  padding: 18px;
  min-height: 60px;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 18px;
  border-top: 1px solid #ecf0f1;
}
.btn {
  padding: 6px 14px;
  background: #ecf0f1;
  border: 1px solid #dfe6e9;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
}
.btn-primary { background: #3498db; color: #fff; border-color: #3498db; }
</style>
