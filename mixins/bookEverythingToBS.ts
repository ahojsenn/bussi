import { useStakeholderStore } from './../stores/stakeholder';
import { usePeriodenStore } from './../stores/perioden';
import { book } from './book';
import logd from './logDebug';
import { Account, Booking, BussiAccountSystem, HauptbuchBooking } from "./types"

const bookingIsTanken = (booking: HauptbuchBooking) => +booking.kmSinceLastFuelFill != 0 || "Tanken".indexOf(booking.description) > 0
const euroToNumber = (e: string | number) =>
  typeof e === "string" ? parseFloat(e.replace('€', '').trim().replace(',', '.'))
    : Number.isNaN(e) ? 0 : e
const liter = (b: HauptbuchBooking): number => bookingIsTanken(b) ? +b.liters.replace('l', '').trim().replace(',', '.') : 0
const berechneVerbrauch = (l: number, km: number): number => Math.round(100 * 100 * l / km) / 100
const kmPerFill = (b: HauptbuchBooking): number => parseFloat(b.kmSinceLastFuelFill)
let benzinpreis = 0
let verbrauch = 0


export const bookEverythingtoBS = (bs: BussiAccountSystem, allBookingsOfPeriod, shStore, perioden) => {

  logd("bookEverythingtoBS: ", perioden.currentPeriod)
  for (var booking of allBookingsOfPeriod) {
    let bookingWasUsed = false
    //logd ("booking: ", booking.key)
    const splits = shStore.shVerteilung(booking.account).split(',')
    const splitBooking = splits.length > 1  /* if there is a '&', we have to split the booking */
    //logd("splitBooking: ", splitBooking, splits)

    for (var split of splits) {
      const splitAccount = split.trim()

      // Konto3: Reparaturen
      const reparatur = (b: HauptbuchBooking): boolean => +b.key > 0 // this is a posirive number
      if (reparatur(booking)) {
        const from = bs.findAccount(splitAccount, "Konto 3")
        const to = bs.findAccount("Bussi", "Konto 3")
        const text = booking.account + " Reparatur "
          + booking.description + " "
          + euroToNumber(booking.amount)
          + " " + booking.amount
        //+ "<br> verteilt auf "+ booking.key + " km"
        const bk = new Booking(booking.nr, booking.date, 0,
          euroToNumber(booking.amount),
          text,
          +booking.km - +booking.kmSinceLastEntry)
        book(bk, from, to)
        bookingWasUsed = true
      }


      /* Tankungen buchen und aktuellen Benzinpreis fixieren */
      if (bookingIsTanken(booking)) {
        benzinpreis = Math.round(1000 * euroToNumber(booking.amount) / liter(booking)) / 1000
        verbrauch = berechneVerbrauch(liter(booking), kmPerFill(booking))
        const from = bs.findAccount("Bussi", "Konto 2")
        const to = bs.findAccount(splitAccount, "Konto 2")
        const text = booking.account + " Tanken " + liter(booking) + " Liter, "
          + "<br> Verbrauch: " + verbrauch + " l/100km, "
          + "<br>" + splitAccount + "-->" + "Bussi"
          + "<br>Benzinpreis: " + benzinpreis + " €/l"
        const betrag = euroToNumber(booking.amount) / splits.length
        const bk = new Booking(booking.nr, booking.date, betrag, 0, text)
        book(bk, from, to)
        bookingWasUsed = true
        //logd("Tanken: ", splits, bk, from, to, booking)
        /* Tanken verbucht */
      }

      const kilometerWurdenGefahren = (b) => parseFloat(b.kmSinceLastEntry) != 0
      if (kilometerWurdenGefahren(booking)) {
        /* Kilometer wurden gefahren */
        const from = bs.findAccount(splitAccount, "Kilometer")
        const to = bs.findAccount("Bussi", "Kilometer")
        const km = parseFloat(booking.kmSinceLastEntry) / splits.length
        const kmEnde = +booking.km
        const kmStart = kmEnde - parseFloat(booking.kmSinceLastEntry)
        const benzingeld = Math.round(benzinpreis * km * verbrauch) / 100
        const reppausch = Math.round(100 * (+perioden.reparaturpauschale(perioden.currentPeriod).replace(",", ".")) * km) / 100
        const text = booking.account + " Kilometer " + km
          + " von " + booking.kmSinceLastEntry + " km, "
          + splitAccount + "-->" + "Bussi"
          + " " + booking.description
          + "<br>Benzingeld: " + benzingeld + " €, Reparaturgeld: " + reppausch + " € für " + km + " km"
        const bk = new Booking(booking.nr, booking.date, km, 0, text)
        book(bk, from, to)
        bookingWasUsed = true

        //logd("Kilometer: ", splits, bk, from, to)
        /* Kilometer verbucht, nun Benzinpreis verbuchen */
        const from1 = bs.findAccount(splitAccount, "Ausgleichskonto")
        const to1 = bs.findAccount("Bussi", "Konto 2")
        const text1 = "Benzingeld: " + benzingeld + " € für " + km + " km"
          + "Benzinpreis = " + Math.round(benzinpreis * verbrauch) / 100 + " €/km"
        const bk1 = new Booking(booking.nr, booking.date, benzingeld, 0, text1)
        book(bk1, from1, to1)


        // Reparaturkosten aus kilometern verbuchen
        const from2 = bs.findAccount("Bussi", "Konto 3")
        const to2 = bs.findAccount(splitAccount, "Ausgleichskonto")
        const bk2 = new Booking(booking.nr, booking.date, 0, reppausch,
          "Reparaturkosten aus Kilometern von " + perioden.reparaturpauschale(perioden.currentPeriod) + " €/km"
          + "<br> Reparaturpauschale: " + reppausch + " € für " + km + " km"
          + "<br> " + splitAccount + " --> Bussi"
        )
        book(bk2, from2, to2)
      }

      /* Konto1: Nutzungsunabhängige Dinge */
      const nutzungsunabhaengig = (b: HauptbuchBooking): boolean => b.key === "gleich"
      if (nutzungsunabhaengig(booking)) {
        const from = bs.findAccount(splitAccount, "Konto 1")
        const to = bs.findAccount("Bussi", "Konto 1")
        const text = booking.account + " Konto 1 " + booking.description + " " + euroToNumber(booking.amount) + " " + booking.amount
        const bk = new Booking(booking.nr, booking.date, 0, euroToNumber(booking.amount), text, +booking.km)
        book(bk, from, to)
        bookingWasUsed = true
      }




      /* Reparaturpauschale buchen */

      /* Nullbuchung ignorieren */
      if ((euroToNumber(booking.amount) === 0) && +booking.kmSinceLastEntry === 0) {
        bookingWasUsed = true
      }

      /* Fehler buchen */
      const to = new Account("Nullkonto", "Errors")
      if (!bookingWasUsed) {
        const from = bs.findAccount("System", "Errors")
        const text = booking.account + " Konto 1 " + booking.description + " "
          + "<br> amount:" + booking.amount + " " + euroToNumber(booking.amount)
          + "<br> kmSinceLastEntry:" + booking.kmSinceLastEntry
          + "<br> splits:" + splits
          + "<br> booking:" + JSON.stringify(booking)
        const bk = new Booking(booking.nr, booking.date, 0, euroToNumber(booking.amount), text, +booking.km)
        book(bk, from, to)
      }

    }
  }

  return bs
}