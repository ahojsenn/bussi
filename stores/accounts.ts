import { type RawAccount } from '@/types';
import { defineStore } from 'pinia'
import { getDataFromGoogle } from './getDataFromGoogle';

const GURL = 'https://docs.google.com/spreadsheets/d/'
const GKEY = '1UHH3Nzj6yj3d9FJbgswx-nj4fHTIuWeDzl5aJpgC-8M'
const GMAGIC = '/gviz/tq?tqx=out:csv'
const GSN_sheet = '&sheet=konten'
const GdataUrl = GURL + GKEY + GMAGIC + GSN_sheet

export const useAccountsStore = defineStore('accounts', {
  state: () => ({
    accounts: [] as Array<RawAccount>,
  }),
  actions: {
    async loadDataFromGoogle() {
      const gdata = await getDataFromGoogle(GdataUrl)
      this.accounts = gdata.data
      // logd("accounts.loadDataFromGoogle: ", this.accounts)
    },
  },
  getters: {
    // get all accounts sorted by  "Aufwandskonto","Ertragskonto", "Aktivkonto", "Passivkonto" , "Statistikkonto" and then by account number
    sortedAccounts: (state) => {
      const typeOrder = ["Aufwandskonto", "Ertragskonto", "Aktivkonto", "Passivkonto", "Statistikkonto"]
      return state.accounts.slice().sort((a, b) => {
        const aTypeIndex = typeOrder.findIndex(type => a.Bezeichnung?.indexOf(type) > -1)
        const bTypeIndex = typeOrder.findIndex(type => b.Bezeichnung?.indexOf(type) > -1)
        if (aTypeIndex === bTypeIndex) {
          return (a.Kontonummer || 0) - (b.Kontonummer || 0)
        }
        return aTypeIndex - bTypeIndex
      })
    },
    accountNames: (state) => state.accounts.map(s => s["Name"]),
    accountBezeichnungen: (state) => state.accounts.map(s => s["Bezeichnung"]),
    // get "Einheit" by account name
    getEinheitByName: (state) => (name: string) => {
      const account = state.accounts.find(s => s["Name"] === name)
      return account ? account["Einheit"] : null
    },
  }
})
