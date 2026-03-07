<template lang="pug">
div
  Table(:selectedBookingsToRender="accounts")

  Table(:selectedBookingsToRender="asAccounts")
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAccountsStore } from '../stores/accounts'
import { useAccountSystemStore } from '../stores/accountSystem'

const aStore = useAccountsStore()
const bStore = useAccountSystemStore()

if (!bStore.accountSystem) {

  // Daten parallel laden (effizienter als nacheinander)
  await Promise.all([
    aStore.loadDataFromGoogle(),
    bStore.initAS()
  ])
}

// Reaktiver Zugriff auf die Accounts im System
// Falls bStore.accountSystem sich ändert, aktualisiert sich die Table automatisch
const accounts = computed(() =>  aStore.sortedAccounts ?? [])  
const asAccounts = computed(() => 
{
  // I would like to return an array of accounts with the number of bookings in that account,
  const accounts = bStore.accountSystem?.accounts ?? []
  return accounts.map(account => {
    return {
      id: account.id,
      name: account.name,
      owner: account.owner,
      bookingCount: account.bookings.length
    }
  })
})

// Debugging (optional)
console.log("DGT-Central: Accounts system ready", asAccounts.value)
</script>


