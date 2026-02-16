<template lang="pug">
form.disable-dbl-tap-zoom.block(@submit.prevent="onSubmit" )
  button.debugbutton( v-if="!hostname().includes('konfi')"  @click="DEBUG=!DEBUG") debug?
  h2 Fahrtenbucheintrag \#{{ hauptbuch.bookings.length }} 
  div(v-if="!hostname().includes('konfi') && DEBUG") 
    div not on production on 
    div {{hostname()}}
    div last submitted: 
      span(v-html="lastSubmitted")
 
  BookingTypeSelector(v-model="bookingtype")
  br

  // Datum und Konto
  span
    input(type="datetime-local" name="date" :value="thisbk.date" required)
    select( :class="{'red': thisbk.account==''}" v-model="thisbk.account")
      option(disabled value="") Konto auswählen
      option(v-for="sh in sh_store.stakeholder") {{ sh.Name }}
  br
  br
  
  KilometerDisplay(
    :digits="km.digits"
    :kmDriven="km.kmDriven(+lastbk.km)"
    :showWarning="km.toFar(+lastbk.km)"
    @increment="(i) => { km.inc(i); kmChange(i) }"
    @decrement="(i) => { km.dec(i); kmChange(i) }"
  )

  FuelInput(
    v-if="bookingtype!='Fahrt'"
    v-model:amount="amount"
    v-model:liters="liters"
    v-model:vollgetankt="vollgetankt"
    v-model:description="thisbk.description"
    :showLiterInput="bookingtype==='Tanken'"
    :showDescription="bookingtype==='Sonstiges'"
    :isValid="isPositiveNumber"
  )
 
  // debug info
  div(v-if="DEBUG")
    div € pro Liter: {{thisbk.amount}} / {{thisbk.liters}} = {{thisbk.fuelPriceInEuro}}
    div aktueller Verbrauch: {{consumption.calculateConsumption(+liters, thisbk.kmSinceLastFuelFill)}} l/100km
    div Durchschnittsverbrauch {{ consumption.averageConsumption }} l/100km
    div km seit letztem mal vollgetankt: {{thisbk.kmSinceLastFuelFill}}
    div km gefahren seit letzter Tankfüllung: {{thisbk.kmSinceLastFuelFill}}km
    div km lezte Tankung: {{consumption.kmAtLastFuelfill()}}
    div wieviel passt gerade in den Tank: {{consumption.estimatedFuelCapacity(thisbk.kmSinceLastFuelFill)}} 
    div Rest im Tank: {{accounts.getAnfangsbestandByName("Kraftstoff") - consumption.estimatedFuelCapacity(thisbk.kmSinceLastFuelFill)}} Liter
  
  // Anzeige der Validierungsfehler
  span(v-if="!validationResult.ok" class="error" v-html="validationResult.result") 
  // Submit Button
  button#id_abschicken( 
    :class="{ 'green': validationResult.ok, 'disabled': !validationResult.ok }"
    style="width=100%" 
    type="submit") ins Fahrtenbuch eintragen

  // Das Popup einbinden
  Popup(v-model="popupStatus")
</template>




<script setup lang="ts">
logd("fahrtenbucheintrag.vue setup")
import { computed } from 'vue'
import { useHauptbuchStore } from '../../stores/hauptbuch'
import { useStakeholderStore } from '../../stores/stakeholder'
import { useAccountsStore } from '~/stores/accounts'
import { HauptbuchBooking } from '../../types'
import logd from '~/utils/logDebug'
import { useKilometerCounter } from '~/composables/useKilometerCounter'
import { useBookingForm } from '~/composables/useBookingForm'
import { useBookingValidation } from '~/composables/useBookingValidation'
import { useFuelConsumption } from '~/composables/useFuelConsumption'
import BookingTypeSelector from '~/components/fahrtenbucheintrag/BookingTypeSelector.vue'
import KilometerDisplay from '~/components/fahrtenbucheintrag/KilometerDisplay.vue'
import FuelInput from '~/components/fahrtenbucheintrag/FuelInput.vue'

// Der Status für dein neues Popup
const popupStatus = ref({
  show: false,
  text: ''
})

const sh_store = useStakeholderStore()
await sh_store.loadStakeholder()
const hauptbuch = useHauptbuchStore()
await hauptbuch.loadHauptbuch()
const bookingsRef = computed(() => hauptbuch.bookings)
const accounts = useAccountsStore()
await accounts.loadDataFromGoogle()

const DEBUG = ref(false)
const hostname = () => {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    return window.location.hostname
  }
}
const n_ow = new Date()
const now = new Date(+n_ow - n_ow.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
const lastbk = ref(hauptbuch.bookings[hauptbuch.bookings.length - 1])

const consumption = useFuelConsumption(bookingsRef)
const validation = useBookingValidation()
const { isPositiveNumber, validateFahrt, validateTanken, validateSonstiges } = validation

const initialBooking = new HauptbuchBooking(
  (hauptbuch.bookings.length + 1).toString(),
  now,
  '',
  lastbk.value.km,
  0,
  lastbk.value.km - consumption.kmAtLastFuelfill(),
  0,
  0,
  0,
  0,
  '',
  '',
  hauptbuch.bookings.length + 1
)

const form = useBookingForm(initialBooking)
const { bookingtype, thisbk, vollgetankt, liters, amount, lastSubmitted, buildDescription, resetForm } = form

const km = useKilometerCounter(lastbk.value.km)

const kmChange = (i: number) => {
  thisbk.value.kmSinceLastEntry = km.kmDriven(+lastbk.value.km)
  thisbk.value.kmSinceLastFuelFill = lastbk.value.kmSinceLastFuelFill + km.kmDriven(+lastbk.value.km)
  thisbk.value.km = km.value()
  km.resetToMinimum(+lastbk.value.km)
}

const validationResult = computed(() => {
  const bk = thisbk.value
  const bt = bookingtype.value
  
  if (bt === 'Fahrt') {
    return validateFahrt(bk, km.withinRange(+lastbk.value.km))
  }
  
  if (bt === 'Tanken') {
    bk.amount = +amount.value
    bk.fuelPriceInEuro = +amount.value / +liters.value
    bk.liters = +liters.value
    bk.consumption = consumption.calculateConsumption(+liters.value, bk.kmSinceLastFuelFill)
    return validateTanken(bk, km.withinRange(+lastbk.value.km), consumption.averageConsumption.value, vollgetankt.value)
  }
  
  if (bt === 'Sonstiges') {
    bk.amount = +amount.value
    return validateSonstiges(bk)
  }
  
  return { ok: false, result: 'Unbekannter Buchungstyp' }
})

const onSubmit = async () => {
  logd("fahrtenbucheintrag.vue onSubmit: ")
  lastSubmitted.value = ""

  thisbk.value.date = thisbk.value.date.toString()
  thisbk.value.kmSinceLastEntry = thisbk.value.km - lastbk.value.km
  thisbk.value.liters = 0
  
  if (bookingtype.value === 'Tanken') {
    thisbk.value.liters = +((document.querySelector('input[name="liters"]') as HTMLInputElement)?.value || 0)
  }
  
  thisbk.value.consumption = (bookingtype.value === 'Tanken') 
    ? (100 * +(thisbk.value.liters) / (km.kmDriven(+lastbk.value.km) + thisbk.value.kmSinceLastFuelFill)) 
    : 0

  const od = thisbk.value.description
  thisbk.value.description = buildDescription(
    bookingtype.value,
    thisbk.value.kmSinceLastEntry,
    od,
    vollgetankt.value
  )

  console.log('onSubmit', thisbk.value)
  
  if (validationResult.value.ok) {
    lastSubmitted.value += thisbk.value.description + "<br>" + JSON.stringify(thisbk.value)
    const response = await hauptbuch.createBooking(thisbk.value)
    // show a result popup on response
    if (response.ok) {
    // Falls der Go-Server doch Text schickt, nutzen wir .text()
    const msg = await response.text() 
    popupStatus.value = {
      show: true,
      text: `Erfolgreich gespeichert: ${msg}`
      }
    } else {
    popupStatus.value = {
      show: true,
      text: `Fehler: ${response.status} ${response.statusText}`
      }
    }

    await hauptbuch.loadHauptbuch()
    
    lastbk.value = hauptbuch.bookings[hauptbuch.bookings.length - 1]
    const kmSinceLastFuelFill = vollgetankt.value 
      ? 0 
      : lastbk.value.kmSinceLastFuelFill - +liters.value / (100 * consumption.averageConsumption.value)
    
    resetForm(
      hauptbuch.bookings.length + 1,
      lastbk.value.km,
      kmSinceLastFuelFill,
      now
    )
    km.reset(lastbk.value.km)
  }
}

</script>

<style scoped src="./styles.css"></style>