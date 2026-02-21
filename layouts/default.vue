<template lang="pug">
  div
    // Der Spinner reagiert auf den globalen Loading-State
    LoadingSpinner(  :active="bStore.isLoading" message="Lade Daten..." )

  div.background
    div.foreground
      navigation
      slot 
</template>

<script setup lang="ts">
import { useAccountSystemStore } from '~/stores/accountSystem'
import { watch } from 'vue'
import { useRoute } from 'vue-router'
const bStore = useAccountSystemStore()
const route = useRoute()

// Watch for URL changes
watch(() => route.path, (newPath, oldPath) => {
  // clear console on route change
  console.clear()
  logdResetStarttime()
  logd(`Route changed from ${oldPath} to ${newPath}`)
})

// Falls der Store beim ersten Laden direkt triggern soll:
onMounted(() => {
  logd("Default Layout Mounted")
  if (!bStore.accountSystem) {
    bStore.initAS()
  }
  logd("Default Layout Mounted and Store Initialized")
})

</script>

<style>
@font-face {
 font-family: 'supermarker'; /* Gewünschter Name */
 src:  url('/fonts/SupermarkerVARTrial.woff2') format('woff2'), /* SupermarkerVARTrial.woff2 oder SupermarkerVARTrial.ttf */
       url('/fonts/SupermarkerVARTrial.woff') format('woff'), /* SupermarkerVARTrial.woff oder SupermarkerVARTrial.ttf */
       url('/fonts/SupermarkerVARTrial.ttf') format('truetype'); /* SupermarkerVARTrial.ttf */

  /* background black */
  background-color: #000;
}
select, option,input, form {
  font: 14px "supermarker";
}
body {
  font: 14px "supermarker";
}
.background {
  /* ich hätte gern ein Prilblumenmuster */
  /* Hintergrundbild mit Transparenz und einem Abrolleffekt */
  background-color: #c1b5f9;
  background-image: url('/prilblumen.png');
  border-radius: 30px;
  height: max-content;
  width: 100%;
  font-family: "supermarker";

}
.foreground {
  background-color: rgba(255, 255, 255, 0.5);
  /* ich hätte gern rude ecken am div */
  border-radius: 30px;
  padding: 20px;
}

table {
  background-color:  rgba(193, 181, 249,0.8); 
  border-radius: 6px;
}
tr:nth-of-type(odd) {
      background: rgba(166, 149, 241, 0.8); 
    }
td{
  vertical-align: top;
  border-radius: 6px;
}
th {
  text-align: left;
}
</style>