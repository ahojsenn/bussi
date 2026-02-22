<template lang="pug">
form.disable-dbl-tap-zoom.block(@submit.prevent="onSubmit" ) 
  h3.red Fahrtenbucheintrag löschen {{ hauptbuch.bookings.length }}  

  div.hilight(v-html="pretty(lastbk)")

  button( :class="{'green': validation(lastbk).ok }"  style="width=100%" type="submit") Eintrag löschen
  div {{validation(lastbk).result}}

    // Das Popup einbinden
  Popup(v-model="popupStatus")
</template>

<script setup lang="ts">
import { useHauptbuchStore } from '../stores/hauptbuch'
import { HauptbuchBooking } from '@/types'
import logd from '~/utils/logDebug'
const hauptbuch = useHauptbuchStore()
await hauptbuch.loadHauptbuch()

// Der Status für dein neues Popup
const popupStatus = ref({
  show: false,
  text: ''
})

const pretty = (o: Object) :string => {
  const searchRegExp = /[{,\",}]/g;
  const replaceWith = '';
  return JSON.stringify(o).replaceAll(',','<br>').replace(searchRegExp, replaceWith)
}

const lastbk = ref(hauptbuch.bookings[hauptbuch.bookings.length-1])
let buttonText = ref("letzten Fahrtenbucheintrag löschen")

// validate the submission of the form
const validation = (bk: HauptbuchBooking) :{ok: boolean;result: string} => {
  let retString = ''
  const isFBE = lastbk.value.description.includes('FBE:')
  retString += (!isFBE) ? 'this is not a booking done by the Fahrtenbuch App. will not be deleted' : ''
  return (retString !== '') ? {ok: false, result: retString} : {ok: true, result: 'ok'}
}

// on submit, delete the last booking
const onSubmit = async () => {
  logd("fbeloeschen.vue onSubmit: ")

  const vres = validation(lastbk.value)
  if (vres.ok) {

    const response = await hauptbuch.deleteBooking(lastbk.value)
    if (response.ok) {
    // Falls der Go-Server doch Text schickt, nutzen wir .text()
    const msg = await response.text() 
    popupStatus.value = {
      show: true,
      text: `Erfolgreich gelöscht: ${msg}`
      }
    } else {
    popupStatus.value = {
      show: true,
      text: `Fehler: ${response.status} ${response.statusText}`
      }
    }
    
    // read tha hauptbuch data again to get the last booking updated
    await hauptbuch.loadHauptbuch()
    // reset lastbk and thisbk
    lastbk.value = hauptbuch.bookings[hauptbuch.bookings.length-1]  

  } else {
    logd("fbeloeschen.onSubmit: ", vres.result)
  }
}


</script>

<style scoped>
/* disable scrolling on mobile */
html,
body {
  overflow: hidden;
  height: 100%;
  margin: 0;
  padding: 0;
  touch-action: manipulation !important;
}
form {
  font-size: 1em;
}
div {
  border-radius: 3px;
}
button {
  background-color: rgba(256, 256, 256, 0.7);
  border: 0px solid black;
  border-radius: 8px;
  color: grey;
  padding: 5px 12px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  margin: 4px 2px;
  cursor: pointer;
  font-size: 1.4em;
}
button:hover {
  background-color: #90bee3;
  color: white;
}

.hilight {
  background-color: rgba(0,0,0,0.6);
  color: white;
  border: #90bee3;
}

.red {
  background-color: rgba(255,100,100,1);
  color: white;
  border: #90bee3;
} 

.green {
  background-color: #1fd51c;
  color: white;
  border: #90bee3;
}

input,select,button{
  border: 1px solid rgba(256, 256, 256, 0.7);
  border-radius: 4px;
  padding: 2px;
  margin: 2px;
  height: 2em;
  font-size: 1.5em;
  border-radius: 3px;
  white-space: nowrap;
  vertical-align: middle;
}
.km:hover {
  background-color: #90bee3;
  color: white;
} 
.km:disabled, span.km:disabled {
  background-color: rgba(0,0,0,0.9);
  color: white;
  border: 1px solid rgba(256, 256, 256, 0.7);
}
/* vertical align the plus and minus in the middle */
.km, span.km {
  text-align: center;
  align-items: center;
  font-family: 'Courier New', Courier, monospace;
  font-weight: bold;
  font-size: 2.5em;
  width: 15%;
  height: 1.2em;
  border-radius: 8px;
  background-color: rgba(0,0,0,0.8);
}

.euro,.liter,.description {
  width: 20%;
}
.description {
  width: 40%;
}

input.km, select.km, button.km{  
  color: white;
}
.block {
  display: block;
  border: none;
  background-color: none;
  padding: 14px 28px;
  font-size: 16px;
  cursor: pointer;
  text-align: center;
}


.error {
  background-color: #d51c0f;
  color: rgb(234, 198, 198);
  border: #90bee3;
  padding: 2px;
  border-radius: 3px;
} 

.disable-dbl-tap-zoom {
  touch-action: manipulation;
}

</style>