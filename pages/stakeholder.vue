<template lang="pug">
div
  h1 stakeholder 
  Table(:selectedBookingsToRender="stakeholderStore.stakeholder")
</template>

<script setup lang="ts">
import { computed } from 'vue'
import logd from '../utils/logDebug'
import { useStakeholderStore } from '~/stores/stakeholder'

const stakeholderStore = useStakeholderStore()

// Top-Level Await für die Initialisierung
await stakeholderStore.stakeholder


logd("stakeholder.vue: Data ready for render", stakeholderStore.stakeholder)
</script>