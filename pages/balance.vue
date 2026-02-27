<template lang="pug">
div 
  YearSwitch 
  h1 Bilanz {{ perioden.currentPeriod }}, {{ allBookingsOfPeriod.length }} Hauptbuchbuchungen
  div(v-if="asStore.accountSystem.findAccount('Bussi', 'Errors').bookings.length > 0") 
    a.errors(href='#' @click="selectToRender(asStore.accountSystem.findAccount('Bussi', 'Errors') )")  Errors:  {{ asStore.accountSystem.findAccount('Bussi', 'Errors').bookings.length  }}

  div Kilometer: {{ formatKm(kmByStakeholderAndPeriod('Bussi', perioden.currentPeriod)) }}
  div Benzin: {{ formatLiter(allLiter()) }}
  div CO2: {{ formatCO2(tonnenCO2()) }}  
  div Verbrauch: {{ formatConsumption(verbrauchOverall()) }}
  div Reparaturpauschale: {{perioden.reparaturpauschale(perioden.currentPeriod)}} €/km
  div &nbsp;

  div(v-if="toRender.bookings.length != 0") 
    .center
      button.green(@click="resetToRender()" ) hit ⌘+&ltEnter&gt  to go back
      div Konto.id: {{ toRender.account.id.toLocaleString('de-DE') }}
      div Konto: {{ toRender.name }} {{ toRender.bookings.length }} Buchungen
      Table(:selectedBookingsToRender="toRender.bookings" :konto="toRender.name" )

  div(v-else)
    table
      tbody
        tr(v-for="sh in stakeholderNames")
          td {{ sh }}
            a(href="#" @click="selectToRender(asStore.accountSystem.findAccount(sh,'Kilometer'))") 
              div {{formatKm(kmByStakeholderAndPeriod(sh, perioden.currentPeriod))}}
            div 
              b Saldo: {{ formatEuro(asStore.accountSystem.saldierenEuro(sh)) }}
          td 
            table.inner(:style="{width: '100%'}")
              tbody
                tr
                  th.inner Kontobezeichnung 
                  th.innter #Buchungen
                  th.inner Saldo 
                  th.inner.grey Soll
                  th.inner.grey Haben
                tr.inner(v-for="a in accounts.filter(acc => (acc.Name !== 'Kilometer') && ((acc.Name !== 'Konto 9000') || (sh === 'Bussi'))) " )
                  td.inner
                    a(href="#" @click="selectToRender(asStore.accountSystem.findAccount(sh,a.Name))") 
                      span {{ a.Bezeichnung }} 
                    span  &nbsp;&nbsp;&nbsp;&nbsp;
                  td.inner {{ asStore.accountSystem.findAccount(sh, a.Name).bookings.length }} 
                  td.inner {{ asStore.accountSystem.saldoByAccountAndPeriod(sh, a.Name, perioden.currentPeriod) }} {{accountStore.getEinheitByName(a.Name) || "€"}}
                  td.inner.grey {{ asStore.accountSystem.findAccount(sh, a.Name).saldoSoll(perioden.currentPeriod) }} €
                  td.inner.grey {{ asStore.accountSystem.findAccount(sh, a.Name).saldoHaben(perioden.currentPeriod) }} €        
  br            
  br
</template>

<script setup lang="ts">
import { reactive, onMounted, computed} from 'vue'
import {Account, HauptbuchBooking} from '@/types'
import { AccountSystemClass, useAccountSystemStore } from '../stores/accountSystem'
import { Booking } from '@/types'
import {book} from '../composables/book'
import logd from '../utils/logDebug';
import {bookEverythingtoBS} from '../composables/bookEverythingtoBS'
import { bookingIsTanken,euroString, twoDigits } from '../composables/bookingHelpers';



// 1. Wir speichern nur, WELCHES Konto ausgewählt wurde (die Referenz)
const selectedAccount = ref<Account | null>(null)

// 2. Das reaktive Objekt wird zum Computed
const toRender = computed(() => {
  const account = selectedAccount.value
  const period = asStore.accountSystem?.periodenStore?.currentPeriod
  
  if (!account || !period) {
    return { bookings: [], name: "", account: account }
  }

  // Filterung anwenden (wir nutzen deine Logik von gBbAaP)
  const filtered = filterBookingsByPeriod.value(account.bookings, period)

  // Saldo-Berechnung (Kumulativ für die gefilterte Liste)
  let cumulative = 0
  const bookingsWithSaldo = filtered.map(booking => {
    cumulative += booking.haben - booking.soll || 0
    return {
      ...booking,
      saldo: Math.round(cumulative * 100) / 100
    }
  })
  logd("toRender: account ", account.name, " period ", period, " bookingsWithSaldo ", bookingsWithSaldo)
  return {
    bookings: bookingsWithSaldo,
    name: `${account.id} ${account.owner} ${account.name}`,
    account: account 
  }
})

// 3. Die Funktionen zum Steuern werden ganz einfach
const selectToRender = (account: Account) => {
  selectedAccount.value = account
}

const resetToRender = () => {
  selectedAccount.value = null
} 

// get bookings of an account by period like in hauptbuch.vue
const filterBookingsByPeriod = computed(() => (bookings: any[], period: string) : Array<any> => {
  let r = bookings
  // logd("filterBookingsByPeriod: period= ", period, " bookings.length= ", bookings.length, bookings[1])
  // period cound be "2024", "2024-Q1", "alles bis 2025", "alles bis 2024-Q3", "2024-Q2 bis 2024-Q4" etc.
  // if 'period' contains 'alles bis' then filter out all rows after the given date
  if (period && period.indexOf('bis') > 0) {
    const date = period.split('bis')[1].trim()
    r = bookings.filter((e: any) => e.date.substring(0, 4) <= date)
  } else if (isNaN(Number(period))) {    
    // ignore the selector and do not filter, i.e. take all values
  }else {
    r = bookings.filter((e: any) => e.date.substring(0, 4) === period)
  }
  return r
})  


// Apple + Enter to reset the Table view
onMounted(() => {window.addEventListener('keydown', (e)=>{if (e.key === 'Enter' && e.metaKey) resetToRender()}) })

// define the stores
const asStore = useAccountSystemStore()

// load the store data
if (!asStore.accountSystem) {
  await asStore.initAS()
}
const shStore = asStore.accountSystem?.shStore
const pStore = asStore.accountSystem?.periodenStore
const stakeholder =  computed(() => shStore?.stakeholder || [])
const accountStore = computed(() => asStore.accountSystem?.aStore || [])
const accounts = computed(() =>  asStore.accountSystem?.aStore?.accounts || [])  
const stakeholderNames = shStore?.verteilungPersonen
const allBookingsOfPeriod = computed(() => {
  const r = asStore.accountSystem?.hbStore?.bookings || []
  return filterBookingsByPeriod.value(r, asStore.accountSystem?.periodenStore?.currentPeriod || "")
  })    

const sourceBS = toRaw(asStore.accountSystem)

const perioden = computed(() => sourceBS?.periodenStore || [] )
const currentPeriod = computed(() => sourceBS?.periodenStore?.currentPeriod)

const ERRORS = asStore.accountSystem?.findAccount("System", "Errors") 


/* now we have all bookings of the current period */
if (!sourceBS) {
  logd("Error: account system is not initialized")
} else if (!ERRORS) {
  logd("Error: Errors account not found in account system")
} else if (!pStore ) {
  logd("Error: perioden not found in account system")
} else if (!shStore) {
  logd("Error: shStore not found in account system")
} else {
  logd("allBookingsOfPeriod ", allBookingsOfPeriod)
  const calculatedBS = bookEverythingtoBS(sourceBS)
  balanceSalden(calculatedBS)
  logd("bs after bookEverythingtoBS and balance: ", calculatedBS)

  // 3. Markiere das Ergebnis als 'Raw', falls du verhindern willst, 
  // dass Vue JEDES Unterobjekt tiefen-beobachtet (Performance-Boost)
  const finalBS = markRaw(calculatedBS)

  // 4. Erst jetzt den Store aktualisieren -> Trigger nur 1x die UI
  asStore.accountSystem = finalBS
}

const allKm = () => asStore.accountSystem?.findAccount('Bussi', 'Kilometer').saldoY(currentPeriod.value || '') || -1

// berechne die km für einen stakeholder und einen Zeitraum, z.B. 2024 oder 2024-Q1 oder "alles bis 2024-Q3"
const kmByStakeholderAndPeriod = (stakeholder: string, period: string) : number => {
  const account = asStore.accountSystem?.findAccount(stakeholder, 'Kilometer')
  if (!account) return -1
  const bookings = filterBookingsByPeriod.value(account.bookings, period)
  return Math.abs(bookings.reduce((acc, cv:Booking) => acc + cv.quantity, 0))
}


const allLiter = () => Math.round(allBookingsOfPeriod.value.reduce((acc, b) => acc + liter(b), 0))
const tonnenCO2 = () => Math.round(100*allLiter() * 2.37/1000)/100
const verbrauchOverall = () => Math.round(allLiter() / allKm() *10000)/100  
const liter = (b: HauptbuchBooking): number => bookingIsTanken(b) ? +(((b.liters || 0)+"").replace('l', '').trim().replace(',', '.')) : 0



// Balance the Salo of all stakeholders (ot Bussi) to equal anc compensate the Bussi Saldo
function balanceSalden (bs: AccountSystemClass) {
  const shStore = bs.shStore
  const perioden = bs.periodenStore?? []
  const allBookingsOfPeriod = bs.hbStore?.bookings || []

  // logd("balanceSalden. allBookingsOfPeriod ", allBookingsOfPeriod)
  const bussiSaldo =  bs.saldierenEuro("Bussi")
  const zeroIfNegative = (x: number) => x < 0 ? 0 : x
  // create an array of all stakeholders with their rest to pay (saldo - 1/n * bussiSaldo)
  const stakeholdersSaldo = shStore?.personen.map((e: string) => {
    const saldo = bs.saldierenEuro(e)+bussiSaldo/shStore.personen.length
    return {name: e, saldo: saldo}
  }) || []
  // logd("balanceSalden. stakeholdersSaldo ", stakeholdersSaldo)
  // book salden between personen until all salden of personen are equal
  // start with the person with the lowest saldo that absolute value is  lowwer thatn the highest saldo
  let maxIterations = 10
  while (true && maxIterations-- > 0) {
    const min = stakeholdersSaldo.reduce((acc: any, e: any) => acc.saldo < e.saldo ? acc : e)
    const max = stakeholdersSaldo.reduce((acc: any, e: any) => acc.saldo > e.saldo ? acc : e)
    if (min.saldo >= 0.01) break // all salden are equal, but tolerate a one cent difference
    if (max.saldo <= 0.01) break // all salden are equal, but tolerate a one cent difference
    const amount = Math.min(-min.saldo, max.saldo)
    const to = bs.findAccount(max.name, "Ausgleichskonto")
    const from = bs.findAccount(min.name, "Ausgleichskonto")
    const cp = bs.periodenStore?.currentPeriod || "unknown period"
    const text = "Ausgleichsbuchung Salden "
      +"<br>"+cp+" "+from.owner+":"+from.name +" -> "+to.owner+":"+to.name
      +"<br>Amount: "+euroString(amount)
      +"<br>konkret:  "+from.owner+ " bekommt "+euroString(amount)+" von "+to.owner

    const b = new Booking("9999",cp +"-12-31", 0, 0, text, amount, 0, from.id, to.id)

    book (b, from, to )
    min.saldo += amount
    max.saldo -= amount
    //logd("balanceSalden. min ", min, "max ", max)
  }
  return bs
}
</script>


<style scoped>
.grey {
  color: grey;
  border-radius: 6px;
  border-width: 0px;
}
th {
  font-weight: normal;
}
.inner {
  background-color: rgba(0,0,0,0) !important;
  border-radius: 6px;
}

.z100z {
  width: 40em;
}

.green{
  background-color: green;
  color: yellow;
  border-radius: 6px;
  border-width: 0px;
}

.errors {
  background-color: red;
  color: yellow;
  border-radius: 6px;
  border-width: 0px;}

</style>