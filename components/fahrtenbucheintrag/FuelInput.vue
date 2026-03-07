<template lang="pug">
div.pump
  div.pump-display-container
    input(
      :class="{'gas-pump-input-red': !isValid(amount), 'gas-pump-input': true}" 
      type="number" 
      step="0.01"
      pattern="[0-9]+([.][0-9]+)?"
      inputmode="decimal"
      value="€"
      placeholder="Euro" 
      v-model="amount" 
      spellcheck="false"
      onfocus="this.select()"
    )
    br
    span.pump-label Price to pay €
    br
    span.pump-label nachtrag?
    input(type="checkbox" name="nachtrag?" placeholder="" v-model="nachtrag" style="color: red")
  
  div.pump-display-container(v-if="showLiterInput")
    input(
      :class="{'gas-pump-input-red': !isValid(liters), 'gas-pump-input': true}" 
      type="number" 
      step="0.01"
      pattern="[0-9]+([.][0-9]+)?"
      inputmode="decimal"
      value="0.00"
      placeholder="Litres" 
      v-model="liters" 
      spellcheck="false"
      onfocus="this.select()"
    )
    br
    span.pump-label Litres
    br
    span.pump-label vollgetankt?
    input(type="checkbox" name="vollgetankt?" placeholder="" v-model="vollgetankt" style="color: red") 

  span.pump-display-container(v-if="showDescription")
    textarea.description( 
      :class="{'red': description==''}" 
      type="text" 
      name="description" 
      placeholder="description, what did you purchase?" 
      v-model="description" 
      required
    )
</template>

<script setup lang="ts">
const amount = defineModel<string>('amount', { required: true })
const liters = defineModel<string>('liters', { required: true })
const vollgetankt = defineModel<boolean>('vollgetankt')
const description = defineModel<string>('description', { required: true })
const nachtrag = defineModel<boolean>('nachtrag')

defineProps<{
  showLiterInput: boolean
  showDescription: boolean
  isValid: (value: any) => boolean
}>()
</script>

<style scoped src="../../pages/fahrtenbucheintrag/styles.css"></style>
