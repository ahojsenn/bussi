<template lang="pug">
div.popup-overlay(v-if="modelValue.show" @click.self="close")
  div.popup
    button.close-btn(@click="close") ×
    h2 Status
    p {{ modelValue.text }}
    button(@click="close") Schließen
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const close = () => {
  emit('update:modelValue', { ...props.modelValue, show: false })
}
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.popup {
  background: white;
  padding: 20px;
  border-radius: 8px;
  min-width: 300px;
  position: relative;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
}
button {
  font-size: 1.3em;
}
</style>
