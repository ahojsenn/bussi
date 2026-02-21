import logd from "../utils/logDebug"

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

export class Booking {
  nr: string
  date: string
  //amount: number
  soll: number
  haben: number
  description: string
  kmStart: number
  constructor(
    nr: string,
    date: string,
    //amount: number,
    soll: number,
    haben: number,
    description: string,
    kmStart?: number,
  ) {
    this.nr = nr
    this.date = date
    //this.amount = amount
    this.soll = soll
    this.haben = haben
    this.description = description
    this.kmStart = kmStart || 0
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

export class Account {
  name: string
  owner: string
  bookings = [] as Array<Booking>
  constructor(name: string, owner: string) {
    this.name = name
    this.owner = owner
    this.bookings = []
  }
  saldo(): number {
    //logd("saldo: ", this.name, this.owner, this.soll, this.haben, "")
    return Math.round(100 *
      + this.bookings.reduce((acc, cv) => acc += cv.haben - cv.soll, 0)
      //- this.soll.reduce((acc, cv) => acc += +cv.amount, 0) 
    ) / 100
  }
  saldoY(year: string): number {
    // this should also work with periods like 'über alles' or 'alles bis 2022'
    return Number(year) ? Math.round(100 *
      + this.bookings.filter(b => b.date.substring(0, 4) === year.toString())
        .reduce((acc, cv) => acc += cv.haben - cv.soll, 0)
    ) / 100
      : this.saldo()
  }
  saldoSoll(year: string): number {
    const filterFunc = Number(year)
      ? (b: Booking) => b.date.substring(0, 4) === year.toString()
      : (b: Booking) => true
    return Math.round(100 * +this.bookings.filter(b => filterFunc(b)).reduce((acc, cv) => acc += cv.soll, 0)) / 100
  }
  saldoHaben(year: string): number {
    const filterFunc = Number(year)
      ? (b: Booking) => b.date.substring(0, 4) === year.toString()
      : (b: Booking) => true
    return Math.round(100 * +this.bookings.filter(b => filterFunc(b)).reduce((acc, cv) => acc += cv.haben, 0)) / 100
  }
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