import { defineStore } from 'pinia'
import { useStakeholderStore } from './stakeholder';
import { useAccountsStore } from './accounts'
import { useHauptbuchStore } from './hauptbuch';
import logd from '../utils/logDebug'
import { Account, Booking, type Unit, type AccountType } from '@/types';
import { usePeriodenStore } from './perioden';


export const useAccountSystemStore = defineStore('accountSystem', {
  state: () => ({
    // Wir starten leer
    accountSystem: null as AccountSystemClass | null,
    isLoading: true // Hilfreich für UI-Spinner
  }),
  actions: {
    // initialize the account system with the stakeholder list, accounts and bookings
    async initAS() {
      logd("Initializing AccountSystem...")
      this.isLoading = true;
      try {
        const shStore = useStakeholderStore();
        const aStore = useAccountsStore();
        const hbStore = useHauptbuchStore()
        const periodenStore = usePeriodenStore()

        await Promise.all([
          shStore.loadStakeholder(),
          aStore.loadDataFromGoogle(),
          hbStore.loadHauptbuch("kein Zeitraum angegeben"),
          periodenStore.loadDataFromGoogle()
        ]);

        // Erst wenn alle Daten da sind, Instanz erstellen
        this.accountSystem = new AccountSystemClass(
          shStore,
          aStore,
          hbStore,
          periodenStore);
      } catch (error) {
        logd("Fehler beim Initialisieren des AccountSystems:", error);
        // Hier könntest du eine Fehlermeldung für den User setzen
      } finally {
        this.isLoading = false;
      }
    },

    getters: {
      getAccountSystem: (state: any) => state.accountSystem,
    },
  }

})

export class AccountSystemClass {
  accounts: Account[] = []
  Errors: Account = new Account(3000000, "Errors", "System", "Errors", "System")
  Errors1: Account = new Account(3000001, "Errors1", "System", "Errors", "System")
  Saldenausgleich: Account = new Account(3000002, "Saldenausgleich", "System", "€", "System")
  public readonly shStore: ReturnType<typeof useStakeholderStore> | null = null
  public readonly aStore: ReturnType<typeof useAccountsStore> | null
  public readonly hbStore: ReturnType<typeof useHauptbuchStore> | null = null
  public readonly periodenStore: ReturnType<typeof usePeriodenStore> | null = null
  /* 
  Hannes: kann der constructor objekteigenschaften hinzufügen, ohne dass diese im Kopf der Objekts derfniert sind?
  gemini:
  1. Der "Zaubertrick": Parameter Properties (Best Practice)
  Das ist genau das, was du in deinem Code bei hbBookings und perioden machst. Wenn du ein Zugriffs-Schlüsselwort wie public, private, protected oder readonly direkt vor das Argument im Constructor schreibst, macht TypeScript folgendes automatisch im Hintergrund:
  
  Es deklariert die Eigenschaft in der Klasse.
  
  Es weist den Wert von außen this.eigenschaft zu.
  
  Das bedeutet: Bei hbBookings und perioden musst du sie nicht oben im Kopf der Klasse (im Body) hinschreiben. Sie sind durch den Constructor-Kopf bereits definiert.
  */
  constructor(
    public readonly shS: ReturnType<typeof useStakeholderStore> | null = null,
    public readonly aS: ReturnType<typeof useAccountsStore> | null = null,
    public readonly hbS: ReturnType<typeof useHauptbuchStore> | null = null,
    public readonly ps: ReturnType<typeof usePeriodenStore> | null = null
  ) {
    this.shStore = shS
    this.aStore = aS
    this.hbStore = hbS
    this.periodenStore = ps

    // generate accounts for the "Gesellschaft" for all accounts, that do not have "je Gesellschafter:"  in the decription
    if (aS?.accounts) {

      for (const [acc_nr, acc] of aS.sortedAccounts.entries()) {
        const _accntName = acc.Name + " :: " + acc.Bezeichnung

        logd("accountSystem.constructor: processing account ", _accntName, acc)

        // else if Bezeichnug has "für alle Stakeholder:" in the description, then create only one account for all stakeholders with account number 2000000 + account number, e.g. for account number 2: 2000002
        if (acc.Bezeichnung && acc.Bezeichnung.indexOf("je Stakeholder:") > -1) {
          for (const [sh_nr, sh] of (shS?.getStakeholder || []).entries()) {
            const _accountId = generateStructuredAccountId(4000 + acc_nr, sh_nr + 1)
            this.accounts.push(new Account(_accountId, _accntName, sh, acc.Einheit as Unit || 'EUR', acc.Art as AccountType || 'System'))
          }
        } else if (acc.Bezeichnung && acc.Bezeichnung.indexOf("je Gesellschafter:") > -1) {
          // for all other accounts, create an account per stakeholder
          // with acccount number 1000000 + stakeholder number * 100 + account number, e.g. for stakeholder 1 and account 2: 1000200
          for (const [sh_nr, sh] of (shS?.getGesellschafter || []).entries()) {
            const _accountId = generateStructuredAccountId(acc.Kontonummer, sh_nr + 1)
            this.accounts.push(new Account(_accountId, _accntName, sh, acc.Einheit as Unit, acc.Art as AccountType || 'System'))
          }
        } else {
          const _accountId = +acc.Kontonummer || generateStructuredAccountId(2000, acc_nr + 1)
          this.accounts.push(new Account(_accountId, _accntName, shS?.getGesellschaft || "Gesellschaft", acc.Einheit as Unit, acc.Art as AccountType || 'System'))
        }
      }
      // logd("accountSystem.constructor: accounts generated: ", this.accounts)
    }
  }
  findAccount = (owner: string, name: string): Account => {
    const acc = this.accounts.find(a => (a.name.split("::")[0].trim() === name) && (a.owner === owner))
    if (!acc) {
      const errmsg = "findAccount: account not found for owner " + owner + " and name " + name
      console.error(errmsg)
      return this.Errors
    }
    return acc
  }
  // getBalanceSheetAccounts
  // Assets, Liabilities und Equity or in german: Aktiva, Passiva und Eigenkapital accounts 
  // have the account type "Bilanz". This function returns all accounts with this account type.
  getBalanceSheetAccounts = (): Account[] => {
    return this.accounts.filter(a => ["Assets", "Liabilities", "Equity", "Aktiva", "Passiva", "Eigenkapital"].includes(a.accountType))
  }
  // getAccounnt by number
  getAccountById = (id: number): Account => {
    const acc = this.accounts.find(a => a.id === id)
    if (!acc) {
      console.error("getAccountById: account not found for id ", id)
      return this.Errors
    }
    return acc
  }
  saldierenEuro(owner: string): number {
    return Math.round(this.accounts.filter(a => a.owner === owner).reduce((acc, cv) => cv.name !== "Kilometer" ? acc += cv.saldo() : acc, 0) * 100) / 100
  }
  // find account by name and owner and return its saldo for the current period
  // period cound be "2024", "2024-Q1", "alles bis 2025", "alles bis 2024-Q3", "2024-Q2 bis 2024-Q4" etc.
  // if 'period' contains 'alles bis' the nsaldiere all rows after the given date
  saldoByAccountAndPeriod(owner: string, name: string, period: string): number {
    const account = this.findAccount(owner, name)
    let r: Booking[] = account.bookings
    if (account === this.Errors) {
      logd("saldoByAccountAndPeriod: account not found for owner ", owner, " and name ", name)
      return 0
    }
    // check format of period and filter bookings accordingly
    if (period && period.indexOf('bis') > 0) {
      const date = period.split('bis')[1].trim()
      r = account.bookings.filter((e: any) => e.date.substring(0, 4) <= date)
    } else if (period && period === 'über alles') {
      // nop, take all values
    } else if (isNaN(Number(period))) {
      // ignore the selector and do not filter, i.e. take all values
    } else {
      r = account.bookings.filter((e: any) => e.date.substring(0, 4) === period)
    }
    return +r.reduce((acc: number, cv: any) => acc += cv.haben - cv.soll, 0).toFixed(2)
  }
  // getGesellschafterKonten: return all accounts that have a Gesellschafter as owner
  // and that are Bilanz accounts, i.e. not "System" accounts and not accounts of the "Gesellschaft"  

  getBalanceSheetAccountsOfStakeholders(): Account[] {
    const stakeholder = this.shStore?.getGesellschafter || []
    return this.getBalanceSheetAccounts().filter(a => stakeholder.includes(a.owner) && a.owner)
  }
}