<template lang="pug">
div Das Bussi Fahrtenbuch
  YearSwitch
  span(v-html="errors.text").red
  Table(:selectedBookingsToRender="bookingsToRender", :konto="konto")
</template>
  
<script setup lang="ts">
import { useHauptbuchStore } from '../stores/hauptbuch'
import { usePeriodenStore } from '@/stores/perioden'
import { useAccountSystemStore } from '~/stores/accountSystem';
import { checkBookingSyntax } from '~/composables/checkBookingSyntax';
import logd from '../utils/logDebug';
import {  onMounted,  getCurrentInstance} from 'vue'
const hauptbuch = reactive(useHauptbuchStore())

const bStore = useAccountSystemStore()
await bStore.initAS()
const hauptbuchBookings = bStore.accountSystem?.hauptbuchBookings


const konto = "Hauptbuch"
const vueInstance = getCurrentInstance()
let errors = reactive({text: ""})

const bookingsToRender = computed(() => {
  if (!bStore.accountSystem) return []
  return filterBookingsByPeriod(bStore.accountSystem.hauptbuchBookings, usePeriodenStore().currentPeriod)
})

const filterBookingsByPeriod = (bookings: any[], period: string) :any[]  => {
  let r = bookings
  logd("filterBookingsByPeriod: period= ", period, " bookings.length= ", bookings.length, bookings[1])
  // period cound be "2024", "2024-Q1", "alles bis 2025", "alles bis 2024-Q3", "2024-Q2 bis 2024-Q4" etc.
  // if 'period' contains 'alles bis' then filter out all rows after the given date
  if (period && period.indexOf('bis') > 0) {
    const date = period.split('bis')[1].trim()
    r = bookings.filter((e: any) => e.date.substring(0, 4) <= date)
  } else if (isNaN(Number(period))) {    
    // ignore the selector and do not filter, i.e. take all values
  }else {
    r = bookings.filter((e: any) => e.date.substring(0, 4) === period)
  }
  return r
}

// check syntax of input file
if (hauptbuchBookings && hauptbuchBookings.length > 0) {
  for (let i = 0; i < hauptbuchBookings.length; i++) {
    const current = hauptbuchBookings[i];
    const previous = i > 0 ? hauptbuchBookings[i - 1] : current;
    
    errors.text += checkBookingSyntax(current, previous);
  }
}
</script>

<style>
  .red {
    background-color: orange;
  }
</style>

