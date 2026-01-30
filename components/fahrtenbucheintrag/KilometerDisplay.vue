<template lang="pug">
div
  div.changebar
    div.kmbox(v-for="i in [0,1,2,3]") 
      button.changekm(style="background-color: rgba(0,0,0,0.1)" disabled)
    div.kmbox(v-for="i in [3,4,5]")
      button.changekm(type="button" @click="$emit('increment', i)") +

  div.kmdisplay 
    div.kmbox(style="overflow: auto") {{ kmDriven }} km
    div.kmbox(v-for="(digit, i) in digits" :key="i")
      button.km(disabled) {{ digit }}

  div.changebar
    div.kmbox(v-for="i in [0,1,2,3]") 
      button.changekm(style="background-color: rgba(0,0,0,0.1)" disabled) 
    div.kmbox(v-for="i in [3,4,5]")
      button.changekm(type="button" @click="$emit('decrement', i)") -

  br
  div
    span(v-if="showWarning" class="error") Ist das nicht ein bisschen viel? Tanken Eintragung vergessen?
</template>

<script setup lang="ts">
defineProps<{
  digits: number[]
  kmDriven: number
  showWarning: boolean
}>()

defineEmits<{
  increment: [index: number]
  decrement: [index: number]
}>()
</script>

<style scoped src="../../pages/fahrtenbucheintrag/styles.css"></style>
