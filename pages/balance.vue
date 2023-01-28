<template lang="pug">
div 
  YearSwitch 
  h1 Bilanz {{ perioden.currentPeriod }}, {{ allBookingsOfPeriod.length }} Buchungen  
  div(v-if="bs.findAccount('Bussi', 'Errors') .bookings.length > 0") 
    a.errors(href='#' @click="selectToRender(bs.findAccount('Bussi', 'Errors') )")  Errors:  {{ bs.findAccount('Bussi', 'Errors') .bookings.length  }}

  div Kilometer: {{ allKm() }} km
  div Benzin: {{ allLiter() }} Liter
  div CO2: {{ tonnenCO2() }} Tonnen CO2  
  div Verbrauch: {{ verbrauchOverall() }} Liter/100km
  div Reparaturpauschale: {{perioden.reparaturpauschale("2022")}}€
  div &nbsp;

  div(v-if="toRender.bookings.length != 0") 
    .center
      button.green(@click="resetToRender()" ) hit ⌘+&ltEnter&gt  to go back
      div(v-if="toRender.bookings.length>0")
      Table(:selectedBookingsToRender="toRender.bookings" :konto="toRender.name" )

  div(v-else)
    table 
      tr(v-for="sh in stakeholderNames")
        td {{ sh }}
          a(href="#" @click="selectToRender(bs.findAccount(sh,'Kilometer'))") 
            div Kilometer: {{ bs.findAccount(sh, 'Kilometer').saldoY(perioden.currentPeriod) }} km
            div Saldo: {{ bs.saldierenEuro(sh) }} €
        td 
          table.inner(:style="{width: '100%'}")
            th.inner.z100z Kontobezeichnung 
            th.inner(:style="{width: '25%'}") Saldo 
            tr.inner(v-for="a in accountStore.accounts.filter(acc =>  acc.Name !== 'Kilometer')" )
              td.inner
                a(href="#" @click="selectToRender(bs.findAccount(sh,a.Name))") 
                  span {{ shorten(a.Bezeichnung) }} 
              td.inner {{ bs.findAccount(sh, a.Name).saldoY(perioden.currentPeriod) }}  
            
              

              
 
     
</template>

<script setup lang="ts">
import { useStakeholderStore } from '../stores/stakeholder'
import {Account, BussiAccountSystem, HauptbuchBooking} from '../mixins/types'
import { useHauptbuchStore } from '../stores/hauptbuch'
import { useBuchungenStore } from '../stores/buchungen'
import {usePeriodenStore} from '../stores/perioden'
import { Booking } from '../mixins/types'
import {book} from '../mixins/book'
import logd from '../mixins/logDebug';
import { useAccountsStore } from '../stores/accounts'
import { reactive, onMounted,watch, getCurrentInstance, ref} from 'vue'
import * as R  from 'ramda'
import {bookEverythingtoBS} from '../mixins/bookEverythingtoBS'
//import { useRoute } from 'vue-router'

// helpers ...
const shorten = (s: string) => s.length > 60 ? s.substr(0,60) + '...' : s


const toRender =  reactive({
  bookings: [] as Array<Booking>,
  name: "",
})
const selectToRender = (account: Account) => {
  const bkngs = account.bookings
  toRender.bookings.splice(0, toRender.bookings.length)
  toRender.bookings.push(...bkngs)
  toRender.name = account.owner + " " + account.name
}
const resetToRender = () => {
  toRender.bookings = []
  toRender.name = ""
} 

// Apple + Enter to reset the Table view
onMounted(() => {window.addEventListener('keydown', (e)=>{if (e.key === 'Enter' && e.metaKey) resetToRender()}) })


const shStore = useStakeholderStore()
await shStore.loadStakeholder()
const stakeholderNames = shStore.stakeholder.filter(e => e.Verteilung.indexOf(',') === -1).map(k => k.Verteilung)
/* now wwe know all the stakeholders */

/* load perioden and hauptbuch data */
const perioden = usePeriodenStore()
await perioden.loadDataFromGoogle()
logd("balance.currentPeriod ", perioden.currentPeriod, perioden)
const hauptbuch = useHauptbuchStore()
// await hauptbuch.loadBussiData(perioden.currentPeriod)
/* now all Hauptbuch bookings are available */

const accountStore = useAccountsStore()
await accountStore.loadDataFromGoogle()
const accountBezeichnungen = accountStore.accountBezeichnungen
const accountNames = accountStore.accountNames
let allBookingsOfPeriod = reactive(hauptbuch.bookings) 
let bs = reactive(new BussiAccountSystem(stakeholderNames, accountNames, allBookingsOfPeriod)) 
const ERRORS = bs.findAccount("System", "Errors") 
/*now we have an bussi accountsystem */

const vueInstance = getCurrentInstance()

watch(
  // reload the whole dammned thing
  perioden.$state , async (previous, current) => {
  //logd('bilanz.watch.perioden changed', perioden.currentPeriod )
  // empty the bs object
  await hauptbuch.loadBussiData(perioden.currentPeriod)
  allBookingsOfPeriod = reactive(hauptbuch.bookings) 
  bs = new BussiAccountSystem(stakeholderNames, accountNames, allBookingsOfPeriod)
  bs = bookEverythingtoBS(bs, allBookingsOfPeriod, shStore, perioden)
  bs = balanceKonto1(bs, allBookingsOfPeriod, shStore, perioden)
  vueInstance.proxy.$forceUpdate()
  //logd("watch: bs after reload, allBookingsOfPeriod.lenght= ", allBookingsOfPeriod.length)
})


/* now we have all bookings of the current period */



const allKm = () => bs.findAccount('Bussi', 'Kilometer').saldoY(perioden.currentPeriod)
const allLiter = () => Math.round(allBookingsOfPeriod.reduce((acc, b) => acc + liter(b), 0))
const tonnenCO2 = () => Math.round(100*allLiter() * 2.37/1000)/100
const verbrauchOverall = () => Math.round(allLiter() / allKm() *10000)/100  
const liter = (b: HauptbuchBooking): number => bookingIsTanken(b) ? +b.liters.replace('l', '').trim().replace(',', '.') : 0
const bookingIsTanken = (booking: HauptbuchBooking) => +(booking.kmSinceLastFuelFill || "0") !== 0 || "Tanken".indexOf(booking.description) > 0


//bs = bookEverythingtoBS(bs, allBookingsOfPeriod, shStore, perioden.currentPeriod)

logd("bs after bookEverythingtoBS", bs)
const balanceKonto1 = (bs: BussiAccountSystem, allBookingsOfPeriod: Array<HauptbuchBooking>, shStore: any, perioden: any) => {
 //logd("bookEverythingToBS. Verteilung Konto 1 auf ", shStore.personen)
  const from = bs.findAccount("Bussi", "Konto 1")
  const amount = from.saldoY(perioden.currentPeriod)/shStore.personen.length
  for (var tn of shStore.personen) {
    const to = bs.findAccount(tn, "Ausgleichskonto")
    const b = new Booking("9999",perioden.currentPeriod+"-12-31" , amount, 0, 
    "Ausgleichsbuchung Konto1 "+perioden.currentPeriod+" "+from.owner+":"+from.name +" -> "+to.owner+":"+to.name)
    book (b, from, to )
//    logd("bookEverythingToBS. Verteilung Konto 1 auf ", tn, shStore.personen.length)
  }
  return bs
}

// now we have to balance the accounts
//bs = balanceKonto1(bs, allBookingsOfPeriod, shStore, perioden)


</script>
<style scoped>
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