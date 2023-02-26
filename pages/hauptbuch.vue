<template lang="pug">
div Das Bussi Fahrtenbuch
  Table(:selectedBookingsToRender="hauptbuch.bookings", :konto="konto")
</template>
  
<script setup lang="ts">
import Table from '../components/Table.vue'
import { useHauptbuchStore } from '../stores/hauptbuch'
import {  onMounted,  getCurrentInstance} from 'vue'
const hauptbuch = reactive(useHauptbuchStore())
const konto = "Hauptbuch"
const vueInstance = getCurrentInstance()

const loadHauptbuch = async () => {
  await hauptbuch.loadBussiData()
  if (vueInstance && vueInstance.proxy) await vueInstance.proxy.$forceUpdate()
}
onMounted(async () => await loadHauptbuch())
</script>

