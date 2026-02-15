<template lang="pug">
div accounts
  Table(:selectedBookingsToRender="aStore.accounts")
  div {{ accountNames }}
  div {{ shStore.stakeholderListe }}
  div {{ as.accounts }} lkjlk
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

const shStore = useStakeholderStore()
await shStore.loadStakeholder()

const hauptbuchStore = useHauptbuchStore()
await hauptbuchStore.loadHauptbuch()
const hauptbuch = hauptbuchStore.hauptbuch


const bStore = useAccountSystemStore()
//const accountSystem = await bStore.accountSystem()
await bStore.initAS()
const as = bStore.accountSystem 

// const as = new accountSystem(stakeholderNames, accountNames)
</script>


