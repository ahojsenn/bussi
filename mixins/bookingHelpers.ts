import { Account, Booking, BussiAccountSystem, HauptbuchBooking } from "./types"

export const isAusgleichsbuchung = (bk: HauptbuchBooking) => bk.key.indexOf("an: ") === 0
export const isJahresBeitragsBuchung = (bk: HauptbuchBooking) => bk.key.indexOf("Jahresbeitrag") === 0  // 0 means it is the first word
export const bookingIsTanken = (booking: HauptbuchBooking) => +(booking.kmSinceLastFuelFill || "0") != 0 || "Tanken".indexOf(booking.description) > 0
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
      const km = +parseFloat(b.kmSinceLastEntry.replace(',', '.')) / accounts.length
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
