<template lang="pug">
form#my-global
  span Welches Jahr  möchtest du sehen?
    select(v-model="selectedyear",@change="changeFinancialYear()")
      option(v-for="p in years" ) {{p}}
</template>
  
<script setup lang="ts">
import { usePeriodenStore } from '@/stores/perioden'
import {watch,onMounted} from 'vue'
import logd from '../mixins/logDebug';
const periods = usePeriodenStore()
await periods.loadDataFromGoogle()
const years = periods.listOfPeriods
let selectedyear = periods.currentPeriod

const changeFinancialYear = () => {
  periods.setPeriod(selectedyear)
}

</script>
  