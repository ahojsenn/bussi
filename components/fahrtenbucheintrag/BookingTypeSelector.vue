<template lang="pug">
div
  button.vorgang( :class="{'hilight': modelValue=='Fahrt'}" @click="$emit('update:modelValue', 'Fahrt')" type="button") Fahrt
  button.vorgang( :class="{'hilight': modelValue=='Tanken'}" @click="$emit('update:modelValue', 'Tanken')" type="button") Tanken
  button.vorgang( :class="{'hilight': modelValue=='Sonstiges'}" @click="$emit('update:modelValue', 'Sonstiges')" type="button") Sonstiges
</template>

<script setup lang="ts">
import type { BookingType } from '~/composables/useBookingForm'

defineProps<{
  modelValue: BookingType
}>()

defineEmits<{
  'update:modelValue': [value: BookingType]
}>()
</script>

<style scoped src="../../pages/fahrtenbucheintrag/styles.css"></style>
