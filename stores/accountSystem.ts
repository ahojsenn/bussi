import { defineStore } from 'pinia'
import { useStakeholderStore } from './stakeholder';
import { useAccountsStore } from './accounts'
import { useHauptbuchStore } from './hauptbuch';
import logd from '../utils/logDebug'
import { Account, HauptbuchBooking, type RawAccount, type RawStakeholder } from '../types'


export const useAccountSystemStore = defineStore('accountSystem', {
  state: () => ({
    // Wir starten leer
    accountSystem: null as accountSystem | null,
  }),
  actions: {
    // initialize the account system with the stakeholder list, accounts and bookings
    async initAS() {
      // Stores innerhalb der Action aufrufen ist okay!
      const shStore = useStakeholderStore()
      const aStore = useAccountsStore()
      const hbStore = useHauptbuchStore()

      // Parallel laden spart Zeit! (Optional, aber schneller)
      await Promise.all([
        shStore.loadStakeholder(),
        aStore.loadDataFromGoogle(),
        hbStore.loadHauptbuch()
      ])

      const stakeholder = shStore.verteilungPersonen
      const accounts = aStore.accounts
      const hauptbuch = hbStore.hauptbuch

      this.accountSystem = new accountSystem(stakeholder, accounts, hauptbuch)
    },

    getters: {
      getAccountSystem: (state: any) => state.accountSystem,
    },
  }

})

class accountSystem {
  accounts: Account[] = []
  hauptbuchBookings: HauptbuchBooking[] = []
  Errors: Account

  constructor(stakeholder: string[], accounts: RawAccount[], hbBookings: HauptbuchBooking[] = []) {
    this.hauptbuchBookings = hbBookings
    this.Errors = new Account("Errors", "system")
    // logd("accountSystem.constructor: stakeholder ", stakeholder, accounts, hbBookings)
    // this.Konto9000 = new Account("zum Ausbuchen Tankunterfüllstand am Jahresende", "Bussi")
    for (const sh of stakeholder)
      for (const acc of accounts) {
        // skip Listenkonton for stakeholders but the first one, which is Bussi
        if (acc.Kontotyp === "Listenkonto" && sh !== "Bussi") {
          // logd("accountSystem.constructor: skipping Listenkonto for ", sh);
          continue
        }
        else
          // create T-Accounts for all stakeholders, but only Listenkonten for Bussi
          // logd("accountSystem.constructor: creating account for ", sh, acc.Name),
          this.accounts.push(new Account(acc.Name, sh))

      }
  }
  findAccount(owner: string, name: string): Account {
    // logd("findAccountbyON", name, owner, this.accounts.find(a => (a.name === name) && (a.owner === owner)))
    return this.accounts.find(a => (a.name === name) && (a.owner === owner))
      || this.Errors
  }
  saldierenEuro(owner: string): number {
    return Math.round(this.accounts.filter(a => a.owner === owner).reduce((acc, cv) => cv.name !== "Kilometer" ? acc += cv.saldo() : acc, 0) * 100) / 100
  }
}