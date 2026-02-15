<template lang="pug">
form#my-global
  span Welches Jahr  möchtest du sehen?
    select(v-model="selectedyear",@change="changeFinancialYear()")
      option(v-for="p in years" ) {{p}}
</template>
  
<script setup lang="ts">
import { usePeriodenStore } from '@/stores/perioden'
import logd from '../utils/logDebug';
const periods = usePeriodenStore()
await periods.loadDataFromGoogle()
const years = periods.listOfPeriods
let selectedyear = periods.currentPeriod

const changeFinancialYear = () => {
  logd('\n\n\nchangeFinancialYear', selectedyear)
  periods.setPeriod(selectedyear)
}

</script>
  