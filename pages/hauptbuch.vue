<template lang="pug">
div Das Bussi Fahrtenbuch
  YearSwitch
  span(v-html="errors.text").red
  Table(:selectedBookingsToRender="hauptbuch.bookings", :konto="konto")
</template>
  
<script setup lang="ts">
import { useHauptbuchStore } from '../stores/hauptbuch'
import { usePeriodenStore } from '@/stores/perioden'
import { checkBookingSyntax } from '~/composables/checkBookingSyntax';
import logd from '../utils/logDebug';
import {  onMounted,  getCurrentInstance} from 'vue'
const hauptbuch = reactive(useHauptbuchStore())
const konto = "Hauptbuch"
const vueInstance = getCurrentInstance()
let errors = reactive({text: ""})
  
const loadHauptbuch = async () => {
  await hauptbuch.loadBussiData()
  //  hier könnte ich noch einen Filter auf doe in YearSwitch gewählte Periode machen
  if (vueInstance && vueInstance.proxy) await vueInstance.proxy.$forceUpdate()
}
onMounted(async () => await loadHauptbuch())

watch(
  // reload the whole dammned thing
  usePeriodenStore().$state , async (previous, current) => {
    await hauptbuch.loadBussiData(usePeriodenStore().currentPeriod)
    if (vueInstance && vueInstance.proxy) vueInstance.proxy.$forceUpdate()
    logd("watch: bs after reload, allBookingsOfPeriod.lenght= ", hauptbuch.bookings.length)
})

// check syntax of input file
let lastBooking = hauptbuch.bookings[0];
for (const booking of hauptbuch.bookings) {
  errors.text += checkBookingSyntax(booking, lastBooking)
  Object.assign(lastBooking, booking)
}

</script>

<style>
  .red {
    background-color: orange;
  }
</style>

