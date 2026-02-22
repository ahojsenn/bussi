// types/accounting.ts
import { v4 as uuidv4 } from 'uuid'; // Falls du das npm-Paket 'uuid' nutzt

export type Unit = 'EUR' | 'USD' | 'kg' | 'Liter' | '€/Liter' | 'Liter/100km' | 'km';

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
    //amount: number,
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
    //this.amount = amount
    this.soll = soll
    this.haben = haben
    this.description = description
    //this.kmStart = kmStart || 0
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
  constructor(id: number, name: string, owner: string, unit: Unit = 'EUR') {
    this.id = id
    this.name = name
    this.owner = owner
    this.unit = unit
    this.bookings = []
  }
  saldo(): number {
    //logd("saldo: ", this.name, this.owner, this.soll, this.haben, "")
    return Math.round(100 *
      + this.bookings.reduce((acc, cv) => acc += cv.haben - cv.soll, 0)
      //- this.soll.reduce((acc, cv) => acc += +cv.amount, 0) 
    ) / 100
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
  // book a new entry on the account
  addBooking(booking: Booking): void {
    this.bookings.push(booking);
  }
}