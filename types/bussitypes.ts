import logd from "../utils/logDebug"
import { Account } from "./accounting"

export type Kontenart = "Aufwandskonto" | "Ertragskonto" | "Aktivkonto" | "Passivkonto" | "Hilfskonto" | "Privatkonto" | "Materialkonto" | "Statistikkonto" | "Sonstiges"

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
  toString(): string {
    return JSON.stringify(this)
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
  Einheit: string
  Art: Kontenart
  Kontonummer: number
}

// definiere den typ RawStakeholder, damit die Daten aus google korrekt typisiert werden können
export type RawStakeholder = {
  Name: string
  Verteilung: string
  Typ: string
}

// definiere die RawPerioden
export type RawPeriode = {
  Periode: string
  Reparaturpauschale: string
}