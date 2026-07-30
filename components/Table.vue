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
      

    div.table-wrap
      table
        thead
          th(v-for="col,i in tableColumns" )
            div(@click.exact="sortArray(col)" class="sortable-header")
              span(v-html="formatCamelCase(col)")
              span(v-if="sortKey == col && sortOrder > 0") ↓
              span(v-if="sortKey == col && sortOrder < 0") ↑
              span(v-if="['kmSinceLastEntry', 'soll', 'haben'].includes(col)") &nbsp; {{ sumRow(col) }}
              span(v-else) &nbsp;
              // Arrows for sort indication
              span.arrow(v-if="(sortKey == col) && (sortOrder > 0)") ↑↑
              span.arrow(v-else) ↓↓
            button(
              @click="toggleAggregation(col)"
              :class="aggregateKey === col ? 'active' : ''"
              ) <==>

        tbody
          tr(v-for="(row, rowIdx) in displayRows" v-bind:class="{ \
                jahresendbuchung: isJahresendbuchung(row), \
                expanded: expandedRows.has(rowIdx) \
                }")
            td(
              v-for="(col, colnr) in tableColumns",
              :data-label="plainLabel(col)",
              v-bind:class="cellClass(col, row)",
              v-on:click.left="handleCellClick(col, row[col], false)",
              v-on:click.right="handleCellClick(col, row[col], true)",
              v-on:mouseover="setCurrentRow(row), setCurrentCol(colnr)",
              v-on:mouseleave="setCurrentCol(-1)",
            )
              div(v-bind:class="{nowrap: 'date amount'.indexOf(col) > -1}")
                span(style="text-align: right" v-html="row[col]?.toLocaleString('de-DE') || ''")
            //- Nur im Karten-Layout sichtbar, auf dem Desktop per display:none aus der Tabelle genommen
            td.card-toggle(v-if="secondaryColumns.length > 0")
              button(@click.stop="toggleRow(rowIdx)") {{ expandedRows.has(rowIdx) ? 'weniger ▴' : 'mehr ▾' }}

        tfoot
          tr
            th(
              v-for="col in tableColumns",
              v-if="col != 'Account_Link'",
              style="text-align: right")
              span(v-if="showSum && 'Netto Saldo Psoll Phaben'.indexOf(col) > -1") {{ sumEuro(col) }}
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
  sortOrder: {
    type: Number,
    default: 1,
  },
})

const aggregateKey = ref("")
const toggleAggregation = (str: string) => aggregateKey.value = aggregateKey.value === str ? "" : str
const sortKey = ref('nr'); // Standard-Sortierung
const sortOrder = ref(props.sortOrder); // 1 = aufsteigend, -1 = absteigend
const myFilters = ref<Array<Filter>>([])
const currentRow = ref<any>({})
const allData = computed(() => props.selectedBookingsToRender || []);
const filteredRows = computed(() => executeFilter(allData.value, myFilters.value));
const sortedRows = computed(() => {
  //logd("Table.sortedRows: sorting by ", sortKey.value, "order", sortOrder.value);
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

// computed property to identifiy jahresendbuchungen
// where Date is 31.12. and Type is "Jahresendbuchung"
// or date is 1.1. and Type is "Jahresanfangsbuchung"
const isJahresendbuchung = computed<((row: any) => boolean)>(() => {
  return (row: any) => {

    
    const date = row["date"]  // je nachdem, wie die Spalte heißt
    const type = row.description || row.type; // je nachdem, wie die Spalte heißt
    if (!date || !type) return false;
    // date is of format 2026-01-31 20:33
    const isEndOfYear = date.toString().includes("12-31") && type.toString().includes("Ausbuchen");
    const isStartOfYear = date.toString().includes("01-01") && type.toString().includes("Einbuchen");

    return isEndOfYear || isStartOfYear;
  };
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

// --- Karten-Layout fuer schmale Screens -------------------------------------
// Unter 700px wird jede Zeile zu einer Karte (siehe @media im style-Block). Die
// Klassen hier steuern nur, was in der Karte oben steht, was als Label/Wert-Paar
// erscheint und was hinter "mehr" verschwindet. Auf dem Desktop haben sie keine
// Wirkung, die Tabelle bleibt unveraendert.

// Kopfzeile der Karte: eine Datums- und eine Namensspalte, falls vorhanden.
const HEAD_CANDIDATES = ['date', 'datum', 'account', 'konto', 'name', 'stakeholder']
// Was in der eingeklappten Karte als Label/Wert-Paar sichtbar bleibt.
const BODY_CANDIDATES = ['amount', 'betrag', 'saldo', 'netto', 'soll', 'haben', 'km', 'liters', 'consumption']

const matches = (col: string, candidates: string[]) =>
  candidates.some((c) => col.toLowerCase() === c || col.toLowerCase().startsWith(c))

const headColumns = computed(() =>
  tableColumns.value.filter((col) => matches(col, HEAD_CANDIDATES)).slice(0, 2))

const bodyColumns = computed(() => {
  const cols = tableColumns.value.filter(
    (col) => !headColumns.value.includes(col) && matches(col, BODY_CANDIDATES))
  // Fallback: erkennt die Heuristik nichts, zeigen wir die ersten drei Spalten,
  // damit eine Karte nie leer aussieht.
  if (cols.length === 0 && headColumns.value.length === 0) return tableColumns.value.slice(0, 3)
  return cols
})

const primaryColumns = computed(() =>
  [...headColumns.value, ...bodyColumns.value, ...tableColumns.value.filter((c) => c === 'description')])

const secondaryColumns = computed(() =>
  tableColumns.value.filter((col) => !primaryColumns.value.includes(col)))

// Eine reine Fahrt hat liters/consumption/amount auf 0. In der Tabelle ist das
// eine Spalte mit einer Null, in der Karte eine eigene Zeile - also raus damit,
// solange die Karte eingeklappt ist.
const isEmptyValue = (v: any) => v === undefined || v === null || v === '' || v === 0

const cellClass = (col: string, row: any) => ({
  'card-head': headColumns.value.includes(col),
  'card-text': col === 'description',
  secondary: secondaryColumns.value.includes(col),
  'is-empty': isEmptyValue(row?.[col]),
  nowrap: 'date amount'.indexOf(col) > -1,
})

// data-label wird im Karten-Layout per ::before als Spaltenname vor den Wert
// gesetzt. formatCamelCase taugt dafuer nicht, das liefert HTML mit <wbr>.
const plainLabel = (col: string) => col.replace(/([a-z])([A-Z])/g, '$1 $2')

const expandedRows = ref(new Set<number>())
const toggleRow = (idx: number) => {
  const next = new Set(expandedRows.value)
  next.has(idx) ? next.delete(idx) : next.add(idx)
  expandedRows.value = next
}

// Auf Touch-Geraeten ist jeder Tap ein Linksklick. Ohne diese Bremse sammelt man
// beim Scrollen durchs Hauptbuch ungewollt Filter ein, und der Anti-Filter
// (Rechtsklick) ist dort ohnehin nicht ausloesbar. Gefiltert wird auf dem
// Telefon ueber das Textfeld oben.
const canHover = () =>
  typeof window === 'undefined' || window.matchMedia?.('(hover: hover)').matches !== false

const handleCellClick = (col: string, value: string, isAnti: boolean) => {
  if (!canHover()) return
  handleSetFilter(col, value, isAnti)
}

watch(
  () => props.selectedBookingsToRender, () => {
    // logd("Table.watch: selectedBookingsToRender changed, resetting pageNr to 1")
    pageNr.value = 1
    expandedRows.value = new Set()
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
.jahresendbuchung {
  background-color: rgba(255, 100, 0, 0.3);
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

/* Die Tabelle scrollt in ihrem eigenen Container, statt die ganze Seite
   horizontal zu schieben. */
.table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* Der mehr/weniger-Knopf gehoert nur zur Karte, in der Tabelle waere er eine
   ueberzaehlige Spalte. */
td.card-toggle {
  display: none;
}

/* Das Popup haengt an mouseover. Auf Touch gibt es kein Hover, es bliebe nach
   einem Tap kleben und ist bei max-width 30% ohnehin unlesbar. */
@media (hover: none) {
  #popup {
    display: none !important;
  }
}

/* ---- Karten-Layout ------------------------------------------------------ */
@media (max-width: 700px) {
  .table-wrap {
    overflow-x: visible;
  }

  table,
  tbody,
  tr,
  td {
    display: block;
    width: 100%;
    /* Ohne border-box sprengen Padding und Rahmen der Karte die 100% und
       schieben den Inhalt aus dem Viewport. */
    box-sizing: border-box;
    max-width: 100%;
  }

  /* Die Spaltennamen wandern per data-label in die Zellen, die Kopfzeile wird
     damit ueberfluessig. */
  thead,
  tfoot {
    display: none;
  }

  tr,
  tr:nth-of-type(odd),
  tr:nth-of-type(even) {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    background: rgba(255, 255, 255, 0.55);
    border: 1px solid rgba(60, 60, 59, 0.25);
    border-radius: 10px;
    margin: 0 0 10px 0;
    padding: 8px 10px;
  }

  tr.jahresendbuchung,
  tr.jahresendbuchung:nth-of-type(odd) {
    background: rgba(255, 100, 0, 0.3);
  }

  td {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 10px;
    /* shrink erlauben, sonst kann eine lange description die Karte breiter
       machen als den Bildschirm und schiebt die Werte raus. */
    flex: 1 1 100%;
    min-width: 0;
    border: none;
    padding: 2px 0;
  }

  td::before {
    content: attr(data-label);
    flex: 0 1 auto;
    opacity: 0.65;
    text-align: left;
  }

  td div {
    min-width: 0;
    text-align: right;
    overflow-wrap: anywhere;
  }

  td span {
    display: inline;
    max-width: 100%;
    text-align: right;
  }

  /* Datum und Konto als Kopfzeile der Karte, ohne Label, nebeneinander. */
  td.card-head {
    order: -1;
    flex: 1 1 45%;
    min-width: 0;
    justify-content: flex-start;
    font-size: 1.15em;
    font-weight: bold;
    padding-bottom: 6px;
  }

  td.card-head ~ td.card-head {
    justify-content: flex-end;
  }

  td.card-head::before {
    content: none;
  }

  /* description ist Freitext und bekommt die volle Breite unter den Zahlen. */
  td.card-text {
    order: 1;
    justify-content: flex-start;
    padding-top: 6px;
  }

  td.card-text::before {
    content: none;
  }

  td.card-text div,
  td.card-text span {
    text-align: left;
  }

  td.secondary {
    display: none;
    order: 2;
  }

  /* Leere Werte verschwinden mit den Nebenspalten hinter "mehr", damit eine
     Fahrt nicht drei Nullen anzeigt. */
  tr:not(.expanded) td.is-empty {
    display: none;
  }

  tr.expanded td.secondary,
  tr.expanded td.is-empty {
    display: flex;
  }

  td.card-toggle {
    display: flex;
    order: 3;
    justify-content: flex-end;
    padding-top: 4px;
  }

  td.card-toggle::before {
    content: none;
  }

  /* Die Filter-Buttons oben brauchen auf schmalen Screens Umbruch statt
     einer einzigen langen Zeile. */
  .filter-box {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  .filter-box input {
    flex: 1 1 auto;
    min-width: 0;
  }
}

</style>

