<template lang="pug">
form.disable-dbl-tap-zoom(@submit.prevent="onSubmit" ) 
  div(v-if="hauptbuch.access_token==''")
    googleOauth(@update_access_token="set_access_token($event)")
  div access_token: {{hauptbuch.access_token}}
  Popup(v-if="popup" :data="popupData" @closePopup="closePopup") 
  div Fahrtenbucheintrag # {{ hauptbuch.bookings.length }}  
  button( :class="{'hilight': bookingtype=='Fahrt'}" @click="bookingtype='Fahrt'") Fahrt
  button( :class="{'hilight': bookingtype=='Tanken'}" @click="bookingtype='Tanken'") Tanken
  button( :class="{'hilight': bookingtype=='Sonstiges'}" @click="bookingtype='Sonstiges'") Sonstiges
  br
  input(type="datetime-local" name="date" :value="thisbk.date" required)
  div 
    select(v-model="thisbk.account")
      option(disabled value="") Bitte Konto auswählen
      option(v-for="sh in sh_store.stakeholder") {{ sh.Name }}
    div  
    div(class="display-table")
      div.tacho(:class="km.toFar() ? 'error' : ''")
        div(v-for="i in [0,1,2,3,4,5]")
          input.km(type="text" v-model="km.digits[i]" readonly )
      div
        div(v-for="i in [0,1,2]") 
        div(v-for="i in [3,4,5]")
          button.km(type="button" @click="km.inc(i); km.change(i)") +
      div
        div(v-for="i in [0,1,2]")
        div(v-for="i in [3,4,5]")
          button.km(type="button" @click="km.dec(i)") -
  div
    span(v-if="km.toFar()" class="error") Ist das nicht ein bisschen viel? Tanken Eintragung vergessen?

  div(v-if="bookingtype==='Tanken'")
    div Liter getankt
      input(type="text" name="liters" placeholder="liters" :value="thisbk.liters" required)
    div Verbrauch
      input(type="text" name="consumption" value=9.5 placeholder="consumption")
    div € pro Liter
      input(type="text" name="fuelPriceInEuro" placeholder="fuelPriceInEuro" required)
    div km gefahren seit letzter Tankfüllung
      input(type="text" name="kmSinceLastFuelFill" placeholder="kmSinceLastFuelFill")
  div(v-if="bookingtype!='Fahrt'")
    div € Betrag
      input(type="text" name="amount" placeholder="amount" required)
    div Schlüssel
      input(type="text" name="key" placeholder="key" )
  div
    input(type="text" name="kmSinceLastEntry" :value="thisbk.description" :placeholder="thisbk.description" )
  div 
    button(type="submit") ins Fahrtenbuch eintragen
</template>

<script setup lang="ts">
import { useHauptbuchStore } from '../stores/hauptbuch'
import { useStakeholderStore } from '../stores/stakeholder' 
import { HauptbuchBooking } from './../mixins/types'
const sh_store = useStakeholderStore()
await sh_store.loadStakeholder()
const hauptbuch = useHauptbuchStore()
await hauptbuch.loadBussiData()

const set_access_token = (token: string) => {
  console.log('set_access_token', token)
  hauptbuch.access_token = token
}

/* catch the event 'closePopup' from th e popup component */
let popup = ref(false)
let popupData = ref('you should not see this!')
const closePopup = () => popup.value = false


const bookingtype = ref('Fahrt')
const today = new Date().toISOString().slice(0, 16)
const lastbk = ref(hauptbuch.bookings[hauptbuch.bookings.length-1])
const thisbk = ref(new HauptbuchBooking(
  (hauptbuch.bookings.length + 1).toString(),  // nr: string
  today, // date: string
  '', // account: string
  lastbk.value.km, // km: string
  '', // kmSinceLastEntry: string
  'asdc', // kmSinceLastFuelFill?: string
  'asd',// liters: string
  "gefahren: 0 km,...",// description: number
  'asdfads',// fuelPriceInEuro: string
  'adsfas', // amount: string
  'adas',// consumption: number
  '', // key: string
  "0"// rowNr: number 
))

// set d1 to d6 according to the digits in laastbk.km
const km = reactive({
  digits: new Array(6).fill(0).map((_, i) => +lastbk.value.km[i] ),
  value: () => +km.digits.join(''),
  kmDriven: () => km.value() - +lastbk.value.km,
  range: 950,
  toFar: () => km.value() - +lastbk.value.km > km.range,
  withinRange: () => km.value() - +lastbk.value.km < km.range, 
  inc: (i: number) =>  km.set(i, km.digits[i]+1),
  dec: (i: number) =>  km.set(i, km.digits[i]-1),
  change: (i: number) => {
    // add style change to the 
    thisbk.value.description = "gefahren: "+ km.kmDriven() +" km,..."
    console.log('change', i)
  },
  set: (index: number, value: number) => {
    if (value == 10) {
      km.digits[index] = 0
      km.set(index-1, km.digits[index-1]+1)
    }
    else if (value == -1) {
      km.digits[index] = 9
      km.set(index-1, km.digits[index-1]-1)
    }
    else {
      km.digits[index] = +value
    }
    // if the km.value is smaller than the last booking, reset to the last booking
    if (km.value() < +lastbk.value.km) {
      km.digits = new Array(6).fill(0).map((_, i) => +lastbk.value.km[i] )
    }
  }
})



const kmSinceLastEntry = +thisbk.value.km - +lastbk.value.km
const validation = (bk: HauptbuchBooking, bt: typeof bookingtype) :{ok: boolean;result: string} => {
  if (bt.value === 'Fahrt') {
    if (+bk.kmSinceLastEntry < 1) return {ok: false, result: +bk.kmSinceLastEntry+' km gefahren. Bitte km angeben'}
    if (bk.account === 'not selected' || bk.account === '') return {ok: false, result: 'Konto: '+bk.account +'. bitte Konto angeben'}
    return {ok: km.withinRange(), result: 'km not within range'}
  } else if (bookingtype.value === 'Tanken') {
    return  {ok: km.withinRange(), result: 'km not within range'}
  } else {
    return  {ok: false, result: ' not yet implemented'}
  }
}

// on submit, create a new booking
const onSubmit = async () => {
  // thisbk.value.account = sh.value
  thisbk.value.date = thisbk.value.date.toString() 
  thisbk.value.km = thisbk.value.km.toString()
  thisbk.value.kmSinceLastEntry = km.kmDriven().toString()
  thisbk.value.liters = "90"
  thisbk.value.consumption = (100*+thisbk.value.liters/km.kmDriven()).toString()
  thisbk.value.fuelPriceInEuro = thisbk.value.fuelPriceInEuro.toString()
  thisbk.value.amount = thisbk.value.amount.toString()
  thisbk.value.description = thisbk.value.description.toString()
  thisbk.value.key = thisbk.value.key.toString()
  thisbk.value.rowNr = "42"
  console.log('onSubmit', thisbk.value)
  const vres = validation(thisbk.value, bookingtype)
  if (vres.ok) {
    await hauptbuch.createBooking(thisbk.value)
  } else {
    popupData.value = vres.result
    popup.value = true
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
  font-size: 2em;
}
div {
  border-radius: 5px;
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
  font-size: 1em;
}
button:hover {
  background-color: #90bee3;
  color: white;
}

.hilight {
  /* choose a color for the hilighted button accvording  to the color scheme of the background-image 
  90bee3
  ef9892
  c6df99
  fcfa9d
  **/
  background-color: #ef9892;
  color: white;
  border: #90bee3;
}

input,select{
  border: 1px solid rgba(256, 256, 256, 0.7);
  border-radius: 4px;
  padding: 2px;
  margin: 2px;
  font-size: 1.5em;
  width: 100%;
  border-radius: 3px;
  white-space: nowrap;
}
/* vertical align the plus and minus in the middle */
button.km {
  padding: 0px;
  align-items: center;
  padding-bottom: 0.2em;
  width: 1.5em;
  height: 2em;
  border-width: 2px;
  border-color: rgb(142, 158, 158);
  font-size: 1.5em;
}

input.km, select.km{
  width: 1.5em;
  vertical-align: middle;
  text-align: center;
  font-family: 'Courier New', Courier, monospace;
  font-weight: bold;
  font-size: 1.5em;
  background-color: rgb(12, 11, 11);
  border: 1px solid rgba(92, 87, 87, 0.7);
  color: white;
  border-radius: 3px;
}

.display-table {
    display: table;   
}
.tacho {
  background-color: rgba(0, 0, 0, 0.798);
  border-radius: 3px;
}
.display-table > div { 
  display: table-row; 
}
.display-table > div > div { 
  display: table-cell;
  padding: 0px;
  /* align center */
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