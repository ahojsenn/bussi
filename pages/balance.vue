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
  div Reparaturpauschale: {{perioden.reparaturpauschale(perioden.currentPeriod)}}€
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
            div Kilometer: {{ Math.abs(bs.findAccount(sh, 'Kilometer').saldoY(perioden.currentPeriod)) }} km
          div 
            b Saldo: {{ bs.saldierenEuro(sh) }} €
        td 
          table.inner(:style="{width: '100%'}")
            th.inner Kontobezeichnung 
            th.innter #Buchungen
            th.inner Saldo 
            th.inner.grey Soll
            th.inner.grey Haben
            tr.inner(v-for="a in accountStore.accounts.filter(acc => (acc.Name !== 'Kilometer') && ((acc.Name !== 'Konto 9000') || (sh === 'Bussi'))) " )
              td.inner
                a(href="#" @click="selectToRender(bs.findAccount(sh,a.Name))") 
                  span {{ a.Bezeichnung }} 
                span  &nbsp;&nbsp;&nbsp;&nbsp;
              td.inner {{ bs.findAccount(sh, a.Name).bookings.length }} 
              td.inner {{ bs.findAccount(sh, a.Name).saldoY(perioden.currentPeriod) }} €
              td.inner.grey {{ bs.findAccount(sh, a.Name).saldoSoll(perioden.currentPeriod) }} €
              td.inner.grey {{ bs.findAccount(sh, a.Name).saldoHaben(perioden.currentPeriod) }} €        
  br            
  br
</template>

<script setup lang="ts">
import { useStakeholderStore } from '../stores/stakeholder'
import {Account, BussiAccountSystem, HauptbuchBooking} from '../mixins/types'
import { useHauptbuchStore } from '../stores/hauptbuch'
import {usePeriodenStore} from '../stores/perioden'
import { Booking } from '../mixins/types'
import {book} from '../mixins/book'
import logd from '../mixins/logDebug';
import { useAccountsStore } from '../stores/accounts'
import { reactive, onMounted,watch, getCurrentInstance, ref} from 'vue'
import {bookEverythingtoBS} from '../mixins/bookWithBuchungsLogik'
import { bookingIsTanken, whoHasDrivenHowManyKmSinceLastFill,euroString, twoDigits } from '../mixins/bookingHelpers';


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
  // konto 2 is not balanced
  // bs = balanceKonto3(bs, allBookingsOfPeriod, shStore, perioden)
  bs = balanceSalden(bs, allBookingsOfPeriod, shStore, perioden)
  if (vueInstance && vueInstance.proxy) vueInstance.proxy.$forceUpdate()
  toRender.bookings = []
  toRender.name = ""
  //logd("watch: bs after reload, allBookingsOfPeriod.lenght= ", allBookingsOfPeriod.length)
})


/* now we have all bookings of the current period */



const allKm = () => bs.findAccount('Bussi', 'Kilometer').saldoY(perioden.currentPeriod)
const allLiter = () => Math.round(allBookingsOfPeriod.reduce((acc, b) => acc + liter(b), 0))
const tonnenCO2 = () => Math.round(100*allLiter() * 2.37/1000)/100
const verbrauchOverall = () => Math.round(allLiter() / allKm() *10000)/100  
const liter = (b: HauptbuchBooking): number => bookingIsTanken(b) ? +b.liters.replace('l', '').trim().replace(',', '.') : 0


//bs = bookEverythingtoBS(bs, allBookingsOfPeriod, shStore, perioden.currentPeriod)

logd("bs after bookEverythingtoBS", bs)
const balanceKonto1 = (bs: BussiAccountSystem, allBookingsOfPeriod: Array<HauptbuchBooking>, shStore: any, perioden: any) => {
 //logd("bookEverythingToBS. Verteilung Konto 1 auf ", shStore.personen)
  const to = bs.findAccount("Bussi", "Konto 1")
  const amount = twoDigits(-to.saldoY(perioden.currentPeriod)/shStore.personen.length)
  // if the amount is zero we don't have to do anything
  if (amount === 0) return bs
  // otherwise we have to book the amount to each person
  for (var tn of shStore.personen) {
    const from = bs.findAccount(tn, "Konto 1")
    const b = new Booking("9999",perioden.currentPeriod+"-12-31" , amount, 0,
    "Ausgleichsbuchung Konto1 "+perioden.currentPeriod+" "+from.owner+":"+from.name +" -> "+to.owner+":"+to.name)
    book (b, from, to )
//    logd("bookEverythingToBS. Verteilung Konto 1 auf ", tn, shStore.personen.length)
  }
  return bs
}

/*
// balance Konto2 to tho whoever has driven since the last fuel up
const balanceKonto2 =  (bs: BussiAccountSystem, allBookingsOfPeriod: Array<HauptbuchBooking>, shStore: any, perioden: any) => {
  const kmSinceLastFill = whoHasDrivenHowManyKmSinceLastFill(allBookingsOfPeriod, shStore)
  //logd("balanceKonto2. kmSinceLastFill ", kmSinceLastFill)
  const allKmSinceLastFill = Object.values(kmSinceLastFill).reduce((acc: number, e: number) => acc + e, 0)  
  //logd("balanceKonto2. allKmSinceLastFill ", allKmSinceLastFill)
  // distribute the Saldo of Bussi Konto 2 to the people according to kmSinceLastFill
  const from = bs.findAccount("Bussi", "Konto 2")
  const saldo = from.saldoY(perioden.currentPeriod)
  if (saldo === 0) return bs // do not work for nothing
  let rest = saldo
  Object.entries(kmSinceLastFill).map((e: any) => {
    //logd("balanceKonto2. e ", e, e[0], e[1])
    if (e[1] === 0) return // no km driven
    const to = bs.findAccount(e[0], "Konto 2")
    let amount = Math.round(100*saldo * e[1] / allKmSinceLastFill)/100
    rest -= amount
    //logd("balanceKonto2. amount ", amount, "rest ", rest)
    if (Math.abs(rest) < 0.02) amount += Math.round(rest*100)/100
    const Buchungstext = "Ausgleichsbuchung Konto2 "+perioden.currentPeriod+" für am Jahresende nicht vollgetankte Kilometer<br>"
      +" "+e[1]+"km von "+allKmSinceLastFill+"km * "+saldo+ "€<br>"
      +from.owner+":"+from.name +" -> "+to.owner+":"+to.name 
      + "<br> Amount: "+amount
    const b = new Booking("9999",perioden.currentPeriod+"-12-31" , amount, 0, Buchungstext) 
    book (b, from, to )
  })
}
*/
/*
// balance Konto 3 according to the km driven
const balanceKonto3 = (bs: BussiAccountSystem, allBookingsOfPeriod: Array<HauptbuchBooking>, shStore: any, perioden: any) => {
  logd("balanceKonto3. allBookingsOfPeriod ", allBookingsOfPeriod)
  const to = bs.findAccount("Bussi", "Konto 3")
  const saldo = -to.saldoY(perioden.currentPeriod)
  const allKm = bs.findAccount('Bussi', 'Kilometer').saldoY(perioden.currentPeriod)
  // if the amount is zero we don't have to do anything
  if (saldo === 0) return bs
  // otherwise we have to book the amount to each person
  for (var tn of shStore.personen) {
    const kmOfPerson = bs.findAccount(tn, 'Kilometer').saldoY(perioden.currentPeriod)
    const amount = -saldo * kmOfPerson / allKm
    const from = bs.findAccount(tn, "Konto 3")
    const text = "Ausgleichsbuchung Konto3 "
      +"<br>"+perioden.currentPeriod+" "+from.owner+":"+from.name +" -> "+to.owner+":"+to.name
      +"<br>Amount: "+euroString(amount)
      +"<br>km: "+kmOfPerson
    const b = new Booking("9999",perioden.currentPeriod+"-12-31" , amount, 0, text)
    book (b, from, to )
//    logd("bookEverythingToBS. Verteilung Konto 1 auf ", tn, shStore.personen.length)
  }

  return bs
}
*/

// now we have to balance the accounts
//bs = balanceKonto1(bs, allBookingsOfPeriod, shStore, perioden)

// Balance the Salo of all stakeholders (ot Bussi) to equal anc compensate the Bussi Saldo
const balanceSalden = (bs: BussiAccountSystem, allBookingsOfPeriod: Array<HauptbuchBooking>, shStore: any, perioden: any) => {
  // logd("balanceSalden. allBookingsOfPeriod ", allBookingsOfPeriod)
  const bussiSaldo =  bs.saldierenEuro("Bussi")
  const zeroIfNegative = (x: number) => x < 0 ? 0 : x
  // create an array of all stakeholders with their rest to pay (saldo - 1/n * bussiSaldo)
  const stakeholdersSaldo = shStore.personen.map((e: string) => {
    const saldo = bs.saldierenEuro(e)+bussiSaldo/shStore.personen.length
    return {name: e, saldo: saldo}
  })
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
    const from = bs.findAccount(max.name, "Ausgleichskonto")
    const to = bs.findAccount(min.name, "Ausgleichskonto")
    const text = "Ausgleichsbuchung Salden "
      +"<br>"+perioden.currentPeriod+" "+from.owner+":"+from.name +" -> "+to.owner+":"+to.name
      +"<br>Amount: "+euroString(amount)
      +"<br>konkret:  "+from.owner+ " bekommt "+euroString(amount)+" von "+to.owner
    const b = new Booking("9999",perioden.currentPeriod+"-12-31" , amount, 0, text)
    book (b, from, to )
    min.saldo += amount
    max.saldo -= amount
    // logd("balanceSalden. min ", min, "max ", max)
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

</style>../mixins/bookWithBuchungsLogik