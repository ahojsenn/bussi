<template lang="pug">
div 
  YearSwitch 
  h1 Bilanz {{ perioden.currentPeriod }}, {{ allBookingsOfPeriod.length }} Hauptbuchbuchungen
  div(v-if="ERRORS.bookings.length > 0") 
    a.errors(href='#' @click="selectToRender(ERRORS)")  Errors:  {{ ERRORS.bookings.length  }}

  div
    b Saldenausgleich {{ perioden.currentPeriod }}
    table
      tbody
        tr(v-for="s in saldenausgleichSummary" :key="s.owner")
          td.inner {{ s.owner }}
          td.inner.right-align(:class="s.mustPay ? 'muss-zahlen' : 'bekommt'")
            span(v-if="s.mustPay") muss einzahlen: {{ s.amount.toFixed(2) }} €
            span(v-else) bekommt zurück: {{ s.amount.toFixed(2) }} €
  br
  div(v-if="toRender.bookings.length != 0") 
    .center
      button.green(@click="resetToRender()" ) hit ⌘+&ltEnter&gt  to go back
      div Konto.id: {{ toRender.account.id.toLocaleString('de-DE') }}
      div Konto: {{ toRender.name }} {{ toRender.bookings.length }} Buchungen
      Table(:selectedBookingsToRender="toRender.bookings" :konto="toRender.name" )

  div.bilanz-wrapper(v-else)
    // --- LINKE SPALTE: Nur die Gesellschaft ---
    div.left-column
      table.bilanz-table
        tbody
          tr
            th.inner
              b {{ gesellschaft }} Gesellschaft
              div.small
                div km: {{ formatKm(kmByStakeholderAndPeriod(gesellschaft, perioden.currentPeriod)) }} 
                div Benzin: {{ formatLiter(allLiter()) }}
                div CO2: {{ formatCO2(tonnenCO2()) }}  
                div Verbrauch: {{ formatConsumption(verbrauchOverall()) }}
                div Reparaturpauschale: {{ perioden.reparaturpauschale(perioden.currentPeriod) }} €/km
            th.inner 
              b Saldo
        
          tr.inner(
            v-for="a in accounts.filter(acc => (acc.Name !== 'Kilometer') && (gesellschaft === acc.owner) && (acc.bookings.length > 0))"
          )
            td.inner 
              a(href="#" @click="selectToRender(asStore.accountSystem.getAccountById(a.id))") 
                span {{ a.id }} :: {{ a.name }}
                span.small &nbsp;({{ a.bookings.length }})
            td.inner.right-align(v-if="a.unit === '€'") {{ a.saldoPeriod(perioden.currentPeriod) }} €
            td(v-else) &nbsp;

    // --- RECHTE SPALTE: Alle Stakeholder untereinander ---
    div.right-column
      table.bilanz-table(v-for="sh in gesellschafter" :key="sh")
        tbody
          tr
            th.inner
              b Stakeholder {{ sh }}
              div.small km: {{ formatKm(kmByStakeholderAndPeriod(sh, perioden.currentPeriod)) }}
            th.inner 
              b Saldo
        
          tr.inner(
            v-for="a in accounts.filter(acc => (acc.Name !== 'Kilometer') && (sh === acc.owner) && (acc.bookings.length > 0))"
          )
            td.inner 
              a(href="#" @click="selectToRender(asStore.accountSystem.getAccountById(a.id))") 
                span {{ a.id }} :: {{ a.name }}
                span.small &nbsp;({{ a.bookings.length }})
            td.inner.right-align(v-if="a.unit === '€'") {{ a.saldoPeriod(perioden.currentPeriod) }} €
            td(v-else) &nbsp;

  br            
  br
  div
    b Saldenausgleich {{ perioden.currentPeriod }}
    table.bilanz-table
      tbody
        tr(v-for="s in saldenausgleichSummary" :key="s.owner")
          td.inner {{ s.owner }}
          td.inner.right-align(:class="s.mustPay ? 'muss-zahlen' : 'bekommt'")
            span(v-if="s.mustPay") muss einzahlen: {{ s.amount.toFixed(2) }} €
            span(v-else) bekommt zurück: {{ s.amount.toFixed(2) }} €
</template>

<script setup lang="ts">
import { reactive, onMounted, computed } from 'vue'
import { Account, HauptbuchBooking } from '@/types'
import { AccountSystemClass, useAccountSystemStore } from '../stores/accountSystem'
import { usePeriodenStore } from '../stores/perioden'
import { Booking } from '@/types'
import { book } from '../composables/book'
import logd from '../utils/logDebug';
import { bookEverythingtoBS } from '../composables/bookEverythingtoBS'
import { euroString } from '../composables/bookingHelpers';



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
const filterBookingsByPeriod = computed(() => (bookings: any[], period: string): Array<any> => {
  let r = bookings
  // logd("filterBookingsByPeriod: period= ", period, " bookings.length= ", bookings.length, bookings[1])
  // period cound be "2024", "2024-Q1", "alles bis 2025", "alles bis 2024-Q3", "2024-Q2 bis 2024-Q4" etc.
  // if 'period' contains 'alles bis' then filter out all rows after the given date
  if (period && period.indexOf('bis') > 0) {
    const date = period.split('bis')[1].trim()
    r = bookings.filter((e: any) => e.date.substring(0, 4) <= date)
  } else if (isNaN(Number(period))) {
    // ignore the selector and do not filter, i.e. take all values
  } else {
    r = bookings.filter((e: any) => e.date.substring(0, 4) === period)
  }
  return r
})


// Apple + Enter to reset the Table view
onMounted(() => { window.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.metaKey) resetToRender() }) })

// define the stores
const asStore = useAccountSystemStore()
const periodenStore = usePeriodenStore()

// load the store data
if (!asStore.accountSystem) {
  await asStore.initAS()
}
const shStore = asStore.accountSystem?.shStore
const pStore = periodenStore
const stakeholder = computed(() => shStore?.stakeholder || [])
const gesellschaft = computed(() => shStore?.getGesellschaft || "Gesellschaft")
const gesellschafter = computed(() => shStore?.getGesellschafter)

const accounts = computed(() => asStore.accountSystem?.accounts.sort((a, b) => a.id - b.id) || [])
const stakeholderNames = shStore?.verteilungPersonen
const allBookingsOfPeriod = computed(() => {
  const r = asStore.accountSystem?.hbStore?.bookings || []
  return filterBookingsByPeriod.value(r, periodenStore.currentPeriod)
})

const perioden = computed(() => periodenStore)
const currentPeriod = computed(() => periodenStore.currentPeriod)
const companyName = computed(() => shStore?.getGesellschaft || "Gesellschaft")

const ERRORS = asStore.accountSystem?.Errors


watch(
  () => periodenStore.currentPeriod,
  (newPeriod) => {
    if (!newPeriod || !asStore.accountSystem) return;

    const bs = asStore.accountSystem;

    // Remove AB- closing bookings from the source so they are not re-processed
    if (bs.hbStore) {
      bs.hbStore.bookings = bs.hbStore.bookings.filter(b => !b.nr.startsWith("AB-"));
    }

    // bookEverythingtoBS clears all account.bookings internally before rebooking
    bookEverythingtoBS(bs);
    balanceSalden(bs);

    logd(`✅ Bilanz für ${newPeriod} erfolgreich aktualisiert.`);
  },
  { immediate: true }
);

const allKm = () => kmByStakeholderAndPeriod(gesellschaft.value, currentPeriod.value || "")

// berechne die km für einen stakeholder und einen Zeitraum, z.B. 2024 oder 2024-Q1 oder "alles bis 2024-Q3"
const kmByStakeholderAndPeriod = (stakeholder: string, period: string): number => {
  const account = asStore.accountSystem?.findAccount(stakeholder, 'Kilometer')
  if (!account) return -1
  const bookings = filterBookingsByPeriod.value(account.bookings, period)
  return Math.abs(bookings.reduce((acc, cv: Booking) => acc + cv.amount, 0))
}


const allLiter = () => Math.round(allBookingsOfPeriod.value.reduce((acc, b) => acc + b.liters, 0))
const tonnenCO2 = () => Math.round(100 * allLiter() * 2.37 / 1000) / 100
const verbrauchOverall = () => Math.round(allLiter() / allKm() * 10000) / 100

const saldenausgleichSummary = computed(() => {
  if (!asStore.accountSystem) return []
  return asStore.accountSystem.getBalanceSheetAccountsOfStakeholders()
    .filter(a => a.name.includes("Verrechnungskonto"))
    .flatMap(a => {
      const umlageBuchungen = a.bookings.filter(b =>
        b.nr.startsWith("AB-") && b.description.includes("Bilanz-Abschluss: Verrechnungskonto")
      )
      if (umlageBuchungen.length === 0) return []
      const totalSoll = umlageBuchungen.reduce((sum, b) => sum + b.soll, 0)
      const totalHaben = umlageBuchungen.reduce((sum, b) => sum + b.haben, 0)
      const mustPay = totalHaben > totalSoll
      return [{ owner: a.owner, amount: Math.abs(totalSoll - totalHaben), mustPay }]
    })
})




// Returns the last calendar date of a period string, e.g. "2024" → "2024-12-31", "2024-Q2" → "2024-06-30"
function lastDateOfPeriod(period: string): string {
  const quarterEnds: Record<string, string> = {
    'Q1': '03-31', 'Q2': '06-30', 'Q3': '09-30', 'Q4': '12-31'
  }
  // "alles bis X" or "X bis Y" → use the end part
  const base = period.indexOf('bis') >= 0 ? period.split('bis').pop()!.trim() : period.trim()
  const quarterMatch = base.match(/^(\d{4})-(Q[1-4])$/)
  if (quarterMatch) return `${quarterMatch[1]}-${quarterEnds[quarterMatch[2]]}`
  const yearMatch = base.match(/^(\d{4})$/)
  if (yearMatch) return `${yearMatch[1]}-12-31`
  return new Date().toISOString().slice(0, 10)
}

// Balance the Salo of all stakeholders (ot Bussi) to equal anc compensate the Bussi Saldo
function balanceSalden(bs: AccountSystemClass) {
  // 1. Abschluss der Erfolgskonten (GuV) auf 9090 Saldenausgleich
  const saldenausgleich = bs.getAccountById(9090)
  if (!saldenausgleich) {
    logd("Error: Saldenausgleich account not found in account system")
    return
  }
  const currentPeriodGlobal = bs.periodenStore?.currentPeriod || ""
  const closingDate = lastDateOfPeriod(currentPeriodGlobal)

  const erfolgskonten = bs.accounts.filter(a => a.id >= 4000 && a.id < 9000 && a.unit === '€')
  erfolgskonten.forEach((konto) => {
    const currentPeriod = currentPeriodGlobal
    const saldo = konto.saldoPeriod(currentPeriod); // Saldo ist Haben - Soll
    logd(`Abschluss ${konto.name}: Saldo = ${saldo} Math.abs(saldo) = ${Math.abs(saldo)} ${konto.unit || ""}`)

    if (Math.abs(saldo) > 0.001) {
      const absAmount = Math.abs(saldo);

      const bookingTemplate: Booking = {
        nr: "AB-" + ((bs.hbStore?.bookings.length ?? 0) + 1).toString(),
        date: closingDate,
        description: `Abschluss ${konto.name} ${currentPeriod}, saldo: ${saldo} ${konto.unit || ""}`,
        amount: absAmount,
        quantity: 0,
        soll: 0,  // Dummy-Wert, um TS zu beruhigen
        haben: 0   // Dummy-Wert, um TS zu beruhigen
      };

      if (saldo < 0) {
        // NEGATIVER SALDO (Soll ist größer, z.B. Tanken): 
        // Wir müssen das KONTO im HABEN bebuchen, um es zu nullen.
        // Das GEGENKONTO (9090) kriegt also das SOLL.
        book(bookingTemplate, saldenausgleich, konto);
      } else {
        // POSITIVER SALDO (Haben ist größer, z.B. ein Ertrag):
        // Wir müssen das KONTO im SOLL bebuchen, um es zu nullen.
        // Das GEGENKONTO (9090) kriegt also das HABEN.
        book(bookingTemplate, konto, saldenausgleich);
      }
    }
  });

  logd("Abschluss der Erfolgskonten auf 9090 abgeschlossen. Saldo von 9090: ", saldenausgleich)

  // 2. Ermittlung des Ergebnisses (Verteilung)
  logd("Ermittlung des Saldo von 9090 für die Verteilung auf Gesellschafterkonten...", pStore?.currentPeriod)
  const saldo9090 = saldenausgleich.saldoPeriod(pStore?.currentPeriod || "");
  logd("Saldo von 9090: ", saldo9090)
  const gesellschafterkonten = bs.getBalanceSheetAccountsOfStakeholders()
    // filter only "Verrechnungskonto" 
    .filter(a => a.name.indexOf("Verrechnungskonto") > -1)
  logd("saldo9090=", saldo9090, saldenausgleich, bs)
  if (Math.abs(saldo9090) > 0.01) {
    // Wir nehmen den absoluten Anteil pro Kopf
    const absAnteil = Math.abs(saldo9090) / gesellschafterkonten.length;

    gesellschafterkonten.forEach((konto) => {
      const bookingTemplate: Booking = {
        nr: "AB-" + ((bs.hbStore?.bookings.length ?? 0) + 1).toString(),
        date: closingDate,
        description: `Umlage Bussi-Kosten ${bs.periodenStore?.currentPeriod || ""}`,
        amount: absAnteil,
        quantity: 0,
        soll: 0, // Dummies für TS
        haben: 0
      };

      if (saldo9090 < 0) {
        // 9090 hat Soll-Überhang (Kosten)
        // Abschluss: Gesellschafter ins SOLL (Belastung), 9090 ins HABEN (Ausgleich)
        book(bookingTemplate, konto, saldenausgleich);
      } else {
        // 9090 hat Haben-Überhang (unwahrscheinlich, aber möglich bei Erträgen)
        // Abschluss: 9090 ins SOLL, Gesellschafter ins HABEN (Gutschrift)
        book(bookingTemplate, saldenausgleich, konto);
      }
    });
  }

  // 3. Abschluss der Bestandskonten auf 9000
  bs.getBalanceSheetAccounts().forEach((konto) => {
    const currentPeriod = bs.periodenStore?.currentPeriod || "";
    const saldo = konto.saldoPeriod(currentPeriod); // Haben - Soll
    const bilanzkonto = bs.getAccountById(9000);

    if (Math.abs(saldo) > 0.001 && konto.unit === '€' && bilanzkonto) {
      const absAmount = Math.abs(saldo);

      const bookingTemplate: Booking = {
        nr: "AB-" + ((bs.hbStore?.bookings.length ?? 0) + 1).toString(),
        date: closingDate,
        description: `Bilanz-Abschluss: ${konto.name}`,
        amount: absAmount,
        quantity: 0,
        soll: 0, // Nur für TS
        haben: 0
      };

      if (saldo < 0) {
        // FALL A: SOLL-Überschuss (z.B. Bank oder Schulden)
        // Um das Konto zu nullen, muss es ins HABEN.
        // Das bedeutet: 9000 ist SOLL, Konto ist HABEN.
        book(bookingTemplate, bilanzkonto, konto);
        logd(`Abschluss ${konto.name}: Soll-Überhang gelöscht via 9000(Soll) an ${konto.name}(Haben)`);
      } else {
        // FALL B: HABEN-Überschuss (z.B. Guthaben von Hannes)
        // Um das Konto zu nullen, muss es ins SOLL.
        // Das bedeutet: Konto ist SOLL, 9000 ist HABEN.
        book(bookingTemplate, konto, bilanzkonto);
        logd(`Abschluss ${konto.name}: Haben-Überhang gelöscht via ${konto.name}(Soll) an 9000(Haben)`);
      }
    }
  });

  const bilanzDifferenz = bs.getAccountById(9000)?.saldoPeriod(bs.periodenStore?.currentPeriod || "")
  if (bilanzDifferenz !== 0) {
    logd("Warnung: Nach Abschluss der Bestandskonten ist der Saldo von 9000 nicht 0! ", bilanzDifferenz)
    console.log("--- FAHNDUNG NACH DEN " + bilanzDifferenz + "€ ---");
    bs.accounts.forEach(a => {
      const s = a.saldo();
      if (Math.abs(s) > 0.01) {
        // Wenn dieses Konto nicht 9000 ist, dann ist DAS hier der Grund!
        console.log(`Konto ${a.id} (${a.name}): Rest-Saldo = ${s} €`);
      }
    });
  }

  return bs
}
</script>


<style scoped>
.small {
  font-size: smaller;
}

.grey {
  color: grey;
  border-radius: 6px;
  border-width: 0px;
}

th {
  font-weight: normal;
}

.inner {
  background-color: rgba(0, 0, 0, 0) !important;
  border-radius: 6px;
}

.z100z {
  width: 40em;
}

.green {
  background-color: green;
  color: yellow;
  border-radius: 6px;
  border-width: 0px;
}

.errors {
  background-color: red;
  color: yellow;
  border-radius: 6px;
  border-width: 0px;
}

/* --- BILANZ-STYLES --- */
.bilanz-wrapper {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  /* Das sorgt für den Umbruch bei Platzmangel */
  gap: 40px;
  /* Etwas reduzierter Abstand für besseren Flow */
  align-items: flex-start;
}

.left-column {
  /* Erlaubt der Spalte zu wachsen (1) und zu schrumpfen (1) bei einer Basis von 350px */
  flex: 1 1 350px;
  border-right: 1px solid #ddd;
  padding-right: 5px;
  max-width: 600px;
  /* Verhindert, dass die Gesellschaft auf Desktop zu breit wird */
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 5px;
  /* Schönerer vertikaler Abstand zwischen Stakeholdern */
  flex: 1 1 350px;
  /* Nimmt sich den Rest, braucht aber min. 350px bevor es bricht */
}

/* --- Responsive Korrektur --- */
@media (max-width: 800px) {

  /* Schaltet auf einspaltig um, wenn es unter 1000px geht */
  .left-column {
    border-right: none;
    /* Vertikale Linie entfernen */
    border-bottom: 1px solid #ddd;
    /* Horizontale Linie zur Trennung einfügen */
    padding-right: 0;
    padding-bottom: 30px;
    flex: 1 1 100%;
    /* Volle Breite erzwingen */
    max-width: 100%;
  }

  .right-column {
    flex: 1 1 100%;
    width: 100%;
  }

  .bilanz-wrapper {
    gap: 30px;
  }
}

.bilanz-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 3px;
  border-radius: 8px;
  padding: 5px;
  /*background-color: rgba(255,255,255,0.5); /* Leichte Abhebung */
}

.right-align {
  text-align: right;
  font-weight: bold;
}

.muss-zahlen {
  color: #c0392b;
  font-weight: bold;
}

.bekommt {
  color: #0c7f3c;
  font-weight: bold;
}
</style>