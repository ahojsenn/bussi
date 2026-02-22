// /composables/book.ts
import { Account, Booking } from '@/types'

export const book = (bk: Booking, from: Account, to: Account) => {
  if (bk === null) return
  // 1. Wir erstellen die Buchung für das QUELL-Konto (from)
  // Hier steht der Betrag im HABEN (Geld/KM geht weg)
  const entryFrom = new Booking(
    bk.nr, bk.date, 
    0,           // soll
    bk.amount,   // haben <---
    bk.description, bk.amount, bk.quantity, 
    from.id, to.id
  )

  // 2. Wir erstellen die Buchung für das ZIEL-Konto (to)
  // Hier steht der Betrag im SOLL (Geld/KM kommt an)
  const entryTo = new Booking(
    bk.nr, bk.date, 
    bk.amount,   // soll <---
    0,           // haben
    bk.description, bk.amount, bk.quantity, 
    from.id, to.id
  )

  from.bookings.push(entryFrom)
  to.bookings.push(entryTo)
}


// 