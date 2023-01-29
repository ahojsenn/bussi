
<template lang="pug">
div(style="width: 90%   ") Das Bussi Fahrtenbuch
  Table(:selectedBookingsToRender="hauptbuch.bookings", :konto="konto")
</template>
  
<script setup lang="ts">
import { useHauptbuchStore } from '../stores/hauptbuch'
import { useBuchungenStore } from '../stores/buchungen'
import logd from '../mixins/logDebug';

const hauptbuch = useHauptbuchStore()
const konto = "Bussi"
await hauptbuch.loadBussiData()
// logd("hauptbuch: hauptbuch loaded: ", hauptbuch, hauptbuch.url)
</script>

