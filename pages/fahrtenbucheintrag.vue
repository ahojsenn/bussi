<template lang="pug">
form.disable-dbl-tap-zoom.block(@submit.prevent="onSubmit" ) 
  button(@click="showPopup.show = true") Open Popup
  Popup(v-model="popupData" )
  div(v-if="hauptbuch.access_token!=''") access_token: {{hauptbuch.access_token}}
  
  div Fahrtenbucheintrag # {{ hauptbuch.bookings.length }}  
  button( :class="{'hilight': bookingtype=='Fahrt'}" @click="bookingtype='Fahrt'") Fahrt
  button( :class="{'hilight': bookingtype=='Tanken'}" @click="bookingtype='Tanken'") Tanken
  button( :class="{'hilight': bookingtype=='Sonstiges'}" @click="bookingtype='Sonstiges'") Sonstiges
  br
  input(type="datetime-local" name="date" :value="thisbk.date" required)
  select(v-model="thisbk.account")
    option(disabled value="") Bitte Konto auswählen
    option(v-for="sh in sh_store.stakeholder") {{ sh.Name }}

  div(style="width: 100%")
    div
      span(v-for="i in [0,1,2,3,4,5]")
        button.km(disabled) {{km.digits[i]}}
    div
      span(v-for="i in [0,1,2]") 
        button.km(style="background-color: rgba(0,0,0,0.1)" disabled)
      span(v-for="i in [3,4,5]")
        button.km(type="button" @click="km.inc(i); km.change(i)") +
    div
      span(v-for="i in [0,1,2]") 
        button.km(style="background-color: rgba(0,0,0,0.1)" disabled) 
      span(v-for="i in [3,4,5]")
        button.km(type="button" @click="km.dec(i); km.change(i)") -

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
  div gefahren: {{km.kmDriven()}}km
  
  button(style="width=100%" type="submit") ins Fahrtenbuch eintragen
</template>

<script setup lang="ts">
import { useHauptbuchStore } from '../stores/hauptbuch'
import { useStakeholderStore } from '../stores/stakeholder' 
import { HauptbuchBooking } from './../mixins/types'
import logd from '~/mixins/logDebug'
const sh_store = useStakeholderStore()
await sh_store.loadStakeholder()
const hauptbuch = useHauptbuchStore()
await hauptbuch.loadBussiData()

const set_access_token = (token: string) => {
  console.log('set_access_token', token)
  hauptbuch.access_token = token
}

/* catch the event 'closePopup' from th e popup component */
//let showPopup = ref(false)
let popupData = ref({show: false, text: 'you should not see this!'})
//const closePopup = () => showPopup.value = false


const bookingtype = ref('Fahrt')
const today = new Date().toISOString().slice(0, 16)
const lastbk = ref(hauptbuch.bookings[hauptbuch.bookings.length-1])
const thisbk = ref(new HauptbuchBooking(
    (hauptbuch.bookings.length + 1).toString(),//nr: string,
    today,//date: string,
    '',//account: string,
    lastbk.value.km,//km: number,
    '',//liters: string,
    '',//fuelPriceInEuro: string,
    '',//amount: string,
    '',//description: string,
    '',//key: string,
    0,//kmSinceLastEntry: 0,
    0,//kmSinceLastFuelFill?: 0,
    0,//consumption?: number,
    lastbk.value.rowNr ,//rowNr?: number,
))

// set d1 to d6 according to the digits in laastbk.km
const km = reactive({
  digits: new Array(6).fill(0).map((_, i) => getDigitAt(lastbk.value.km,i ) ),
  value: () =>   +km.digits.join(''),
  kmDriven: () =>  km.value() - +lastbk.value.km,
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
      km.digits = new Array(6).fill(0).map((_, i) => getDigitAt(lastbk.value.km,i ) )
    }
  }
})

/**
 * Returns the i-th digit of a given number.
 * @param num - The number to extract the digit from.
 * @param index - The zero-based index of the digit (from left to right).
 * @returns The digit at the given index, or null if invalid.
 */
function getDigitAt(num: number, index: number): number  {
    // Validate inputs
    if (!Number.isFinite(num) || !Number.isInteger(index) || index < 0) {
        console.error("Invalid input: num must be finite, index must be a non-negative integer.");
        return 0;
    }

    // Work with absolute value to ignore sign
    const numStr = Math.abs(num).toString();

    // Check index bounds
    if (index >= numStr.length) {
        console.warn("Index out of range.");
        return 0;
    }

    // Convert the character at index to a number
    return Number(numStr.charAt(index));
}


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
  logd("fahrtenbucheintrag.vue onSubmit: ")
  // thisbk.value.account = sh.value
  thisbk.value.date = thisbk.value.date.toString() 
  //thisbk.value.km = thisbk.value.km.toString()
  thisbk.value.kmSinceLastEntry = km.kmDriven()//.toString()
  thisbk.value.liters = "0 l"
  thisbk.value.consumption = (100*+thisbk.value.liters/km.kmDriven())//.toString()
  console.log('onSubmit', thisbk.value)
  const vres = validation(thisbk.value, bookingtype)
  if (vres.ok) {
    await hauptbuch.createBooking(thisbk.value)
  } else {
    popupData.value.text = vres.result
    popupData.value.show = true
    //showPopup.value = true
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
  font-size: 1em;
}
button:hover {
  background-color: #90bee3;
  color: white;
}

.hilight {
  background-color: #ef9892;
  color: white;
  border: #90bee3;
}

input,select,button{
  border: 1px solid rgba(256, 256, 256, 0.7);
  border-radius: 4px;
  padding: 2px;
  margin: 2px;
  height: 1.3em;
  font-size: 1.5em;
  border-radius: 3px;
  white-space: nowrap;
  vertical-align: middle;
}
/* vertical align the plus and minus in the middle */
.km, span.km {
  text-align: center;
  align-items: center;
  font-family: 'Courier New', Courier, monospace;
  font-weight: bold;
  font-size: 2.5em;
  width: 15%;
  height: 2em;
  border-radius: 8px;
  background-color: rgb(12, 11, 11);
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