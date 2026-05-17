<template lang="pug">
form.disable-dbl-tap-zoom.block(@submit.prevent="onSubmit" )
  button.debugbutton( v-if="!hostname().includes('konfi')"  @click="DEBUG=!DEBUG") debug? {{DEBUG ? 'ON' : 'OFF'}}
  h2 Fahrtenbucheintrag \#{{ hauptbuch.bookings.length }} 
  div(v-if="!hostname().includes('konfi') && DEBUG") 
    div not on production
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
      option(v-for="accountName in accountOptions" :key="accountName") {{ accountName }}
  br
  br

  div(v-if="bookingtype==='Ausgleichszahlung'")
    select(:class="{'red': recipient===''}" v-model="recipient")
      option(disabled value="") Empfänger auswählen
      option(v-for="recipientName in recipientOptions" :key="recipientName") {{ recipientName }}
    br
    br
  
  KilometerDisplay(
    v-if="bookingtype!=='Ausgleichszahlung'"
    :digits="km.digits"
    :kmDriven="km.kmDriven(+lastbk.km)"
    :showWarning="km.toFar(+lastbk.km) || consumption.estimatedKmLeftInTank(thisbk.kmSinceLastFuelFill) < -50"
    @increment="(i) => { km.inc(i); kmChange(i) }"
    @decrement="(i) => { km.dec(i); kmChange(i) }"
  )

  FuelInput(
    v-if="bookingtype!='Fahrt'"
    v-model:amount="amount"
    v-model:liters="liters"
    v-model:nachtrag="nachtrag"
    v-model:vollgetankt="vollgetankt"
    v-model:description="thisbk.description"
    :showLiterInput="bookingtype==='Tanken'"
    :showDescription="bookingtype==='Sonstiges' || bookingtype==='Ausgleichszahlung'"
    :showNachtrag="bookingtype==='Tanken'"
    :descriptionRequired="bookingtype==='Sonstiges'"
    :isValid="isPositiveNumber"
  )
 
  // debug info
  div(v-if="DEBUG")
    div € pro Liter: {{thisbk.amount}} / {{thisbk.liters}} = {{roundToDecimals(thisbk.fuelPriceInEuro,2)}}
    div kmSinceLastFuleFill: {{roundToDecimals(thisbk.kmSinceLastFuelFill,1)}}
    div computed kmSinceLastFuelFill: {{kmSinceLastFuelFill}}
    div computed estimatedKmLeftInTank: {{roundToDecimals(consumption.estimatedKmLeftInTank(thisbk.kmSinceLastFuelFill),1)}}
    div consumption.ave[l/100km]: {{consumption.averageConsumption}}
    div aktueller Verbrauch: 
      span liters={{thisbk.liters}} , 
      span {{consumption.calculateConsumption(thisbk.liters, thisbk.kmSinceLastFuelFill)}} l/100km
    div km seit letztem mal vollgetankt: {{Math.round(thisbk.kmSinceLastFuelFill)}} km
    div km lezte Tankung: {{consumption.kmAtLastFuelfill()}}
    div Tankvolumen: {{consumption.totalFuelCapacity}} Liter
    div wieviel passt gerade in den Tank: {{Math.round(10*consumption.estimatedFuelCapacity(thisbk.kmSinceLastFuelFill))/10}} Liter
    div Rest im Tank: {{ Math.round(consumption.estimatedFuelInTank(thisbk.kmSinceLastFuelFill))}}  Liter
    div Kommentar: {{description}}
    div bookingtype: {{bookingtype}}  
    div form: {{form}}

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
import roundToDecimals from '~/utils/roundToDecimals'
import { computed, watch } from 'vue'
import { useHauptbuchStore } from '../../stores/hauptbuch'
import { useStakeholderStore } from '../../stores/stakeholder'
import { useAccountsStore } from '~/stores/accounts'
import logd from '~/utils/logDebug'
import { useKilometerCounter } from '~/composables/useKilometerCounter'
import { useBookingForm, createNewBooking, buildAusgleichDefaultDescription } from '~/composables/useBookingForm'
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
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return window.location.hostname
  }
  return '' // Fallback auf leeren String
}
const n_ow = new Date()
const now = new Date(+n_ow - n_ow.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
const lastbk = ref(hauptbuch.bookings[hauptbuch.bookings.length - 1])

const consumption = useFuelConsumption(bookingsRef)
const validation = useBookingValidation()
const { isPositiveNumber, validateFahrt, validateTanken, validateSonstiges, validateAusgleichszahlung } = validation

const initialBooking = createNewBooking(
  hauptbuch.bookings.length + 1,
  lastbk.value.km,
  lastbk.value.kmSinceLastFuelFill,
  now
)

const form = useBookingForm(initialBooking)
const { bookingtype, thisbk, vollgetankt, nachtrag, liters, amount, recipient, lastSubmitted, buildDescription, resetForm } = form

const km = useKilometerCounter(lastbk.value.km)
const gesellschafter = computed(() => sh_store.getGesellschafter)
const accountOptions = computed(() => (
  bookingtype.value === 'Ausgleichszahlung'
    ? gesellschafter.value
    : sh_store.stakeholder.map((stakeholder) => stakeholder.Name)
))
const recipientOptions = computed(() => (
  gesellschafter.value.filter((name) => name !== thisbk.value.account)
))
const lastAutoAusgleichDescription = ref('')


const kmChange = (i: number) => {
  thisbk.value.kmSinceLastEntry = km.kmDriven(+lastbk.value.km)
  thisbk.value.kmSinceLastFuelFill = lastbk.value.kmSinceLastFuelFill + km.kmDriven(+lastbk.value.km)
  thisbk.value.km = km.value()
  km.resetToMinimum(+lastbk.value.km)
}

watch([bookingtype, () => thisbk.value.account, recipient], ([currentBookingType, currentAccount, currentRecipient]) => {
  if (currentBookingType !== 'Ausgleichszahlung') {
    if (thisbk.value.description === lastAutoAusgleichDescription.value) {
      thisbk.value.description = ''
    }

    lastAutoAusgleichDescription.value = ''
    recipient.value = ''
    thisbk.value.key = ''
    return
  }

  if (recipient.value === currentAccount) {
    recipient.value = ''
  }

  const nextAutoDescription = buildAusgleichDefaultDescription(currentAccount, currentRecipient)
  if (
    thisbk.value.description === ''
    || thisbk.value.description === lastAutoAusgleichDescription.value
  ) {
    thisbk.value.description = nextAutoDescription
  }

  lastAutoAusgleichDescription.value = nextAutoDescription
})

// I need this for calculation validations, sinde thisbk.kmSinceLastFuelFill might be set to zero on filled fuuel
const kmSinceLastFuelFill = computed(() => lastbk.value.kmSinceLastFuelFill + thisbk.value.km - lastbk.value.km)


const syncBookingTypeData = () => {
  if (bookingtype.value === 'Ausgleichszahlung') {
    thisbk.value.km = lastbk.value.km
    thisbk.value.kmSinceLastEntry = 0
  }

  thisbk.value.amount = 0
  thisbk.value.liters = 0
  thisbk.value.consumption = 0
  thisbk.value.fuelPriceInEuro = 0
  thisbk.value.key = ''

  if (bookingtype.value === 'Tanken') {
    thisbk.value.amount = +amount.value // input value is a string
    thisbk.value.liters = +liters.value // input value is a string
    thisbk.value.fuelPriceInEuro = thisbk.value.amount / thisbk.value.liters
    thisbk.value.consumption = consumption.calculateConsumption(thisbk.value.liters, thisbk.value.kmSinceLastFuelFill)
    const kmDrivenWithLiters = thisbk.value.liters / (consumption.averageConsumption.value / 100)
    thisbk.value.kmSinceLastFuelFill = vollgetankt.value
      ? 0
      : lastbk.value.kmSinceLastFuelFill + thisbk.value.kmSinceLastEntry - kmDrivenWithLiters
    return
  }

  if (bookingtype.value === 'Sonstiges') {
    thisbk.value.amount = +amount.value
    return
  }

  if (bookingtype.value === 'Ausgleichszahlung') {
    thisbk.value.amount = +amount.value
    thisbk.value.key = recipient.value ? `an: ${recipient.value}` : ''
  }
}

// Computed Property für die Validierung des aktuellen Eintrags
const validationResult = computed(() => {
  const bk = thisbk.value
  const bt = bookingtype.value
  syncBookingTypeData()

  if (bt === 'Fahrt') {
    return validateFahrt(bk, km.withinRange(+lastbk.value.km))
  }

  if (bt === 'Tanken') {
    return validateTanken(bk, km.withinRange(+lastbk.value.km), consumption.averageConsumption.value, vollgetankt.value, nachtrag.value)
  }

  if (bt === 'Sonstiges') {
    return validateSonstiges(bk)
  }

  if (bt === 'Ausgleichszahlung') {
    return validateAusgleichszahlung(bk, recipient.value, gesellschafter.value)
  }

  return { ok: false, result: 'Unbekannter Buchungstyp' }
})

const od = thisbk.value.description
const description = computed(() => buildDescription(
  bookingtype.value,
  {
    kmSinceLastEntry: thisbk.value.kmSinceLastEntry,
    originalDescription: od,
    isVollgetankt: vollgetankt.value,
    isNachtrag: nachtrag.value,
    recipient: bookingtype.value === 'Ausgleichszahlung' ? recipient.value : undefined
  }
))


/* ========== on submit ========== */
const onSubmit = async () => {
  logd("fahrtenbucheintrag.vue onSubmit: ")
  lastSubmitted.value = ""

  thisbk.value.date = thisbk.value.date.toString()
  thisbk.value.kmSinceLastEntry = bookingtype.value === 'Ausgleichszahlung'
    ? 0
    : thisbk.value.km - lastbk.value.km

  if (bookingtype.value === 'Tanken') {
    thisbk.value.liters = +((document.querySelector('input[name="liters"]') as HTMLInputElement)?.value || 0)
  }

  syncBookingTypeData()

  const od = thisbk.value.description
  thisbk.value.description = description.value

  console.log('onSubmit', thisbk.value)

  if (validationResult.value.ok) {
    lastSubmitted.value += thisbk.value.description + "<br>" + JSON.stringify(thisbk.value)

    // now append the booking to the backend
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
    const kmSinceLastFuelFill = bookingtype.value === 'Tanken'
      ? (vollgetankt.value
        ? 0
        : lastbk.value.kmSinceLastFuelFill - +liters.value / (100 * consumption.averageConsumption.value))
      : lastbk.value.kmSinceLastFuelFill

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
