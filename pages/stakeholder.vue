<template lang="pug">
div
  h1 stakeholder 
  Table(:selectedBookingsToRender="accountSystemStore.accountSystem.stakeholder")
</template>

<script setup lang="ts">
import logd from '../utils/logDebug'
import { useAccountSystemStore } from '~/stores/accountSystem'

const accountSystemStore = useAccountSystemStore()
await accountSystemStore.initAS()
logd("accounts: accountSystemStore loaded: ", accountSystemStore)
</script>