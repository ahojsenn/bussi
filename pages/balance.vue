<template lang="pug">
div 
  YearSwitch 
  h1 Bilanz {{ perioden.currentPeriod }}, {{ allBookingsOfPeriod.length }} Buchungen
  div(v-if="bs.findAccount('Bussi', 'Errors').bookings.length > 0") 
    a.errors(href='#' @click="selectToRender(bs.findAccount('Bussi', 'Errors') )")  Errors:  {{ bs.findAccount('Bussi', 'Errors').bookings.length  }}

  div Kilometer: {{ allKm() }} km
  div Benzin: {{ allLiter() }} Liter
  div CO2: {{ tonnenCO2() }} Tonnen CO2  
  div Verbrauch: {{ verbrauchOverall() }} Liter/100km
  div Reparaturpauschale: {{perioden.reparaturpauschale(perioden.currentPeriod)}} €/km
  div &nbsp;

  div(v-if="toRender.bookings.length != 0") 
    .center
      button.green(@click="resetToRender()" ) hit ⌘+&ltEnter&gt  to go back
      div(v-if="toRender.bookings.length>0")
      Table(:selectedBookingsToRender="toRender.bookings" :konto="toRender.name" )

  div(v-else)
    table
      tbody
        tr(v-for="sh in stakeholderNames")
          td {{ sh }}
            a(href="#" @click="selectToRender(bs.findAccount(sh,'Kilometer'))") 
              div Kilometer: {{ Math.abs(bs.findAccount(sh, 'Kilometer').saldoY(perioden.currentPeriod)) }} km
            div 
              b Saldo: {{ bs.saldierenEuro(sh) }} €
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
                    a(href="#" @click="selectToRender(bs.findAccount(sh,a.Name))") 
                      span {{ a.Bezeichnung }} 
                    span  &nbsp;&nbsp;&nbsp;&nbsp;
                  td.inner {{ bs.findAccount(sh, a.Name).bookings.length }} 
                  td.inner {{ bs.findAccount(sh, a.Name).saldoY(perioden.currentPeriod) }} {{accountStore.getEinheitByName(a.Name) || "€"}}
                  td.inner.grey {{ bs.findAccount(sh, a.Name).saldoSoll(perioden.currentPeriod) }} €
                  td.inner.grey {{ bs.findAccount(sh, a.Name).saldoHaben(perioden.currentPeriod) }} €        
  br            
  br
</template>

<script setup lang="ts">
import { reactive, onMounted, computed} from 'vue'
import {Account, HauptbuchBooking} from '../types'
import { AccountSystemClass, useAccountSystemStore } from '../stores/accountSystem'
import { Booking } from '../types'
import {book} from '../composables/book'
import logd from '../utils/logDebug';
import {bookEverythingtoBS} from '../composables/bookEverythingtoBS'
import { bookingIsTanken,euroString, twoDigits } from '../composables/bookingHelpers';



const toRender =  reactive({
  bookings: [] as Array<Booking>,
  name: "",
})

const selectToRender = (account: Account) => {
  let cumulative = 0;
  const bkngs = account.bookings.map(booking => {
    cumulative += booking.haben - booking.soll;
    return {
      ...booking,
      saldo: Math.round(cumulative * 100) / 100
    };
  });

  // toRender.bookings.splice(0, toRender.bookings.length)
  toRender.bookings = [] // clear the array reactively  
  toRender.bookings.push(...bkngs)
  toRender.name = account.owner + " " + account.name
}
const resetToRender = () => {
  toRender.bookings = []
  toRender.name = ""
} 

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
const allBookingsOfPeriod = asStore.accountSystem?.hbStore?.bookings || []

let bs = asStore.accountSystem 
const perioden = computed(() => bs?.periodenStore || [] )
const currentPeriod = computed(() => bs?.periodenStore?.currentPeriod)

const ERRORS = bs?.findAccount("System", "Errors") 


/* now we have all bookings of the current period */
if (!bs) {
  logd("Error: account system is not initialized")
} else if (!ERRORS) {
  logd("Error: Errors account not found in account system")
} else if (!pStore ) {
  logd("Error: perioden not found in account system")
} else if (!shStore) {
  logd("Error: shStore not found in account system")
} else {
  logd("allBookingsOfPeriod ", allBookingsOfPeriod)
  const rawBS = toRaw(bs)
  bs = bookEverythingtoBS(rawBS)
  // balanceKonto1(bs, allBookingsOfPeriod, shStore, perioden)
  balanceSalden(bs, allBookingsOfPeriod, shStore, perioden)
  logd("bs after bookEverythingtoBS and balance: ", bs)
}

const allKm = () => bs?.findAccount('Bussi', 'Kilometer').saldoY(currentPeriod.value || '') || -1
const allLiter = () => Math.round(allBookingsOfPeriod.reduce((acc, b) => acc + liter(b), 0))
const tonnenCO2 = () => Math.round(100*allLiter() * 2.37/1000)/100
const verbrauchOverall = () => Math.round(allLiter() / allKm() *10000)/100  
const liter = (b: HauptbuchBooking): number => bookingIsTanken(b) ? +(((b.liters || 0)+"").replace('l', '').trim().replace(',', '.')) : 0



logd("bs after bookEverythingtoBS", bs)

function balanceKonto1(bs: AccountSystemClass, allBookingsOfPeriod: Array<HauptbuchBooking>, shStore: any, perioden: any) {
    //logd("bookEverythingToBS. Verteilung Konto 1 auf ", shStore.personen)
    const to = bs.findAccount("Bussi", "Konto 1")
    const amount = twoDigits(-to.saldoY(perioden.currentPeriod) / shStore.personen.length)
    // if the amount is zero we don't have to do anything
    if (amount === 0) return bs
    // otherwise we have to book the amount to each person
    for (var tn of shStore.personen) {
      const from = bs.findAccount(tn, "Konto 1")
      const b = new Booking("9999", perioden.currentPeriod + "-12-31", amount, 0,
        "Ausgleichsbuchung Konto1 " + perioden.currentPeriod + " " + from.owner + ":" + from.name + " -> " + to.owner + ":" + to.name)
      book(b, from, to)
      //    logd("bookEverythingToBS. Verteilung Konto 1 auf ", tn, shStore.personen.length)
    }
    return bs
  }


// Balance the Salo of all stakeholders (ot Bussi) to equal anc compensate the Bussi Saldo
function balanceSalden (bs: AccountSystemClass, allBookingsOfPeriod_old: Array<HauptbuchBooking>, shStore_old: any, perioden_old: any) {
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
  // book salden betwee4n personen until all salden of personen are equal
  // start with the person with the lowest saldo that absolute value is  lowwer thatn the highest saldo
  let maxIterations = 100
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
    const b = new Booking("9999",cp +"-12-31" , amount, 0, text)
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