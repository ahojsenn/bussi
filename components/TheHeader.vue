<template lang="pug">
div
  h2 test omponent by Hannes {{ counter.count }}
  button(v-on:click="counter.decrement") minus1
  button(v-on:click="counter.increment") plus1
</template>

<script setup lang="ts">
import { useCounterStore } from '@/stores/counter'
import {watch} from 'vue'
const counter = useCounterStore()

watch(counter, () => {
  console.log('counter changed', counter)
})
</script>
