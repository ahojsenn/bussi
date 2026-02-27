import { defineStore } from 'pinia'
import { useStakeholderStore } from './stakeholder';
import { useAccountsStore } from './accounts'
import { useHauptbuchStore } from './hauptbuch';
import logd from '../utils/logDebug'
import { Account, Booking } from '@/types';
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
  Errors: Account = new Account(2000000, "Errors", "System")
  Errors1: Account = new Account(2000001, "Errors1", "System")
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

    // generate accounts for all stakeholders and account types, but only Listenkonten for Bussi
    for (const [sh_nr, sh] of (shS?.verteilungPersonen || []).entries()) {
      for (const [acc_nr, acc] of (aS?.accounts || []).entries()) {
        // skip Listenkonton for stakeholders but the first one, which is Bussi
        if (acc.Kontotyp === "Listenkonto" && sh !== "Bussi") {
          // logd("accountSystem.constructor: skipping Listenkonto for ", sh);
          continue
        }
        else
          // create T-Accounts for all stakeholders, but only Listenkonten for Bussi
          // logd("accountSystem.constructor: creating account for ", sh, acc.Name),
          this.accounts.push(new Account(generateStructuredAccountId(sh_nr + 1, acc_nr + 1), acc.Name, sh))

      }
    }
    // book Anfangsbestand for all accounts in the system for the first period
    const firstPeriod = this.periodenStore?.perioden[0]
    if (firstPeriod) {
      for (const sh of shS?.verteilungPersonen || [])
        for (const acc of aS?.accounts || []) {
          // skip Listenkonton for stakeholders but the first one, which is Bussi
          if (acc.Kontotyp === "Listenkonto" && sh !== "Bussi") {
            // logd("accountSystem.constructor: skipping Listenkonto for ", sh);
            continue
          }
          else {
            // logd("accountSystem.constructor: booking Anfangsbestand for ", sh, acc.Name, " with amount ", acc.Anfangsbestand, " and unit ", acc.Einheit)
            const account = this.findAccount(sh, acc.Name)
            if (account !== this.Errors) {
              //account.book(firstPeriod.Periode, parseFloat(acc.Anfangsbestand), acc.Einheit, "Anfangsbestand")
            } else {
              logd("accountSystem.constructor: account not found for ", sh, acc.Name)
            }
          }
        }
    } else {
      logd("accountSystem.constructor: no periods found in periodenStore")
    }
  }
  findAccount(owner: string, name: string): Account {
    acc: this.Errors
    // logd("findAccountbyON", name, owner, this.accounts.find(a => (a.name === name) && (a.owner === owner)))
    return this.accounts.find(a => (a.name === name) && (a.owner === owner))
      || this.Errors
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
}