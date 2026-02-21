import { book } from './book';
import logd from '../utils/logDebug';
import { Booking, BussiAccountSystem, HauptbuchBooking } from "../types"
import * as bookingHelpers from './bookingHelpers';
import { checkBookingSyntax } from './checkBookingSyntax';
import { euroToNumber } from '../utils/euroToNumber';
import { accountSystem, useAccountSystemStore } from '~/stores/accountSystem';
import { useStakeholderStore } from '~/stores/stakeholder';
import type { usePeriodenStore } from '~/stores/perioden';

const liter = (b: HauptbuchBooking): number => bookingHelpers.bookingIsTanken(b) ? +(((b.liters || 0) + "").replace('l', '').trim().replace(',', '.')) : 0


export const bookEverythingtoBS = (bs: accountSystem): accountSystem => {
  const shStore = bs.shStore;
  const perioden = bs.periodenStore
  const allBookingsOfPeriod = bs.hbStore?.bookings || []

  let benzinpreis = 1.71
  let verbrauch = 9.5
  const nb = allBookingsOfPeriod.length
  const isFoL = (i: number) => i === 0 || i === nb - 1

  logd("bookEverythingtoBS: ", perioden?.currentPeriod, "::", allBookingsOfPeriod)
  let lastBooking = allBookingsOfPeriod[0];
  for (const [index, booking] of allBookingsOfPeriod.entries()) {
    isFoL(index) ?? logd("bookEverythingtoBS starting: ", index, booking.account)
    let bookingError = checkBookingSyntax(booking, lastBooking)
    lastBooking = booking
    isFoL(index) ?? logd("booking: ", booking.description, booking.account, booking.key)
    const splits = (shStore?.shVerteilung(booking.account) ?? '').split(',')
    const nSplits = splits.length
    isFoL(index) ?? logd("bookEverythingtoBS splits: ", splits)

    for (const split of splits) { // splits occur, E.g. Bob --> Frankziska & Nils
      let bookingWasUsed = false
      const splitAccount = split.trim()

      // is slpitAccount in the account list?
      if (!bs.findAccount(splitAccount, "Konto 1")) {
        //logd("Error: Konto nicht gefunden: ", splitAccount, booking)
        const from = bs.findAccount("System", "Errors")
        const to = bs.findAccount("System", "Errors1")
        const text = "Konto " + splitAccount + " nicht gefunden"
        const bk = new Booking(booking.nr, booking.date, 0, euroToNumber(booking.amount), text, +booking.km)
        book(bk, from, to)
        bookingWasUsed = true
      }

      // Jahresbeitrag buchen
      if (bookingHelpers.isJahresBeitragsBuchung(booking)) {
        const from = bs.findAccount("Bussi", "Konto 1")
        const to = bs.findAccount(splitAccount, "Konto 1")
        const betrag = euroToNumber(booking.amount) / nSplits
        const text = booking.account + " Jahresbeitrag " + booking.description + " " + betrag + " " + booking.amount
        const bk = new Booking(booking.nr, booking.date, 0, betrag, text, +booking.km)
        book(bk, from, to)
        bookingWasUsed = true
      }

      // Ausgleichsbuchungen durchführen, die erkennt man am "an: "+Stakeholder im key
      if (bookingHelpers.isAusgleichsbuchung(booking)) {
        const from = bs.findAccount(splitAccount, "Ausgleichskonto")
        const to = bs.findAccount(booking.key.slice(4), "Ausgleichskonto")  // slice(4), weil "an: " 4 Characters hat...
        const betrag = euroToNumber(booking.amount) / nSplits
        const text = booking.account + " Ausgleichsbuchung an " + booking.key.slice(4) + " " + betrag
        const bk = new Booking(booking.nr, booking.date, 0,
          betrag,
          text,
          +booking.km - +(booking.kmSinceLastEntry || "0"))
        book(bk, from, to)
        bookingWasUsed = true
        logd("bookEverythingtoBS: Ausgleichbuchung gefunden ", booking.key, booking.key.slice(4), from, to, bk)
      }

      // zuerst Benzinpreis aktualisieren, Verbrauch aktualisieren
      if (bookingHelpers.bookingIsTanken(booking)) {
        if (euroToNumber(booking.fuelPriceInEuro))
          benzinpreis = Math.round(1000 * euroToNumber(booking.fuelPriceInEuro)) / 1000
        //logd("bookEverythingtoBS: set benzinpreis to ", benzinpreis, booking)
        if (booking.consumption && +booking.consumption != 0) {
          verbrauch = Math.round(100 * booking.consumption) / 100
          // logd("bookEverythingtoBS: set verbrauch to ", verbrauch, 100 * booking.consumption)

          // check if the verbrauch is in the correct range 8,5 - 10,5 liter/100km
          if (verbrauch < 7.5 || verbrauch > 12) {
            const from = bs.findAccount("System", "Errors")
            const to = bs.findAccount("System", "Errors1")
            const text = "falscher Verbrauchswert:   " + verbrauch + "  Liter/100km<br>"
              + booking.account + " Verbrauch " + booking.description + " "
              + "<br> amount:" + booking.amount / nSplits
              + "<br> kmSinceLastEntry:" + booking.kmSinceLastEntry
              + "<br> splits:" + splits
              + "<br> booking:" + JSON.stringify(booking)
            const bk = new Booking(booking.nr, booking.date, 0, euroToNumber(booking.amount / nSplits), text, +booking.km)
            book(bk, from, to)
          }
        }
      }

      // Konto3: Reparaturen
      const reparatur = (b: HauptbuchBooking): boolean => +b.key > 0 // this is a positive number
        || b.key.indexOf("Reparatur") > -1 // or it has the word "Reparatur" in it
      if (reparatur(booking)) {
        const from = bs.findAccount(splitAccount, "Konto 3")
        const to = bs.findAccount("Bussi", "Konto 3")
        const betrag = euroToNumber(booking.amount) / nSplits
        const text = booking.account + " Reparatur "
          + booking.description + " "
          + betrag
          + " " + booking.amount
        //+ "<br> verteilt auf "+ booking.key + " km"
        const bk = new Booking(booking.nr, booking.date, 0,
          betrag,
          text,
          +booking.km - +(booking.kmSinceLastEntry || "0"))
        book(bk, from, to)
        bookingWasUsed = true
      }

      const kilometerWurdenGefahren = (b: HauptbuchBooking) => b.kmSinceLastEntry
      if (kilometerWurdenGefahren(booking) < 0) {
        //logd("in bookEveythingToBS: ERROR, negative km gefahren! ", booking)
        bookingError += "<br>negative km gefahren!?!"
      }
      else
        // perioden checken, ob es eine gültige Periode gibt, wenn ja, dann Kilometer verbuchen
        if (perioden && kilometerWurdenGefahren(booking) > 0) {
          /* Kilometer wurden gefahren */
          const from = bs.findAccount(splitAccount, "Kilometer")
          const to = bs.findAccount("Bussi", "Kilometer")
          const km = booking.kmSinceLastEntry / nSplits
          const kmEnde = +booking.km
          const kmStart = kmEnde - booking.kmSinceLastEntry // parseFloat(booking.kmSinceLastEntry || "0")
          const benzingeld = Math.round(benzinpreis * km * verbrauch) / 100 / nSplits
          const bk_year = booking.date.substring(0, 4)
          const reppausch = Math.round(100 * (+perioden.reparaturpauschale(bk_year).replace(",", ".")) * km) / 100 / nSplits
          const text = booking.account + " Kilometer " + km
            + " von " + booking.kmSinceLastEntry + " km, "
            + splitAccount + "-->" + "Bussi"
            + " " + booking.description
            + "<br>Benzingeld: " + benzingeld + " €, Reparaturgeld: " + reppausch + " € für " + km + " km"
          const bk = new Booking(booking.nr, booking.date, km, 0, text, kmStart)
          book(bk, from, to)

          // set this to true only, if there is no amount in booking.amount
          // otherwise this has also to be booked in "Tanken" or "Sonstiges"
          if (booking.amount == 0) bookingWasUsed = true

          //logd("bookEverythingtoBS.Kilometer: ", splits, bk, from, to)
          /* Kilometer verbucht, nun Benzinpreis verbuchen */
          const from1 = bs.findAccount(splitAccount, "Konto 2")
          const to1 = bs.findAccount("Bussi", "Konto 2")
          const text1 = "Benzingeld: " + splitAccount + "-->Bussi, " + benzingeld + " € für " + km + " km"
            + ", Benzinpreis: " + benzinpreis + "€/L, Verbrauch: " + verbrauch + " =" + Math.round(benzinpreis * verbrauch) / 100 + "€/km"
          const bk1 = new Booking(booking.nr, booking.date, benzingeld, 0, text1, kmStart)
          book(bk1, from1, to1)


          // Reparaturkosten aus Kilometern verbuchen
          const from2 = bs.findAccount("Bussi", "Konto 3")
          const to2 = bs.findAccount(splitAccount, "Konto 3")
          const bk2 = new Booking(booking.nr, booking.date, 0, reppausch,
            "Reparaturpauschale " + perioden.reparaturpauschale(bk_year) + " €/km * " + km + " km "
            + "= " + reppausch + " € : " + splitAccount + " --> Bussi", kmStart
          )
          book(bk2, from2, to2)

          // Tankstand abbuchen, wenn Kilometer gefahren wurden
          const to3 = bs.findAccount("Bussi", "Tankstand")
          const from3 = bs.findAccount(splitAccount, "Tankstand")
          const consumedLiters = Math.round(100 * km * verbrauch / 100) / 100
          const bk3 = new Booking(booking.nr, booking.date, 0, consumedLiters,
            km + " km gefahren: " + splitAccount + "-->Bussi, " + consumedLiters + " Liter für " + km + " km", kmStart
          )
          book(bk3, from3, to3)

        }


      /* Tankungen buchen  */
      if (bookingHelpers.bookingIsTanken(booking)) {
        const amount = Math.round(100 * euroToNumber(booking.amount)) / 100
        // benzinpreis = Math.round(1000 * amount / liter(booking)) / 1000
        //benzinpreis = Math.round(1000 * euroToNumber(booking.fuelPriceInEuro)) / 1000
        //verbrauch = berechneVerbrauch(liter(booking), kmPerFill(booking))
        const from = bs.findAccount("Bussi", "Konto 2")
        const to = bs.findAccount(splitAccount, "Konto 2")
        const text = booking.account + ": Tanken für " + amount / nSplits + "€, " + liter(booking) / nSplits + " Liter, "
          + "<br> Verbrauch: " + verbrauch + " l/100km, "
          + "<br>" + splitAccount + "-->" + "Bussi"
          + "<br>Benzinpreis: " + benzinpreis + " €/l"
        const betrag = euroToNumber(booking.amount) / nSplits
        const kmEnde = +booking.km
        const kmStart = kmEnde - booking.kmSinceLastEntry // parseFloat(booking.kmSinceLastEntry || "0")
        const bk = new Booking(booking.nr, booking.date, betrag, 0, text, kmStart)
        book(bk, from, to)
        bookingWasUsed = true
        // logd("bookEverythingToBS.Tanken: ", splits, bk, from, to, booking.kmSinceLastFuelFill)
        /* Tanken verbucht */

        // Tankstand verbuchen, wenn getankt wurde
        const from1 = bs.findAccount("Bussi", "Tankstand")
        const to1 = bs.findAccount(splitAccount, "Tankstand")
        const bk1 = new Booking(booking.nr, booking.date, 0, liter(booking) / nSplits,
          "Tanken: " + splitAccount + "-->Bussi, " + liter(booking) / nSplits + " Liter für " + amount + " €", kmStart
        )
        book(bk1, from1, to1)
      }


      /* Konto1: Nutzungsunabhängige Dinge */
      const nutzungsunabhaengig = (b: HauptbuchBooking): boolean => b.key === "gleich"
      if (nutzungsunabhaengig(booking)) {
        const from = bs.findAccount(splitAccount, "Konto 1")
        const to = bs.findAccount("Bussi", "Konto 1")
        const betrag = euroToNumber(booking.amount) / nSplits
        const text = booking.account + " Konto 1 " + booking.description + " " + betrag + " " + booking.amount
        const bk = new Booking(booking.nr, booking.date, 0, betrag, text, +booking.km)
        book(bk, from, to)
        bookingWasUsed = true
      }


      /* Ausgleichszahlunen berücksichtigen */
      const isAusgleichszahlung = (b: HauptbuchBooking): boolean => {
        const receipient = (booking
          && booking.key
          && typeof booking.key === "string"
          && booking.key.split(" ").length > 0) ? booking.key.split(" ")[1] : ""
        // logd("isAusgleichszahlung: ", b.key.split(" ")[0], receipient, b, booking.key)
        return b.key.split(" ")[0] === "an"
          && receipient !== ""
          && (
            receipient === "Bussi" ||
            (shStore?.personen.indexOf(receipient) || 0) >= 0
          )
      }

      if (isAusgleichszahlung(booking)) {
        //logd("Ausgleichszahlung: ", booking)
        const from = bs.findAccount(splitAccount, "Ausgleichskonto")
        const receipient = booking.key.split(" ")[1]
        const to = bs.findAccount(receipient, "Ausgleichskonto")
        const text = booking.account + "-->" + receipient + ": " + booking.description + " " + euroToNumber(booking.amount) / nSplits + " " + booking.amount
        const bk = new Booking(booking.nr, booking.date, 0, euroToNumber(booking.amount) / nSplits, text, +booking.km)
        book(bk, from, to)
        bookingWasUsed = true
      }

      const jahresendbuchung = (b: HauptbuchBooking): boolean => (b.key.toLowerCase() === "jahresendbuchung")
      if (jahresendbuchung(booking)) {
        // const splitLines = (t: string) => t.split(/\r\n|\r|\n/)
        // booking has description with sender:senderaccount  ->  receiver:receiveraccount
        const rsplit = booking.description.match('[A-Za-z0-9_.]*:[A-Za-z0-9_.]*.[0-9]* -> [A-Za-z0-9_.]*:[A-Za-z0-9_.]*.[0-9]*')
        const bookingdescr = rsplit ? rsplit[0] : ""
        // logd("jahresendbuchung: ", booking.description, bookingdescr, rsplit)
        if (bookingdescr === "") {
          bookingError += "malformed Jahresendbuchung, expected something like 'Dagmar:Konto 1 -> Bussi:Konto 1' "
          // return bs
        }
        else {
          const sender = bookingdescr.split(" -> ")[0].split(":")[0]
          // logd("jahresendbuchung: sender", sender, euroToNumber(booking.amount))
          const receiver = bookingdescr.split(" -> ")[1].split(":")[0]
          const senderaccount = bookingdescr.split(" -> ")[0].split(":")[1]
          const receiveraccount = bookingdescr.split(" -> ")[1].split(":")[1]
          const from = bs.findAccount(sender, senderaccount)
          const to = bs.findAccount(receiver, receiveraccount)
          const bk = new Booking(booking.nr, booking.date, euroToNumber(booking.amount) / nSplits, 0, booking.description, booking.km)
          book(bk, from, to)
          bookingWasUsed = true
        }
      }

      /* Nullbuchung ignorieren */
      const isNullbuchung = (euroToNumber(booking.amount) === 0) && +(booking.kmSinceLastEntry || "0") === 0
      if (isNullbuchung) {
        bookingWasUsed = true
        logd("Nullbuchung ignoriert: ", booking, " " + " km:" + booking.kmSinceLastEntry + " €:" + booking.amount)
      }


      /* Fehler buchen */
      if (!bookingWasUsed) bookingError = "booking was not used<br>" + bookingError
      if (bookingError != "") {
        // logd("Fehler: ", booking.amount, " : ", booking.liters)
        const from = bs.findAccount("System", "Errors")
        const to = bs.findAccount("System", "Errors1")
        const text = booking.account + " Konto 1 " + booking.description + " "
          + "<br> amount:" + booking.amount + " " + euroToNumber(booking.amount)
          + "<br> kmSinceLastEntry:" + booking.kmSinceLastEntry
          + "<br> splits:" + splits
          + "<br> booking:" + JSON.stringify(booking)
          + "<br> bookingType:" + bookingHelpers.bookingType(booking)
          + "<br> Error:" + bookingError
        const bk = new Booking(booking.nr, booking.date, 0, euroToNumber(booking.amount), text, +booking.km)
        book(bk, from, to)
      }

      // logd("bookEverathingToBS: ", index, booking)
      // if this is the last booking, do some logging
      if (index === allBookingsOfPeriod.length - 1) {
        logd("in bookeEverythingtoBS this is the last processed booking:", booking)
      }
    }
  }


  return bs
}