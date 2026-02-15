import { euroToNumber } from "./euroToNumber"
import { Account, Booking, BussiAccountSystem, HauptbuchBooking } from "./types"

export const toEuro = (s: string): string => s.indexOf('€') > 0 ? s : parseFloat(s == '' ? '0' : s) + ' €'
export const eToN = (s: string): number => parseFloat(s.replace('€', '').trim().replace('.', ''))
export const lToN = (s: string): number => parseFloat(s.replace('l', '').trim().replace('.', ''))
export const toDINDate = (date: Date): string => date.toISOString().substring(0, 16).replace('T', ' ')

export const isAusgleichsbuchung = (bk: HauptbuchBooking) => bk.key.indexOf("an: ") === 0
export const isJahresBeitragsBuchung = (bk: HauptbuchBooking) => bk.key.indexOf("Jahresbeitrag") === 0  // 0 means it is the first word
// identify Tanken by the two following things. Amount has been payed and liters >> 0
export const bookingType = (booking: HauptbuchBooking) => {
  if (booking.amount > 0 && booking.liters > 0) return "Tanken"
  if (booking.amount > 0 && booking.liters == 0) return "Sonstiges"
  if (booking.amount == 0 && booking.kmSinceLastEntry > 0) return "Fahren"
  return "Unbekannt"
}
export const bookingIsTanken = (booking: HauptbuchBooking) => (booking.amount > 0) && (booking.liters > 0)
// find out, who has driven how many km since the last fuel fill-up
export const whoHasDrivenHowManyKmSinceLastFill = (allBookingsOfPeriod: Array<HauptbuchBooking>, shStore: any): Object => {
  const kmSinceLastFill = new Object() as { [key: string]: number }
  shStore.personen.forEach((sh: string) => kmSinceLastFill[sh] = 0)
  //shStore.personen.forEach( (sh: string) => kmSinceLastFill[sh] = 0)
  allBookingsOfPeriod.forEach((b: HauptbuchBooking) => {
    // if buchung is Tanken, reset the km counter for all stakeholders
    if (bookingIsTanken(b)) {
      shStore.personen.forEach((sh: string) => kmSinceLastFill[sh] = 0)
      return
    }
    const accounts = shStore.shVerteilung(b.account).split(',').map((item: string) => item.trim())
    accounts.forEach((who: string) => {
      const km = b.kmSinceLastEntry / accounts.length
      if (km === 0) return
      // throw error if who is not in shStore.personen
      if (!shStore.personen.includes(who)) {
        return
      }
      kmSinceLastFill[who] += km
    })
  })
  return kmSinceLastFill
}
export const euroString = (x: Number): string => x.toFixed(2).replace('.', ',') + ' €'
export const twoDigits = (x: number): number => Math.round(x * 100) / 100
