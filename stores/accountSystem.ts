import { defineStore } from 'pinia'
import { useStakeholderStore } from './stakeholder';
import { useAccountsStore } from './accounts'
import { useHauptbuchStore } from './hauptbuch';
import logd from '../utils/logDebug'
import { Account} from '../types'
import { usePeriodenStore } from './perioden';


export const useAccountSystemStore = defineStore('accountSystem', {
  state: () => ({
    // Wir starten leer
    accountSystem: null as AccountSystemClass | null,
    isLoading: false // Hilfreich für UI-Spinner
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
  Errors: Account
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
    this.Errors = new Account("Errors", "system")
    // logd("accountSystem.constructor: stakeholder ", stakeholder, accounts, hbBookings)
    // this.Konto9000 = new Account("zum Ausbuchen Tankunterfüllstand am Jahresende", "Bussi")
    for (const sh of shS?.verteilungPersonen || [])
      for (const acc of aS?.accounts || []) {
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