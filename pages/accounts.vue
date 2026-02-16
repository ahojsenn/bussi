<template lang="pug">
div accounts
  Table(:selectedBookingsToRender="aStore.accounts")

  Table(:selectedBookingsToRender="as.accounts")
</template>

<script setup lang="ts">
import { useStakeholderStore } from '../stores/stakeholder';
import { useAccountsStore } from '../stores/accounts'
import { useAccountSystemStore } from '../stores/accountSystem';
import { useHauptbuchStore } from '../stores/hauptbuch';

const aStore = useAccountsStore()
await aStore.loadDataFromGoogle()
const accountNames = aStore.accountNames

const bStore = useAccountSystemStore()
await bStore.initAS()
const as = bStore.accountSystem 

</script>


