<template lang="pug">
form.disable-dbl-tap-zoom.block(@submit.prevent="onSubmit" ) 
  button.debugbutton( v-if="!hostname().includes('konfi')"  @click="DEBUG=!DEBUG") debug?
  h2 Fahrtenbucheintrag \#{{ hauptbuch.bookings.length }} 
  div(v-if="!hostname().includes('konfi') && DEBUG") 
    div not on production on 
    div {{hostname()}}
    div last submitted: 
      span(v-html="lastSubmitted")
 
  // Auswahl des Vorgangs
  button.vorgang( :class="{'hilight': bookingtype=='Fahrt'}" @click="bookingtype='Fahrt'" type="button") Fahrt
  button.vorgang( :class="{'hilight': bookingtype=='Tanken'}" @click="bookingtype='Tanken'" type="button") Tanken
  button.vorgang( :class="{'hilight': bookingtype=='Sonstiges'}" @click="bookingtype='Sonstiges'" type="button") Sonstiges
  br

  // Datum und Konto
  span
    input(type="datetime-local" name="date" :value="thisbk.date" required)
    select( :class="{'red': thisbk.account==''}" v-model="thisbk.account")
      option(disabled value="") Konto auswählen
      option(v-for="sh in sh_store.stakeholder") {{ sh.Name }}
  br
  br
  // Kilometer Eingabe
  div
    div.changebar
      div.kmbox(v-for="i in [0,1,2,3]") 
        button.changekm(style="background-color: rgba(0,0,0,0.1)" disabled)
      div.kmbox(v-for="i in [3,4,5]")
        button.changekm(type="button" @click="km.inc(i); km.change(i)") +

    div.kmdisplay 
      div.kmbox(style="overflow: auto")  {{km.kmDriven()}} km
      div.kmbox(v-for="i in [0,1,2,3,4,5]")
        button.km(disabled) {{km.digits[i]}}

    div.changebar
      div.kmbox(v-for="i in [0,1,2,3]") 
        button.changekm(style="background-color: rgba(0,0,0,0.1)" disabled) 
      div.kmbox(v-for="i in [3,4,5]")
        button.changekm(type="button" @click="km.dec(i); km.change(i)") -

  // Warnung wenn km zu weit
  br
  div
    span(v-if="km.toFar()" class="error") Ist das nicht ein bisschen viel? Tanken Eintragung vergessen?

  // Eingabe für Tanken oder Sonstiges
  div.pump(v-if="bookingtype!='Fahrt'" ) 
    div.pump-display-container
      input(
          :class="{'gas-pump-input-red': !isPositiveNumber(amount),\
              'gas-pump-input' : true\
          }" 
        type="number" 
        pattern="[0-9]+([.][0-9]+)?"
        inputmode="decimal"
        value="€"
        placeholder="Euro" 
        v-model="amount" 
        spellcheck="false"
        onfocus="this.select()"
          )
      br
      span.pump-label Price to pay €
    
    div.pump-display-container(v-if="bookingtype==='Tanken'" )
      input(
        :class="{'gas-pump-input-red': !isPositiveNumber(liters),\
              'gas-pump-input' : true\
        }" 
        type="number" 
        pattern="[0-9]+([.][0-9]+)?"
        inputmode="decimal"
        value="0.00"
        placeholder="Litres" 
        v-model="liters" 
        spellcheck="false"
        onfocus="this.select()"
        )
      br
      span.pump-label Litres
      br
      span.pump-label vollgetankt?
      input(  type="checkbox" name="vollgetankt?" checked placeholder="" v-model="vollgetankt" style="color: red") 

    // Beschreibung Eingabe für Sonstiges mit zwei zeilenumbrüchen
    span.pump-display-container(v-if="bookingtype==='Sonstiges'")
      textarea.description( 
        :class="{'red': thisbk.description==''}" 
        type="text" 
        name="description" 
        placeholder="description, what did you purchase?" 
        v-model="thisbk.description" required
        )
 
  // debug info
  div(v-if="DEBUG")
    div € pro Liter: {{thisbk.amount}} / {{thisbk.liters}} = {{thisbk.fuelPriceInEuro}}
    div aktueller Verbrauch: {{calculateConsumption(thisbk)}} l/100km
    div Durchschnittsverbrauch {{ averageConsumption() }} l/100km
    div km seit letztem mal vollgetankt: {{thisbk.kmSinceLastFuelFill}}
    div km gefahren seit letzter Tankfüllung: {{thisbk.kmSinceLastFuelFill}}km
    div km lezte Tankung: {{kmAtLastFuelfill()}}
    div wieviel passt gerade in ten Tank: {{estimatedFuelCapacity(thisbk)}} 
  
  div ddd {{amount}}
  // Anzeige der Validierungsfehler
  span(v-if="!validation(thisbk, bookingtype).ok" class="error" v-html="validation(thisbk, bookingtype).result") 
  // Submit Button
  button#id_abschicken( 
    :class="{'green': validation(thisbk, bookingtype).ok }"  
    style="width=100%" 
    type="submit") ins Fahrtenbuch eintragen
</template>




<script setup lang="ts">
import { bookingIsTanken } from '~/mixins/bookingHelpers'
import { useHauptbuchStore } from '../stores/hauptbuch'
import { useStakeholderStore } from '../stores/stakeholder' 
import { HauptbuchBooking } from './../mixins/types'
import logd from '~/mixins/logDebug'
const sh_store = useStakeholderStore()
await sh_store.loadStakeholder()
const hauptbuch = useHauptbuchStore()
await hauptbuch.loadBussiData()
const bookings = hauptbuch.bookings
const DEBUG=ref(false)

// save hostname from url in hostname
const hostname = () => {
      // Access the hostname from the browser's window.location object
      if (typeof window !== 'undefined' && window.location && window.location.hostname) {
        return window.location.hostname;
      }
    }
let lastSubmitted = ref("nothing yet")
const vollgetankt = ref(true)
const liters = ref ("Litres")
const amount = ref ("Euro")

const bookingtype = ref('Fahrt')
const today = new Date().toISOString().slice(0, 16)
const lastbk = ref(hauptbuch.bookings[hauptbuch.bookings.length-1])
const allLiters = hauptbuch.bookings.reduce((acc,cv) => acc += cv.liters,0)
const isParsableNumber = (v: any): boolean => !isNaN(parseFloat(v)) && isFinite(v);
const isPositiveNumber = (v: any): boolean => isParsableNumber(v) && v > 0
const scrollIntoView= (id :string) => {
      const inputField = document.getElementById(id);
      alert('hi')
      if (inputField)  inputField.scrollIntoView({ behavior: 'smooth' });
  }
const averageConsumption = () => Math.round (10000* allLiters / allKM) /100
const kmAtLastFuelfill = () :number => bookings.filter(b => bookingIsTanken(b)).reverse()[0].km || 0

const thisbk = ref(new HauptbuchBooking(
    (hauptbuch.bookings.length + 1).toString(),//nr: string,
    today,//date: string,
    '',//account: string,
    lastbk.value.km,//km: number,
    0,//kmSinceLastEntry: 0,
    lastbk.value.km - kmAtLastFuelfill(),//kmSinceLastFuelFill?: 0,
    0,//liters: string,
    (hauptbuch.bookings.length + 1),//rowNr?: number,
    0,//fuelPriceInEuro: string,
    0,//amount: string,
    '',//description: string,
    '',//key: string,
    (hauptbuch.bookings.length + 1),//rowNr?: number,
))
const allKM = thisbk.value.km - hauptbuch.bookings[0].km

// set d1 to d6 according to the digits in lastbk.km
const km = reactive({
  digits: new Array(6).fill(0).map((_, i) => getDigitAt(lastbk.value.km,i ) ),
  value: () =>   +km.digits.join(''),
  kmDriven: () :number =>  km.value() - +lastbk.value.km,
  range: 950,
  toFar: () => km.value() - +lastbk.value.km > km.range,
  withinRange: () => km.value() - +lastbk.value.km < km.range, 
  inc: (i: number) =>  km.set(i, km.digits[i]+1),
  dec: (i: number) =>  km.set(i, km.digits[i]-1),
  change: (i: number) => {
    // add style change to the 
    thisbk.value.kmSinceLastEntry = km.kmDriven()
    thisbk.value.kmSinceLastFuelFill = lastbk.value.kmSinceLastFuelFill + km.kmDriven() 
    thisbk.value.km = km.value()
    console.log('change', i, thisbk.value, lastbk.value)
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



const validation = (bk: HauptbuchBooking, bt: string) :{ok: boolean;result: string} => {
  let retString = ''

  if (bt === 'Fahrt') {
    retString += bk.date === '' ? 'Date not set<br>' : ''
    retString += bk.kmSinceLastEntry < 1 ? 'Bitte km angeben<br>': ''
    retString += bk.account === '' ? 'bitte Konto angeben<br>' : ''
    retString += km.withinRange() ? '' : 'km not within range<br>'
    retString += bk.amount != 0 ? 'Bei Eintrag "Fahrt" bitte keinen Betrag angeben<br>': ''
    retString += bk.liters != 0 ? 'Bei Eintrag "Fahrt" bitte keine Liter angeben<br>': ''
  } 
  
  if (bt === 'Tanken') {
    bk.amount = +amount.value 
    bk.fuelPriceInEuro = +amount.value / +liters.value
    bk.liters = +liters.value
    retString += km.withinRange() ? '' : 'km not within range<br>'
    retString += bk.liters <= 0 ? 'Bitte Liter angeben<br>': ''
    retString += bk.amount <= 0 ? 'Bitte Betrag angeben<br>': ''
    retString += bk.account === '' ? 'Konto not selected<br>' : ''

    calculateConsumption(bk)
    if (vollgetankt.value) {
      retString += bk.consumption > 1.2*averageConsumption() ? 'Verbrauch zu hoch, bitte prüfen<br>': ''
          } else {
      // retString += "wirklich vollgetankt?"
    }

    retString += bk.consumption < 0.8*averageConsumption() ? 'Verbrauch zu niedrig, bitte prüfen<br>': ''
    retString += bk.fuelPriceInEuro < 1.2 ?  'Kraftstoffpreis zu niedrig, bitte prüfen<br>': ''
    retString += bk.fuelPriceInEuro > 2.5 ?  'Kraftstoffpreis zu hoch, bitte prüfen<br>': ''
  
  } 
  
  if (bt === 'Sonstiges') {
    bk.amount = +amount.value 
    retString += bk.amount <= 0 ? 'Bitte Betrag angeben<br>': ''
    retString += bk.account === '' ? 'Konto nicht ausgewählt<br>' : ''  
    retString += bk.description === '' ? 'Bitte Beschreibung angeben<br>': ''
  }
  
  return (retString !== '') ? {ok: false, result: retString} : {ok: true, result: 'ok'}
}

// calcculate verbrauch and € pro liter and set it in thisbk
const calculateConsumption = (b: HauptbuchBooking) => {
  b.consumption =  Math.round (10000 * +liters.value / b.kmSinceLastFuelFill) / 100
  return b.consumption
}
const estimatedFuelCapacity = (b: HauptbuchBooking) :number => thisbk.value.kmSinceLastFuelFill / averageConsumption()

// on submit, create a new booking
const onSubmit = async () => {
  logd("fahrtenbucheintrag.vue onSubmit: ")
  lastSubmitted.value = ""
  // saetze die werte in thisbk

  // thisbk.value.account = sh.value
  thisbk.value.date = thisbk.value.date.toString() 
  //thisbk.value.km = thisbk.value.km.toString()
  thisbk.value.kmSinceLastEntry = thisbk.value.km - lastbk.value.km 
  thisbk.value.liters = 0
  if (bookingtype.value === 'Tanken') {
    thisbk.value.liters = +( (document.querySelector('input[name="liters"]') as HTMLInputElement).value || 0)
    // if not vollgetankt calculate kmSincelastFuelFill with Durchschnittsverbrauch...
  

 
  }
  thisbk.value.consumption = 
    (bookingtype.value === 'Tanken') ? 
    (100*+(thisbk.value.liters)/(km.kmDriven()+thisbk.value.kmSinceLastFuelFill)) : 0

  // make a nice description
  const od = thisbk.value.description
  thisbk.value.description = "FBE: " + bookingtype.value
  thisbk.value.description += (thisbk.value.kmSinceLastEntry>0) ? " :: km: " + thisbk.value.kmSinceLastEntry : ''
  thisbk.value.description += (od != "") ? " :: " + od : ""
  // if "nicht vollgetankt"
  thisbk.value.description += (!vollgetankt.value) ? " :: nicht vollgetankt" : ""


  console.log('onSubmit', thisbk.value)
  const vres = validation(thisbk.value, bookingtype.value)
  if (vres.ok) {
    lastSubmitted.value += thisbk.value.description+"<br>"+JSON.stringify(thisbk.value)
    await hauptbuch.createBooking(thisbk.value)
    
    // read tha hauptbuch data again to get the last booking updated
    await hauptbuch.loadBussiData()
    // reset lastbk and thisbk
    lastbk.value = hauptbuch.bookings[hauptbuch.bookings.length-1]
    thisbk.value = new HauptbuchBooking(
      (hauptbuch.bookings.length + 1).toString(),//nr: string,
      today,//date: string,
      '',//account: string,
      lastbk.value.km,//km: number,
      0,//kmSinceLastEntry: 0,
      (vollgetankt.value) ? 0 : lastbk.value.kmSinceLastFuelFill - +liters.value/(100*averageConsumption()),//kmSinceLastFuelFill?: 0,
      0,//liters: string,
      0,//consumption
      0,//fuelPriceInEuro: string,
      0,//amount: string,
      '',//description: string,
      '',//key: string,
      (hauptbuch.bookings.length + 1),//rowNr?: number,
    )
    // reset km digits with lastbk.value.km
    km.digits = new Array(6).fill(0).map((_, i) => getDigitAt(lastbk.value.km,i ) )
  }
}
</script>



<style scoped>
/* disable scrolling on mobile with css */
body {
  overflow: hidden;
}

div {
  border-radius: 3px;
}
button {
  background-color: rgba(256, 256, 256, 0.7);
  border: 0px solid black;
  color: grey;
  cursor: pointer;
  
  &:active {
    transform: scale(13px)
  }

  
  &::after, &::before {
    border-radius: 13px
  }

}

.debugbutton {
  position: absolute;
  left: 0pt;
  color: rgba(200,0,0,0.7)
}

button:hover button:click {
  background-color: #90bee3;
  color: white;
}

.vorgang {
  width: 32%;
  height: 2.0em;
  font-size: 1.3em;
  color: rgba(50,50,50,0.7)
}

.hilight {
  background-color: #205a8a;
  color: white;
  border: #293743;
}

.red {
  background-color: rgba(255,100,100,1);
  color: white;
  border: #90bee3;
} 

.tanken {
  background-color: yellow;
  color: grey;
  align: left;

}

.green {
  background-color: #1fd51c;
  color: white;
  border: #90bee3;
}

input,select,button{
  border-radius: 4px;
  padding: 2px;
  margin: 2px;
  font-size: 1.3em;
  border-radius: 3px;
  white-space: nowrap;
  vertical-align: middle;
}
input[type="checkbox"] {
  width: 1.5em;
  height: 1.5em;
}
.km:hover {
  background-color: #90bee3;
  color: white;
} 
.kmdisplay {
  background-color: rgba(0,0,0,1);
  color: lightgray;
  border-radius: 0.4em;
  display: flex;
  width: 100%;
}
.kmbox {
  width: 14%;
  overflow: auto;
  text-align: right;
}
.km:disabled, span.km:disabled {
  background-color: rgba(10,10,10,0.9);
 
}
/* vertical align the plus and minus in the middle */
.km, span.km {
  text-align: center;
  align-items: center;
  font-family: 'Courier New', Courier, monospace;
  font-weight: bold;
  font-size: 2.5em;
  width: 1.1em;
  height: 1.2em;
  border-radius: 8px;
  background-color: rgba(0,0,0,0.7);
  background: linear-gradient(to top,hsla(20, 0%, 0%, 0.9), 
        hsla(0, 0%, 50%, 0.5) 50%,  hsla(20, 0%, 0%, 0.9));
}

.changebar {
  border-radius: 0.4em;
  display: flex;
  width: 100%; 
}
.changekm {
  text-align: center;
  align-items: center;
  font-family: 'Courier New', Courier, monospace;
  font-weight: bold;
  font-size: 2.3em;
  height: 1.2em;
  width: 1.2em;
  border-radius: 8px;
  color: white;
  background-color: rgba(0,0,0,0.7); 
}


::placeholder {
  color: white;
}

/* Beschreibung Eingabefeld mit drei zeilen und zeilenumbrüchen */
span
.description{
  width: 90%;
  height: 3.6em;
  font-size: 1.3em;
  border-radius: 4px;
  padding: 5px;
  margin: 4%;
  border: 1px solid grey;
  resize: vertical; /* allow vertical resizing */
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



/* Container für den Zapfsäulen-Look */

.pump {
  display: flex;
  background-color: #1a1a1a;
  border-radius: 4px;
  width: 100%;
  height: 120px;
}
.pump-display-container {
  background-color: #0a0a0a;
  padding: 5px 5px 5px 5px;
  border-radius: 8px;
  width: 45%;
  display: inline-block;
  text-align: right;
  height: 100px;
}


@font-face {
    font-family: 'Digital-7';
    src: url('/digital-7.woff') format('woff'),
         url('/digital-7.ttf') format('ttf');
}
/* Das eigentliche Input-Feld */


.gas-pump-input {
  /* Hintergrund mit Farbverlauf für den LCD-Effekt */
  background: linear-gradient(to bottom, #e2eb42 0%, #cbd61a 100%);
 
  /* Schrift-Styling */
  color: #1a1a1a;
  font-family: 'Digital-7', sans-serif;
  font-size: 2rem;
  font-weight: bold;
  text-align: right;
 
  /* Form und Rahmen */
  border: 4px solid #333;
  border-radius: 4px;
  padding: 5px 15px;
  width: 55%;
  outline: none;
 
  /* Innerer Schatten für Tiefe */
  box-shadow: inset 0px 4px 10px rgba(0, 0, 0, 0.3);
 
  /* Leucht-Effekt der Segmente simulieren */
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}
.gas-pump-input-red {
  background: linear-gradient(to bottom, #fe7070 0%, #f1503a 100%);
}

/* Label-Styling (z.B. "PRICE TO PAY") */
.pump-label {
  color: #d1d1d1;
  font-family: Arial, sans-serif;
  font-size: 0.8rem;
  text-transform: uppercase;
  /* margin-top: -25px; /* Positioniert das Label über das Input */
  pointer-events: none;
  text-align: right; /* Text rechts ausrichten */
  margin-right: 10px;
}



</style>