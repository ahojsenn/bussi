<template lang="pug">
div stakeholder
  Table(:selectedBookingsToRender="kstore.stakeholder")
</template>

<script setup lang="ts">
import { useStakeholderStore } from '../stores/stakeholder'
import logd from '../mixins/logDebug'

const kstore = useStakeholderStore()
await kstore.loadStakeholder()
logd("accounts: kstore loaded: ", kstore) 
</script>


