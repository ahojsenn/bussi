<template lang="pug">
div accounts
  Table(:selectedBookingsToRender="aStore.accounts")
  div {{ accountNames }}
  div {{ stakeholderNames }}
  Table(:selectedBookingsToRender="as.accounts")
</template>

<script setup lang="ts">
import { useStakeholderStore } from '../stores/stakeholder';
import { useAccountsStore } from '../stores/accounts'
import logd from '../mixins/logDebug'
import { BussiAccountSystem } from '../mixins/types';

const aStore = useAccountsStore()
await aStore.loadDataFromGoogle()
const accountNames = aStore.accountNames


const shStore = useStakeholderStore()
await shStore.loadStakeholder()
const stakeholderNames = shStore.stakeholderListe

const as = new BussiAccountSystem(stakeholderNames, accountNames)
</script>


