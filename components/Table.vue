<template lang="pug">
div
  div(v-if="tableColumns.length > 0 || myFilters.length > 0")
    div 
    b {{ konto }}: {{ displayRows.length }} Einträge on page {{ pageNr == -1 ? 'all' : pageNr }}
      br
      div(v-if="nrOfPages>1")
        br
        span
          button(
            @click="pageNr = -1"
            :disabled="pageNr == -1") show all {{ allData.length }} entries
        span 
          button(v-for="pagenr, i in nrOfPages", 
            :disabled="pagenr == pageNr"
            @click="pageNr = pagenr"
            ) {{ (pagenr-1)*rowsPerPage+1 }}..{{ (pagenr)*rowsPerPage }}
      br
      div.filter-box
        input(
          v-model="newFilter" 
          placeholder="<enter> new filter" 
          @keyup.enter="handleSetFilterText"
        )
        input(
          type="submit" 
          value="set filter" 
          @click="handleSetFilterText('pattern', newFilter, false)"
        )   
      span(v-if="myFilters[0]") <br />filters:
      span.filter(v-for="filter in myFilters", v-on:click="deleteFilter(filter)")
        span.isAntiFilter(v-if="filter.isAnti == true") {{ filter.title }}: {{ filter.value }}
        span.isFilter(v-else) {{ filter.title }}: {{ filter.value }}
      
    #popup(
          v-html="prettyJSON(currentRow)"
          :class="{ visible: mouseIsOverCol1(), invisible: !(mouseIsOverCol1()) }"
        )
      

    table
      thead
        th(v-for="col,i in tableColumns" )
          div(@click.exact="sortArray(col)" class="sortable-header")
            span(v-html="formatCamelCase(col)") 
            span(v-if="sortKey == col && sortOrder > 0") ↓
            span(v-if="sortKey == col && sortOrder < 0") ↑
            span(v-if="['kmSinceLastEntry', 'soll','haben','amount', 'quantity', 'amount'].includes(col)") &nbsp; {{ sumRow(col) }}  
            span(v-else) &nbsp;
            // Arrows for sort indication
            span.arrow(v-if="(sortKey == col) && (sortOrder > 0)") ↑↑
            span.arrow(v-else) ↓↓
          button(
            @click="toggleAggregation(col)"
            :class="aggregateKey === col ? 'active' : ''"
            ) <==>
             
    
      tbody
        tr(v-for="row in displayRows")
          td(
            v-for="(col, colnr) in tableColumns",
            v-on:click.left="handleSetFilter(col, row[col], false)",
            v-on:click.right="handleSetFilter(col, row[col], true)",
            v-on:mouseover="setCurrentRow(row), setCurrentCol(colnr)",  
            v-on:mouseleave="setCurrentCol(-1)",   
            v-bind:class="{ hilight: row['Name'] == '7 ErgebnisNachSteuern', underaccountrow: row['Type'] == 'Unterkonto', greylight: row['Name'] && row['Name'].includes('Steuer:') }"
          )
            div(v-bind:class="{nowrap: 'date amount'.indexOf(col) > -1}")
              span(
                v-if="'amount '.indexOf(col) > -1",
                style="text-align: right",
                v-html="euro(row[col])"
              )
                |
              span(v-else v-html="row[col]?.toLocaleString('de-DE') || ''") 
    
    
      tfoot
        tr
          th(
            v-for="col in tableColumns",
            v-if="col != 'Account_Link'",
            style="text-align: right")
            span(v-if="showSum && 'Netto Saldo Amount Psoll Phaben'.indexOf(col) > -1") {{ sumEuro(col) }}
            span(v-else) &nbsp;
</template>

<script setup lang="ts">
import logd from "../utils/logDebug"
import { watch, ref, onMounted } from "vue"
// get rid of logd calls for this component


interface Filter {
  title: string
  value: string
  isAnti: boolean
}

const ROWSPERPAGE = 1000
const props = defineProps({
  konto: {
    type: String,
    //default: 'kontoname',
  },
  selectedBookingsToRender: {
    type: Array,
    //default: Function, // new Array(),
  },
  showSum: Boolean,
})

const aggregateKey = ref("")
const toggleAggregation = (str: string) => aggregateKey.value = aggregateKey.value === str ? "" : str
const sortKey = ref('nr'); // Standard-Sortierung
const sortOrder = ref(-1); // 1 = aufsteigend, -1 = absteigend
const myFilters = ref<Array<Filter>>([])
const currentRow = ref<any>({})
const allData = computed(() => props.selectedBookingsToRender || []);
const filteredRows = computed(() => executeFilter(allData.value, myFilters.value));
const sortedRows = computed(() => {
  // logd("Table.sortedRows: sorting by ", sortKey.value, "order", sortOrder.value);
  const data = [...filteredRows.value]; 
  return data.sort((a, b) => {
    let valA = String(a[sortKey.value] || "");
    let valB = String(b[sortKey.value] || "");
    
    // HTML-Tags entfernen (regex), um nur den angezeigten Text zu bekommen
    const textA = valA.replace(/<[^>]*>/g, "").toLowerCase().trim();
    const textB = valB.replace(/<[^>]*>/g, "").toLowerCase().trim();

    // Numerischer Vergleich, falls der Text eine Zahl ist
    const numA = parseFloat(textA);
    const numB = parseFloat(textB);
    if (!isNaN(numA) && !isNaN(numB)) {
      return (numA - numB) * sortOrder.value;
    }

    // Normaler Textvergleich
    if (textA < textB) return -1 * sortOrder.value;
    if (textA > textB) return 1 * sortOrder.value;
    return 0;
  });
});

// Aggregation der Zeilen basierend auf dem aggregateKey 
const aggregatedRows = computed(() => {
  // logd("Table.aggregatedRows: aggregating by ", aggregateKey.value);  
  const data = sortedRows.value;
  if (!aggregateKey.value) return data;

  const grouped: { [key: string]: any[] } = {};
  data.forEach((row) => {
    const key = row[aggregateKey.value] || "undefined";
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(row);
  });

  // Jetzt die gruppierten Daten in ein Array umwandeln
  const result: any[] = [];

  // jede Zelle einer Gruppe aggregieren
  // und nur numerische Spalten summieren
  for (const key in grouped) {
    const group = grouped[key];
    const aggregatedRow: any = {};
    for (const col in group[0]) {
      if (typeof group[0][col] === "number") {
        aggregatedRow[col] = group.reduce((sum, row) => sum + (row[col] || 0), 0);
      } else {
        aggregatedRow[col] = group[0][col]; // z.B. String-Werte übernehmen
      }
    }
    result.push(aggregatedRow);
  }

  return result;
});


const displayRows = computed(() => {
  // logd("Table.displayRows: calculating displayRows for pageNr ", pageNr.value);
  const returnArray = aggregatedRows.value;
  if (pageNr.value === -1) return returnArray // "Alle anzeigen" Modus
  const start = (pageNr.value - 1) * ROWSPERPAGE;
  const end = start + ROWSPERPAGE;
  return returnArray.slice(start, end);
});

let pageNr = ref(1);
const nrOfPages = computed(() => {
  const rowCount = filteredRows.value ? filteredRows.value.length : 0;
  const pages = Math.ceil(rowCount / rowsPerPage);
  return pages;
});


const tableColumns = computed(() => {
  const noFilterFor = "Net FileCreated Steuer Year Month";
  const rows = displayRows.value; // Kein 'this' nötig

// Optionales Chaining (?.) und Prüfung auf Länge
  if (!rows || rows.length === 0) {
    console.log("Table.columns: Keine Daten vorhanden");
    return [];
  }
  // Wir nehmen die Keys der ersten Zeile
  return Object.keys(rows[0] || []).filter(
    (key) => !noFilterFor.includes(key)
  );
});

const unSetPage =  () =>  pageNr.value = -1


watch(
  () => props.selectedBookingsToRender, () => {
    // logd("Table.watch: selectedBookingsToRender changed, resetting pageNr to 1")
    pageNr.value = 1
  }
)

let currentCol = 0
const renderAggregator = true
const rowsstack = [] as Array<any>
const newFilter = ref("")
const rowsPerPage = ROWSPERPAGE

const toRow = ROWSPERPAGE
const $route = useRoute()
const $router = useRouter()
const col = {}
const filters = []


onMounted(() => {
  // logd("Table.mounted: ", $route.query.filters)
  myFilters.value = []
  $route.query.filters = ""
  // logd("Table.mounted: ", $route.query.filters)
})

watch(myFilters.value, () => logd("some changed", myFilters.value))

const getFilters = () => myFilters.value
const mouseIsOverCol1 = function () {  return currentCol == 0}
const setCurrentCol = function (col: any) {currentCol = col}
const setCurrentRow = function (row: any) {currentRow.value = row}
const prettyJSON = function (value: any) {
  return JSON.stringify(value, undefined, 2)
    .replace(/\n/g, "<br>")
    .replace(/[ ]/g, "&nbsp")
}

const euro = function (x: number) {
  // ("Table.euro, got called")
  return x.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    style: "currency",
    currency: "EUR",
  })
}
const euroStringToNumber = (x: string): number =>
  +x.replace("€", "").replace(".", "").replace(",", ".").trim()
const sumRow = function sum(title: string): number {
  let mySum = displayRows.value?.reduce((acc: number, row: any) => acc + +row[title], 0) || 0
  return Math.round(100 * mySum) / 100
}
const sumEuro = function sumEuro(title: string) {
  let mySum = 0
  if (displayRows.value === undefined) return ""
  displayRows.value.forEach(function (row: any ){
    if (row[title] === undefined) return
    mySum += euroStringToNumber(row[title])
  })
  mySum = Math.round(1000 * mySum) / 1000
  if (isNaN(mySum)) {
    return ""
  }
  const mySumString = mySum.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    style: "currency",
    currency: "EUR",
  })
  return mySumString
}

const sum =   (title:any) :number => {
  let mySum = 0;
  (displayRows.value || []).forEach(function (row: any) {
    mySum += row[title]
  })
  return Math.round(100 * mySum) / 100
}


const handleSetFilterText =  ()  => {
  // logd("Table.setFilterText: ", newFilter.value )
  const str = newFilter.value.trim()
  // logd(" ... parsed as: ", str)
  const filter: Filter = { title: "", value: "", isAnti: false }
  filter.title = "pattern"
  filter.isAnti = str.charAt(0) === "!" // true if first char is '!'
  filter.value = filter.isAnti ? str.slice(1) : str // delete the first '!' char if antifilter
  handleSetFilter(filter.title, filter.value, filter.isAnti)
}

const getFilterFromQuery =  () => {
  const queryValue = $route.query.filters as string || "";
  // logd("Table.getFilterFromQuery: ", queryValue)
  try {
    const filters = JSON.parse(queryValue);
    //logd("Table.getFilterFromQuery: parsed filters", filters); 
  // Output: [{ title: "account", value: "Hannes", isAnti: false }]
  } catch (e) {
    //logd("Table.getFilterFromQuery: Parsing fehlgeschlagen:", e);
  }

  myFilters.value = queryValue
    ? JSON.parse(decodeURIComponent(queryValue.toString()))
    : [] // filters]
  // logd("Table.getFilterFromQuery: myFilters.value ", myFilters.value) 
}

const handleSetFilter = (title: string, value: string, isAntiFilter: boolean) => {
  // logd("Table.handleSetFilter: ", title, value)
  const filter = { title, value, isAnti: isAntiFilter }
  // only allow one filter of the same title and value
  const i = myFilters.value.findIndex(
    (x) => x.title === title && x.value === value && x.isAnti === isAntiFilter
  )
  i === -1 ? myFilters.value.push(filter) : logd(" ... filter already exists, not adding")

// URL Update
  $router.replace({ query: { ...$route.query, filters: JSON.stringify(myFilters.value) } });

  // WICHTIG: Nur die Seitenzahl zurücksetzen. 
  // Vue bemerkt die Änderung an myFilters.value und berechnet 'displayRows' automatisch neu.
  pageNr.value = 1;
  }
  
const deleteFilter = function deleteFilter(filter :any) {
  //logd("Table.deleteFiler: ", filter, myFilters.value)
  const index = myFilters.value.indexOf(filter)
  //logd(" ...", index)
  if (index > -1) {
    myFilters.value.splice(index, 1)
  }
  const query = Object.assign({}, $route.query)
  query.filters = JSON.stringify(myFilters.value)
  $router.replace({ query }) 

  pageNr.value = 1;
}

const executeFilter =  (d: any[], filters: Filter[]): any[] =>  {
  if (!filters.length) return d;
  // logd("Table.executeFilter: ", d.length, "rows with", filters.length, "filters");

  return d.filter((row) => {
    // .every() ist perfekt hier: Es stoppt sofort, wenn ein Filter false liefert (Short-circuit)
    return filters.every((filter) => {
      let isMatch = false;

      if (filter.title === "pattern") {
        // Alle Werte der Zeile zu einem Suchstring zusammenführen
        const cmpstr = Object.values(row)
          .join(" ")
          .toLowerCase();
        isMatch = cmpstr.includes(filter.value.toLowerCase());
      } else {
        // Normaler Spaltenfilter (exakter Vergleich)
        // Wir konvertieren zu String, um Typ-Konflikte beim Vergleich zu vermeiden
        isMatch = String(row[filter.title]) === String(filter.value);
      }

      // Logik-Umkehr bei Anti-Filtern:
      // Wenn es ein Anti-Filter ist, darf es KEIN Match sein.
      return filter.isAnti ? !isMatch : isMatch;
    });
  });
};

const sortArray = (col: string) => {
  // 1. Richtung umschalten (Toggle)
  if (sortKey.value === col) {
    sortOrder.value = sortOrder.value * -1;
  } else {
    sortKey.value = col;
    sortOrder.value = 1;
  }

  // Optional: Seite auf 1 zurücksetzen, wenn man sortiert
  pageNr.value = 1;
};

const formatCamelCase = (text :string) => text.replace(/([a-z])([A-Z])/g, '$1<wbr>$2');


</script>

<style scoped>
.invisible {
  display: none;
}
.visible {
  display: block;
}
button.active {
  background: #76ede9;
  color: #3c3c3b;
}
button {
  border: none;
  border-radius: 5px;
}
button:disabled {
  background: #76ede9;
  color: #3c3c3b;
}
.right {
  float: right;
  font-size: 0.7em;
  right: 0px;
  border: none;
  color: #3c3c3b;
}

span {
  display: inline-block; /* Wichtig, damit Width/Wrap greifen */
  word-break: break-word; /* Ältere Browser */
  overflow-wrap: anywhere; /* Moderne Browser */
}  
span.filter {
  color: #f5e14d;
}

span.isFilter {
  background-color: rgba(00, 14, 183, 1);
  margin: 1px;
  padding: 2px;
}
span.isFilter:before {
  background-color: rgba(00, 14, 183, 1);
  content: "\2716  ";
}

span.isAntiFilter {
  background-color: red;
  margin: 1px;
  padding: 2px;
}
span.isAntiFilter:before {
  background-color: red;
  content: "\2716  ! ";
}

table {

  border-collapse: collapse;
  border-radius: 6px;
  /* background: #fff */
}
/* new stuff */
tr:nth-of-type(odd).new {
  /*background: #fdd;*/
}
tr.new {
  /*background: #fee;*/
}
/* Zebra striping */
tr:nth-of-type(odd) {
  /*background: #eee;*/
}
.nowrap {
  white-space: nowrap;
}
th {
  /* background: #336;
      color: white; */
  font-weight: bold;
  cursor: s-resize;
  background-repeat: no-repeat;
  background-position: 3% center;
  border-radius: 6px;
  vertical-align: bottom;
}
th a {
  /*color: lightgrey;*/
}
td,
th {
  word-wrap: break-word;         /* All browsers since IE 5.5+ */
  overflow-wrap: break-word;     /* Renamed property in CSS3 draft spec */
  padding: 2px 5px 2px 5px;
  border: 1px solid #ccc;
  text-align: left;
  border-radius: 6px;
  vertical-align: bottom;
}

td span {
  word-wrap: break-word;         /* All browsers since IE 5.5+ */
  overflow-wrap: break-word;     /* Renamed property in CSS3 draft spec */
  display: block;
  max-width: 500px;
}

th.aes:after {
  content: "\21E9";
}

th.des:after {
  content: "\21E7";
}

td.hilite {
  background-color: rgba(20, 200, 200, 0.7);
}

td div :hover {
  background-color: rgba(20, 200, 200, 0.7);
}

div.filter:after {
  /*content: "\2704";*/
  position: relative;
  left: -80px;
}
td span.filter:before {
  font-size: 0.8;
  /* content: "\2704"; */
}
span.red {
  background-color: red;
}

#popup {
  background-color: rgba(200, 200, 222, 0.9);
  position: fixed;
  top: 13px;
  right: 13px;
  z-index: 10;
  padding: 13px;
  font-size: 1em;
  max-width: 30%;
  max-height: 60%;
  overflow-y: scroll;
  overflow-x: hidden;
}

.sortable-header {
  .arrow {
    opacity: 0; 
    transition: opacity 0.2s;
    cursor: pointer;
  }

  &:hover .arrow {
    opacity: 1; 
  }
}

</style>

