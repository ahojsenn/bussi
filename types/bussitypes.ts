import logd from "../utils/logDebug"
import { Account } from "./accounting"

export class HauptbuchBooking {
  nr: string
  date: string
  account: string
  km: number
  kmSinceLastEntry: number
  kmSinceLastFuelFill: number
  liters: number
  consumption: number
  fuelPriceInEuro: number
  amount: number
  description: string
  key: string
  rowNr: number
  constructor(
    nr: string,
    date: string,
    account: string,
    km: number,
    kmSinceLastEntry: number,
    kmSinceLastFuelFill: number,
    liters: number | undefined,
    consumption: number | undefined,
    fuelPriceInEuro: number | undefined,
    amount: number | undefined,
    description: string,
    key: string,
    rowNr?: number,
  ) {
    this.nr = nr
    this.date = date
    this.account = account
    this.km = km
    this.kmSinceLastEntry = kmSinceLastEntry
    this.kmSinceLastFuelFill = kmSinceLastFuelFill
    this.liters = liters || 0
    this.consumption = consumption || 0
    this.fuelPriceInEuro = fuelPriceInEuro || 0
    this.amount = amount || 0
    this.description = description
    this.key = key
    this.rowNr = rowNr || 0
  }

  // Datum	Wer	km (Endstand)	km	km seit letzter Tankung	Liter getankt	Verbrauch/l	Benzinpreis	Betrag	Was	V-Schlüssel
  toSpreadsheetRow(): (string | number | undefined)[] {
    return [
      // Datum mit YYYY-MM-DD hh:mmformat
      this.date,
      this.account,
      this.km,
      this.kmSinceLastEntry,
      this.kmSinceLastFuelFill,
      this.liters,
      this.consumption,
      this.fuelPriceInEuro,
      this.amount,
      this.description,
      this.key,
    ]
  }
}



// definiere den typ Raw-account, damit die Daten aus google korrekt typisiert werden können
export type RawAccount = {
  Name: string
  Bezeichnung: string
  Anfangsbestand: string
  Einheit: string
  Kontotyp: "T-Konto" | "Listenkonto"
}

// definiere den typ RawStakeholder, damit die Daten aus google korrekt typisiert werden können
export type RawStakeholder = {
  Name: string
  Verteilung: string
}

// definiere die RawPerioden
export type RawPeriode = {
  Periode: string
  Reparaturpauschale: string
}



export class BussiAccountSystem {
  accounts = [] as Array<Account>
  hauptbuchBookings = [] as Array<HauptbuchBooking>
  Errors = {} as Account
  Errors1 = {} as Account
  Konto9000 = {} as Account
  constructor(stakeholder = [] as Array<string>, accounts = [] as Array<string>, hauptbuchBookings = [] as Array<HauptbuchBooking>) {
    this.hauptbuchBookings = hauptbuchBookings
    this.Errors = new Account("Errors", "system")
    this.Errors1 = new Account("Errors1", "system")
    // this.Konto9000 = new Account("zum Ausbuchen Tankunterfüllstand am Jahresende", "Bussi")
    for (const owner of stakeholder)
      for (const name of accounts) {
        this.accounts.push(new Account(name, owner))
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