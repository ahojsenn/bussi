<template lang="pug">
div
  h1 stakeholder of {{ stakeholderStore.getGesellschaft }}
  div Gesellschafter {{ stakeholderStore.getGesellschafter }}
  div Stakeholder {{ stakeholderStore.getStakeholder }} 
  Table(:selectedBookingsToRender="stakeholderStore.stakeholder")
</template>

<script setup lang="ts">
import logd from '../utils/logDebug'
import { useStakeholderStore } from '~/stores/stakeholder'

const stakeholderStore = useStakeholderStore()

// Top-Level Await für die Initialisierung
await stakeholderStore.stakeholder


logd("stakeholder.vue: Data ready for render", stakeholderStore.stakeholder)
</script>