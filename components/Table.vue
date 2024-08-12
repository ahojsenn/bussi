<template lang="pug">
div 
  div(v-if="columns().length > 0 || filters.length > 0")
    div 
    b {{ konto }}: {{ md.rows.length }} Einträge
      br
      div(v-if="pages()>1")
        br
        span
          button(v-on:click="unSetPage()" 
            :disabled="pageNr == -1") show all {{ data.length }} entries
        span 
          button(v-for="pagenr, i in pages()", 
            :disabled="pagenr == pageNr"
            v-on:click="setPage(pagenr)") {{ (pagenr-1)*rowsPerPage+1 }}..{{ (pagenr)*rowsPerPage }}
      br
      input(v-model="newFilter", placeholder="<enter> new filter", v-on:keyup.enter="setFilterText()")
      input(type="submit", value="set filter", v-on:click="setFilterText()")
      span(v-if="md.filters[0]") <br />filters:
      span.filter(v-for="filter in md.filters", v-on:click="deleteFilter(filter)")
        span.isAntiFilter(v-if="filter.isAnti == true") {{ filter.title }}: {{ filter.value }}
        span.isFilter(v-else) {{ filter.title }}: {{ filter.value }}
      

      #popup(v-html="prettyJSON(md.currentRow)" v-bind:class="{ visible: mouseIsOverCol1to5(), invisible: !mouseIsOverCol1to5()}" ) 
    
    table
      thead
        th(v-for="col,i in columns()")
          div(@click.exact="sortArray(md.rows, col)") {{ col }}
            <br />
            span(v-if="'kmSinceLastEntry Amount haben soll'.indexOf(col) > -1")  {{ sumRow(col) }}  
            span(v-else) &nbsp;
          button(v-if="renderAggregator", v-on:click="aggregateBy(md.rows, col)" :class="{active:  md.aggregate.indexOf(col)> -1}") &lt;==&gt;
             
    
      tbody
        tr(v-for="row in md.rows")
          td(
            v-for="(col, colnr) in columns()",
            v-on:click.left="setFilter(col, row[col], false)",
            v-on:click.right="setFilter(col, row[col], true)",
            v-on:mouseover="setCurrentRow(row), setCurrentCol(colnr)",     
            v-bind:class="{ hilight: row['Name'] == '7 ErgebnisNachSteuern', underaccountrow: row['Type'] == 'Unterkonto', greylight: row['Name'] && row['Name'].includes('Steuer:') }"
          )
            div(v-bind:class="{nowrap: 'date amount'.indexOf(col) > -1}")
              span(
                v-if="col == 'Name'",
                v-bind:class="{ underaccountcell: row['Type'] == 'Unterkonto' }"
              )
                a(
                  v-bind:href="'?report=account&id=' + encodeURIComponent(row.Account_Link)",
                  v-html="row[col].toLocaleString('de-DE', { minimumFractionDigits: 2, style: 'currency', currency: 'EUR' })"
                )
              span(
                v-else-if="'Revenue Netto Advances Internals Sales Project Commission Taxes Saldo Costs Saldo Amount Balance AnteilAusFaktura AnteilAusFairshares KMDarlehen Aktiva Passiva Rest Salesprv '.indexOf(col) > -1",
                style="text-align: right",
                v-html="euro(row[col])"
              )
                |
              span(v-else, v-html="row[col]")
    
    
      tfoot
        tr
          th(
            v-for="col in columns()",
            v-if="col != 'Account_Link'",
            style="text-align: right")
            span(v-if="showSum && 'Netto Saldo Amount Psoll Phaben'.indexOf(col) > -1") {{ sumEuro(col) }}
            span(v-else) &nbsp;
</template>

<script setup lang="ts">
import logd from "../mixins/logDebug"
import { watch, ref, reactive, onMounted } from "vue"

interface Filter {
  title: string
  value: string
  isAnti: boolean
}

const ROWSPERPAGE = 500
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

const md = reactive({
  filters: [] as Array<Filter>,
  currentRow: {},
  aggregate: [] as Array<string>,
  rows: props.selectedBookingsToRender,
})

md.rows = props.selectedBookingsToRender
watch(
  () => props.selectedBookingsToRender,
  () => {
    md.rows = props.selectedBookingsToRender
  }
)
const data = props.selectedBookingsToRender
let currentCol = 0
let sortOrder = ref(true)
const renderAggregator = true
const rowsstack = [] as Array<any>
let newFilter = ""
const rowsPerPage = ROWSPERPAGE
let pageNr = 0
const toRow = ROWSPERPAGE
const $route = useRoute()
const $router = useRouter()
const col = {}
const filters = []

onMounted(() => {
  // logd("Table.mounted: ", $route.query.filters)
  md.filters = []
  $route.query.filters = ""
  // logd("Table.mounted: ", $route.query.filters)
})

watch(md.filters, () => logd("some changed", md.filters))

const getFilters = () => md.filters

const pages = function () {
  return data ? Math.round(data.length / ROWSPERPAGE) : 0
}
const setPage = function (pgnr: number) {
  md.rows = data ? data.filter((row, i) => i >= (pgnr - 1) * ROWSPERPAGE && i < pgnr * ROWSPERPAGE) : []
  pageNr = pgnr
}
const unSetPage = function () {
  md.rows = data
  pageNr = -1
}


const mouseIsOverCol1to5 = function () {  return currentCol < 5}
const setCurrentCol = function (col: any) {currentCol = col}
const setCurrentRow = function (row: any) {md.currentRow = row}
const prettyJSON = function (value: any) {
  return JSON.stringify(value, undefined, 2)
    .replace(/\n/g, "<br>")
    .replace(/[ ]/g, "&nbsp")
}
const aggregateBy = function (array: [any], aggregateKey: string) {
  logd("Table.aggregateby: ", aggregateKey)
  if (md.aggregate.includes(aggregateKey)) {
    // this butten was already pushed
    md.aggregate.splice(md.aggregate.indexOf(aggregateKey), 1)
    md.rows = JSON.parse(rowsstack.pop())
    return
  }
  rowsstack.push(JSON.stringify(md.rows))
  md.aggregate.push(aggregateKey)
  const result = [] as Array<any>
  array.forEach(function (row, i) {
    // find row[aggregateKey] in result array
    let resultIndex = null
    for (const j in result) {
      if (result[j][aggregateKey] === row[aggregateKey]) {
        resultIndex = j
      }
    }

    if (resultIndex != null) {
      if (aggregateKey !== "Amount" && aggregateKey !== "Netto") {
        result[+resultIndex].Amount += row.Amount
        result[+resultIndex].Netto += row.Netto
      }
      if (aggregateKey !== "CostCenter") {
        result[+resultIndex].CostCenter += "<br>" + row.CostCenter
      }
      result[+resultIndex].Text += "<br>" + row.Amount + " " + row.Text
    } else {
      // row.Text = row.Amount + " " + row.Text
      result.push(row)
    }
  })
  md.rows = result
}
// return entries that do not have a field with the given value
const columns = function (antifilter = "Net FileCreated Steuer Year Month") {
  if (md.rows === undefined) return []
  else
    return (md.rows.length === 0)
      ? []
      : Object.keys(md.rows[0]).filter(
          (d) => !(antifilter.includes(d))
        )
}
const euro = function (x: number) {
  //logd("Table.euro, got called")
  return x.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    style: "currency",
    currency: "EUR",
  })
}
const euroStringToNumber = (x: string): number =>
  +x.replace("€", "").replace(".", "").replace(",", ".").trim()
const sumRow = function sum(title: string): number {
  let mySum = md.rows?.reduce((acc: number, row) => acc + +row[title], 0) || 0
  return Math.round(100 * mySum) / 100
}
const sumEuro = function sumEuro(title: string) {
  let mySum = 0
  if (md.rows === undefined) return ""
  md.rows.forEach(function (row) {
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
const sum = function sum(title) {
  let mySum = 0
  md.rows.forEach(function (row) {
    mySum += row[title]
  })
  return Math.round(100 * mySum) / 100
}

const setFilterText = function setFilterText() {
  const str = newFilter
  const filter: Filter = { title: "", value: "", isAnti: false }
  filter.title = "pattern"
  filter.value = str
  filter.isAnti = str.charAt(0) === "!" // true if first char is '!'
  filter.value = filter.isAnti ? str.substr(1) : str // delete the first '!' char if antifilter
  setFilter(filter.title, filter.value, filter.isAnti)
  newFilter = null
}
const getFilterFromQuery = function () {
  md.filters =
    $route.query && $route.query.filters
      ? JSON.parse(decodeURIComponent($route.query.filters))
      : [] // filters]
  md.rows = data
  setPage(pageNr)
  md.rows = executeFilter(md.rows, md.filters)
}

const setFilter = function setFilter(title: string, value: string, isAntiFilter: boolean) {
  logd("Table.setfilter: ", title, value)
  const filter = { title, value, isAnti: isAntiFilter }
  // only allow one filter of the same type
  const i = md.filters.findIndex(
    (x) => x.title === title && x.value === value && x.isAnti === isAntiFilter
  )
  i === -1 ? md.filters.push(filter) : (md.filters[i] = filter)

  const query = Object.assign({}, $route.query)
  query.filters = JSON.stringify(md.filters)
  query.filters = $router.replace({ query })

  md.rows = data
  setPage(pageNr)
  md.rows = executeFilter(md.rows, md.filters)
  logd("Table.setfilter: ", md.filters)
}

const deleteFilter = function deleteFilter(filter) {
  logd("Table.deleteFiler: ", filter, md.filters)
  const index = md.filters.indexOf(filter)
  logd(" ...", index)
  if (index > -1) {
    md.filters.splice(index, 1)
  }
  const query = Object.assign({}, $route.query)
  query.filters = JSON.stringify(md.filters)
  query.filters = $router.replace({ query })

  md.rows = data
  setPage(pageNr)
  md.rows = executeFilter(md.rows, md.filters)
}

const executeFilter = function (d: any[], filters: Filter[]): any[] {
  return d.filter(function (row) {
    let retval = true
    // if only one of the following filters does not fit return false
    filters.forEach(function (filter) {
      if (filter.title === "pattern") {
        let cmpstr = ""
        for (const cell in row) {
          cmpstr += row[cell] ? row[cell].toString().toLowerCase() : ""
        }
        if (cmpstr.includes(filter.value.toLowerCase()) && filter.isAnti) retval = false
        if (!cmpstr.includes(filter.value.toLowerCase())) retval = false
      } else if (filter.isAnti) {
        retval = retval && row[filter.title] !== filter.value
      } else if (!filter.isAnti) {
        retval = retval && row[filter.title] === filter.value
      }
    })
    return retval
  })
}
const logArray = function logArray(arr) {
  console.log("in logArray", arr)
}
const sortArray = function sortArray(array, sortKey) {
  const key = sortKey || sortKey || "#"
  sortOrder = !sortOrder // toggle sortOrder
  if (sortOrder) {
    array.sort((a, b) => a[key] > b[key])
  } else {
    array.sort((a, b) => a[key] < b[key])
  }
}

setPage(1)
//getFilterFromQuery()
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
  vertical-align: text-top;
  border-radius: 6px;
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
</style>

// kommentar
// kommentar
// kommentar
// kommentar
// kommentar
// kommentar
// kommentar
// kommentar
// kommentar
// kommentar
// kommentar
// kommentar
// kommentar
// kommentar
// kommentar
// kommentar
// kommentar
// kommentar
// kommentar
// kommentar
// kommentar