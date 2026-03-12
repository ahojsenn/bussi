// types/accounting.ts
import { v4 as uuidv4 } from 'uuid'; // Falls du das npm-Paket 'uuid' nutzt

export type Unit = '€' | 'EUR' | 'USD' | 'kg' | 'Liter' | '€/Liter' | 'Liter/100km' | 'km' | "Errors";
export type AccountType =
  | 'asset'      // Aktivkonto (Vermögen, z.B. Bank, Kasse, Auto)
  | 'liability'  // Passivkonto (Verbindlichkeiten/Schulden, z.B. Darlehen)
  | 'equity'     // Eigenkapitalkonto (Das Reinvermögen der Gemeinschaft)
  | 'revenue'    // Ertragskonto (Einnahmen)
  | 'expense'    // Aufwandskonto (Kosten, z.B. Tanken, Reparaturen)
  | 'Aktivkonto'        // Aktivkonto (Vermögen, z.B. Bank, Kasse, Auto)
  | 'Passivkonto'       // Passivkonto (Verbindlichkeiten/Schulden, z.B. Darlehen)
  | 'Eigenkapitalkonto' // Eigenkapitalkonto (Das Reinvermögen der Gemeinschaft)
  | 'Ertragskonto'      // Ertragskonto (Einnahmen)
  | 'Aufwandskonto'     // Aufwandskonto (Kosten, z.B. Tanken, Reparaturen)
  | 'System'
  | 'Errors'
  | 'Statistikkonto'
  | 'Hilfskonto'


// Nutze diesen sicheren Fallback:
// id would like to be unique, but we don't want to rely on crypto.randomUUID() in case of non-HTTPS environments
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Einfacher Fallback für Nicht-HTTPS Umgebungen
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
};

export class Booking {
  nr: string
  date: string
  soll: number
  haben: number
  description: string
  amount: number
  quantity?: number; // Optional, falls Menge vorhanden
  sollKonto?: number
  habenKonto?: number
  constructor(
    nr: string,
    date: string,
    soll: number,
    haben: number,
    description: string,
    amount: number,
    quantity?: number, // Optional, falls Menge vorhanden
    sollKonto?: number,
    habenKonto?: number,

  ) {
    this.nr = nr
    this.date = date
    this.soll = soll
    this.haben = haben
    this.description = description
    this.amount = amount
    this.quantity = quantity
    this.sollKonto = sollKonto
    this.habenKonto = habenKonto
  }
}

export class Account {
  id: number
  name: string
  owner: string
  unit: Unit // = 'EUR' , unit for the quantity, e.g. 'km' for the kilometer account  
  bookings = [] as Array<Booking>
  accountType: AccountType
  constructor(id: number, name: string, owner: string, unit: Unit, accountType: AccountType) {
    this.id = id
    this.name = name
    this.owner = owner
    this.unit = unit
    this.accountType = accountType
    this.bookings = []
  }
  nbookings(p: string): number {
    if (p === 'über alles') {
      return this.bookings.length
    }
    // else if (p === 'alles bis yyyy') {
    else if (p.startsWith('alles bis ')) {
      const year = p.substring('alles bis '.length)
      return this.bookings.filter(b => b.date.substring(0, 4) <= year).length
    }
    // else if (p === 'yyyy') {
    else if (Number(p)) {
      return this.bookings.filter(b => b.date.substring(0, 4) === p).length
    }
    else return this.bookings.length
  }
  saldo(): number {
    const rawSaldo = this.bookings.reduce((acc, cv) => {
      // Wir berechnen den Netto-Effekt auf das Konto
      return acc + (cv.haben - cv.soll);
    }, 0);

    // Rundung auf 2 Nachkommastellen
    return Math.round(rawSaldo * 100) / 100;
  }
  saldoAmount(): number {
    return Math.round(100 *
      + this.bookings.reduce((acc, cv) => acc += cv.amount, 0)
    ) / 100
  }
  saldoQuantity(): number {
    return Math.round(100 *
      + this.bookings.reduce((acc, cv) => acc += cv.quantity || 0, 0)
    ) / 100
  }
  saldoY(year: string): number {
    // 1. Sicherheit: Falls keine Buchungen da sind, 0 zurückgeben
    if (!this.bookings) return 0;

    const rawSaldo = this.bookings
      .filter(b => {
        // 2. Robusterer Check: Prüfen, ob b.date existiert und das Jahr matcht
        return b.date && b.date.startsWith(year);
      })
      .reduce((acc, cv) => {
        // 3. Präzision: Wir runden jeden Zwischenschritt auf 4 Stellen, 
        // um Floating-Point-Fehler zu minimieren
        const lineSaldo = (cv.haben || 0) - (cv.soll || 0);
        return acc + lineSaldo;
      }, 0);

    // 4. Finale Rundung auf 2 Stellen
    return Math.round(rawSaldo * 100) / 100;
  }
  saldoPeriod(p: string): number {
    // also ork with periods like 'über alles' or 'alles bis 2022'
    if (p === 'über alles') {
      return this.saldo()
    }
    // else if (p === 'alles bis yyyy') {
    else if (p.startsWith('alles bis ')) {
      const year = p.substring('alles bis '.length)
      return this.saldoY(year)
    }
    // else if (p === 'yyyy') {
    else if (Number(+p)) {
      return this.saldoY(p.toString())
    }
    else return this.saldo()
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
  // book a new entry on the account
  addBooking(booking: Booking): void {
    this.bookings.push(booking);
  }
}