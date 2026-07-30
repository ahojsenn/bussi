import { book } from './book';
import logd from '../utils/logDebug';
import { Booking, HauptbuchBooking, Account } from "@/types"
import * as bookingHelpers from './bookingHelpers';
import { checkBookingSyntax } from './checkBookingSyntax';
import { euroToNumber } from '../utils/euroToNumber';
import { AccountSystemClass } from '~/stores/accountSystem';


export const bookEverythingtoBS = (bs: AccountSystemClass): AccountSystemClass => {
  const shStore = bs.shStore;
  const perioden = bs.periodenStore
  const allBookingsOfPeriod = (bs.hbStore?.bookings || [])



  // set all accounts to have empty bookings, so that we can fill them with the new bookings
  bs.accounts.forEach(acc => acc.bookings = [])
  bs.Errors.bookings = []
  bs.Errors1.bookings = []

  const nb = allBookingsOfPeriod.length
  const companyName = bs.shStore?.getGesellschaft || "Gesellschaft"
  const isFoL = (i: number) => i === 0 || i === nb - 1 // is first or last booking, for logging purposes

  const getActualFromAccountByKm = (a: Account, km: number): number => {
    // find benzinpreis of next booking with the same km or lower
    // because the benzinpreis is only known after the next booking with km is known  
    const kmMatch = (s: string) => parseInt(s.split("km:")[1])
    // Nur brauchbare Werte weiterreichen: ein einziges Infinity/NaN im Statistikkonto würde sonst
    // über den Durchschnitt jede Folgebuchung anstecken
    const isUsable = (b: Booking) => b.amount > 0 && isFinite(b.amount)
    const foundBooking = a.bookings.find((b: Booking) => kmMatch(b.description) >= km)
    if (foundBooking && isUsable(foundBooking)) {
      return foundBooking.amount
    } else {
      // caslculate average from the whole booking set up to here
      const relevantBookings = a.bookings.filter((b: Booking) => kmMatch(b.description) <= km && isUsable(b))
      if (relevantBookings.length > 0) {
        const avg = relevantBookings.reduce((acc, b) => acc + b.amount, 0) / relevantBookings.length
        return avg
      } else {
        return 42.23
      }
    }
  }

  // fill statistics accounte for Benzinpreis, Verbrauch, Kilometer, Reparaturpauschale
  let kmAtLastVollgetankt = allBookingsOfPeriod.length > 0 ? allBookingsOfPeriod[0].km || 0 : 0
  let literSinceLastVollgetankt = allBookingsOfPeriod.length > 0 ? allBookingsOfPeriod[0].liters || 0 : 0
  let verbrauchForStatsAccounts = 0
  for (const [index, booking] of allBookingsOfPeriod.entries()) {
    let sollAccount, habenAccount = null as Account | null

    // if "Tanken" fill benzinpreis and verbrauch, for better statistics
    if (bookingHelpers.isTanken(booking) || booking.liters > 0) {
      literSinceLastVollgetankt += booking.liters
      // check if vollgetankt wurde, if not "nicht vollgetankt" in the description, otherwise "vollgetankt"
      // and there is no "nicht" in the description
      const vollgetankt = booking.description.toLowerCase().indexOf("vollgetankt") > -1
        && booking.description.toLowerCase().indexOf("nicht") === -1
      if (vollgetankt) {
        const kmSeitLetzterTankung = booking.km - kmAtLastVollgetankt
        if (kmSeitLetzterTankung > 0) {
          verbrauchForStatsAccounts = 100 * literSinceLastVollgetankt / kmSeitLetzterTankung
          kmAtLastVollgetankt = booking.km
          literSinceLastVollgetankt = 0
        } else {
          // Zwei Tankungen auf demselben km-Stand (typisch: doppelt abgeschickter Fahrtenbucheintrag).
          // Ohne gefahrene Kilometer ist der Verbrauch nicht berechenbar - früher gab das hier
          // eine Division durch 0, und das Infinity hat sich über das Statistikkonto "Verbrauch"
          // in Benzingeld, Verrechnungskonten und am Ende in die ganze Bilanz fortgepflanzt.
          // Wir behalten den letzten bekannten Verbrauch, verwerfen keine Liter und melden den Fall.
          const text = booking.account + " Tankung ohne gefahrene Kilometer"
            + "<br>km: " + booking.km + " entspricht dem Stand der letzten Tankung"
            + "<br>Liter: " + booking.liters
            + "<br>" + booking.description
            + "<br>Verbrauch nicht berechenbar, doppelt erfasste Tankung?"
          const bkErr = new Booking(booking.nr, booking.date, 0, booking.liters, text, booking.liters, 0, bs.Errors.id, bs.Errors1.id)
          book(bkErr, bs.Errors, bs.Errors1)
        }
      }
      let benzinpreis = 42.23
      if (euroToNumber(booking.fuelPriceInEuro)) {
        benzinpreis = Math.round(1000 * euroToNumber(booking.fuelPriceInEuro)) / 1000
      }

      // Benzinpreis aktualisieren
      sollAccount = bs.findAccount(companyName, "Benzinpreis")
      habenAccount = bs.findAccount(companyName, "Benzinpreis")
      if (sollAccount === bs.Errors || habenAccount === bs.Errors) {
        console.error("bookEverythingtoBS: Fehler, Benzinpreis Konto nicht gefunden ", sollAccount, habenAccount)
        continue
      }
      let text = "Benzinpreis: " + benzinpreis + " €/l, Verbrauch: " + verbrauchForStatsAccounts + " l/100km"
      text += "<br>km: " + booking.km
      let bk = new Booking(booking.nr, booking.date, 0, benzinpreis, text, benzinpreis, 0, sollAccount.id, habenAccount.id)
      book(bk, sollAccount, habenAccount)

      // now book the verbrauch to the account "Bussi", "Verbrauch"
      // but only, if vollgetankt wurde, because otherwise the Verbrauch is not known and we cannot book it, because it is only an estimate based on the previous bookings
      if (vollgetankt) {
        sollAccount = bs.findAccount(companyName, "Verbrauch")
        habenAccount = bs.findAccount(companyName, "Verbrauch")
        if (sollAccount === bs.Errors || habenAccount === bs.Errors) {
          console.error("bookEverythingtoBS: Fehler, Verbrauch Konto nicht gefunden ", sollAccount, habenAccount)
          continue
        }
        let text = vollgetankt ? "Vollgetankt: Ja, " : "Vollgetankt: Nein, "
        text += "<br>Verbrauch: " + verbrauchForStatsAccounts + " l/100km, Benzinpreis: " + benzinpreis + " €/l"
          + " at km: " + booking.km
        let bk1 = new Booking(booking.nr, booking.date, 0, verbrauchForStatsAccounts, text, verbrauchForStatsAccounts, 0, sollAccount.id, habenAccount.id)
        book(bk1, sollAccount, habenAccount)
      }
    }
  }


  // now all the necessary information for Benzinpreis and Verbrauch is in place, 
  // so we can start booking the actual bookings to the accounts
  logd("bookEverythingtoBS: ", perioden?.currentPeriod, "::", allBookingsOfPeriod)
  let lastBooking = allBookingsOfPeriod[0];
  for (const [index, booking] of allBookingsOfPeriod.entries()) {
    let sollAccount, habenAccount = null as Account | null

    isFoL(index) ?? logd("bookEverythingtoBS starting: ", index, booking.account)
    let bookingError = checkBookingSyntax(booking, lastBooking)
    lastBooking = booking
    isFoL(index) ?? logd("booking: ", booking.description, booking.account, booking.key)
    const splits = (shStore?.shVerteilung(booking.account) ?? '').split(',')
    const nSplits = splits.length
    isFoL(index) ?? logd("bookEverythingtoBS splits: ", splits)
    const actualFuelPrice = getActualFromAccountByKm(bs.findAccount(companyName, "Benzinpreis"), booking.km)
    const actualVerbrauch = getActualFromAccountByKm(bs.findAccount(companyName, "Verbrauch"), booking.km)
    const vollgetankt = booking.description.toLowerCase().indexOf("vollgetankt") > -1 && booking.description.toLowerCase().indexOf("nicht") === -1

    for (const split of splits) { // splits occur, E.g. Bob --> Frankziska & Nils
      let bk = null as Booking | null
      let bookingWasUsed = false
      const splitAccount = split.trim()

      // geschuldeter Jahresbeitrag buchen oder
      // von Konto 4510
      // auf Konto 1800 bzw das Teilhaberkonto äquivalent
      if (bookingHelpers.isJahresBeitragsBuchung(booking)) {
        sollAccount = bs.findAccount(splitAccount, "Verrechnungskonto")
        habenAccount = bs.getAccountById(4510)
        const betrag = euroToNumber(booking.amount) / nSplits
        const text = booking.account + ", " + booking.description + ", " + betrag
        bk = new Booking(booking.nr, booking.date, 0, betrag, text, betrag, 0, sollAccount.id, habenAccount.id)
        book(bk, sollAccount, habenAccount)
        bookingWasUsed = true
      }

      // Steuerbuchungen oder Versicherungsbuchungen,
      if (bookingHelpers.isSteuerBuchung(booking) || bookingHelpers.isVersicherungsBuchung(booking)) {
        sollAccount = bs.getAccountById(4510)
        habenAccount = bs.findAccount(splitAccount, "Verrechnungskonto")
        const betrag = euroToNumber(booking.amount) / nSplits
        const text = booking.account + ", " + booking.description + ", " + betrag
        bk = new Booking(booking.nr, booking.date, 0, betrag, text, betrag, 0, sollAccount.id, habenAccount.id)
        book(bk, sollAccount, habenAccount)
        bookingWasUsed = true
      }

      // Ausgleichsbuchungen durchführen, die erkennt man am "an: "+Stakeholder im key
      if (bookingHelpers.isAusgleichsbuchung(booking)) {
        sollAccount = bs.findAccount(booking.key.slice(4), "Verrechnungskonto")  // slice(4), weil "an: " 4 Characters hat...
        habenAccount = bs.findAccount(splitAccount, "Verrechnungskonto")
        const betrag = euroToNumber(booking.amount) / nSplits
        const text = booking.account + " Ausgleichszahlung an " + booking.key.slice(4) + " " + betrag
        bk = new Booking(booking.nr, booking.date, 0, betrag, text, betrag, 0, sollAccount.id, habenAccount.id)
        book(bk, sollAccount, habenAccount)
        bookingWasUsed = true
        // logd("bookEverythingtoBS: Ausgleichszahlung gefunden ", booking.key, booking.key.slice(4), from, to, bk)
      }

      // Konto3: Reparaturen
      // 4540 (Kfz-Reparaturen) an 1891 (Verrechnungskonto Teilnehmer B) — 1.200 €
      const reparatur = (b: HauptbuchBooking): boolean => +b.key > 0 // this is a positive number
        || b.toString().indexOf("Reparatur") > -1 // or it has the word "Reparatur" in it
      if (reparatur(booking)) {
        sollAccount = bs.getAccountById(4550)
        habenAccount = bs.findAccount(splitAccount, "Verrechnungskonto")
        const betrag = euroToNumber(booking.amount) / nSplits
        const text = booking.account + " Reparatur "
          + booking.description + " "
          + betrag
          + " " + booking.amount
        //+ "<br> verteilt auf "+ booking.key + " km"
        bk = new Booking(booking.nr, booking.date, 0, betrag, text, betrag, 0, sollAccount.id, habenAccount.id)
        book(bk, sollAccount, habenAccount)
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
          // Kilometer wurden gefahren 
          // Kilometer verbuchen auf Konto "Kilometer", von splitAccount --> companyAccount, mit Beschreibung, wie viele Kilometer gefahren wurden, von wann bis wann, und mit welchem Verbrauch und Benzin
          sollAccount = bs.findAccount(companyName, "Kilometer")
          habenAccount = bs.findAccount(splitAccount, "Kilometer")
          const km = booking.kmSinceLastEntry / nSplits
          const kmEnde = +booking.km
          const kmStart = kmEnde - booking.kmSinceLastEntry // parseFloat(booking.kmSinceLastEntry || "0")
          const benzingeld = Math.round(actualFuelPrice * km * actualVerbrauch) / 100
          const bk_year = booking.date.substring(0, 4)
          const reppausch = Math.round(100 * (+perioden.reparaturpauschale(bk_year).replace(",", ".")) * km) / 100
          const text = booking.account + " Kilometer " + km
            + " von " + booking.kmSinceLastEntry + " km, "
            + splitAccount + "-->" + companyName
            + " " + booking.description
            + "<br>Benzingeld: " + benzingeld + " € = " + km + " km *" + Math.round(100 * benzingeld / km) / 100 + " €/km"
            + "<br>Reparaturgeld: " + reppausch + " € = " + km + " km *" + Math.round(100 * reppausch / km) / 100 + " €/km "
            + "<br>km: " + kmStart + "-" + kmEnde
          bk = new Booking(booking.nr, booking.date, km, 0, text, km, 0, sollAccount.id, habenAccount.id)
          book(bk, sollAccount, habenAccount)


          // set this to true only, if there is no amount in booking.amount
          // otherwise this has also to be booked in "Tanken" or "Sonstiges"
          if (booking.amount == 0) bookingWasUsed = true

          //nun Benzingeld verbuchen 
          sollAccount = bs.findAccount(splitAccount, "Verrechnungskonto")
          habenAccount = bs.getAccountById(4530)
          const text1 = splitAccount + " fuhr " + km + " km"
            + "<br>Benzingeld: " + benzingeld + " € = " + Math.round(100 * benzingeld / km) / 100 + " €/km"
            + "<br>km: " + kmStart + "-" + kmEnde
          bk = new Booking(booking.nr, booking.date, 0, benzingeld, text1, benzingeld, 0, sollAccount.id, habenAccount.id)
          book(bk, sollAccount, habenAccount)


          // nun Reparaturpauschale verbuchen
          sollAccount = bs.findAccount(splitAccount, "Verrechnungskonto")
          habenAccount = bs.getAccountById(4550)
          let text2 = "Reparaturpauschale " + perioden.reparaturpauschale(bk_year) + " €/km * " + km + " km "
            + "= " + reppausch + " € : " + splitAccount + " --> " + companyName
          bk = new Booking(booking.nr, booking.date, 0, reppausch, text2, reppausch, 0, sollAccount.id, habenAccount.id)
          book(bk, sollAccount, habenAccount)

          // Statistikkonnto LiterKraftstoff bebuchen
          sollAccount = bs.findAccount(companyName, "LiterKraftstoff")
          habenAccount = bs.findAccount(splitAccount, "LiterKraftstoff")
          const verbrauchteLiter = Math.round(km * actualVerbrauch) / 100
          const text4 = splitAccount + " is " + booking.kmSinceLastEntry / nSplits + " gefahren, "
            + "<br>hat also " + verbrauchteLiter + " Liter verbraucht" + " bei " + actualVerbrauch + " l/100km "
          bk = new Booking(booking.nr, booking.date, 0, verbrauchteLiter, text4, verbrauchteLiter, 0, sollAccount.id, habenAccount.id)
          book(bk, sollAccount, habenAccount)

        }

      /* Tankungen buchen  */
      if (bookingHelpers.isTanken(booking) || booking.liters > 0) {
        // is vollgetankt? 
        // if the Saldo is around zero, then we can assume that the car was vollgetankt, 
        // otherwise not
        sollAccount = bs.getAccountById(4530) // Ziel/Aufwand = SOLL 
        habenAccount = bs.findAccount(splitAccount, "Verrechnungskonto") // Quelle/Auslage = HABEN       
        const amount = Math.round(100 * euroToNumber(booking.amount)) / 100
        const text = splitAccount + " tankte: " + amount / nSplits + "€, " 
          + booking.liters / nSplits + " Liter, "    
          + "<br>Wer: " + booking.account
          + "<br>Vollgetankt: " + (vollgetankt ? "Ja" : "Nein")
          + "<br>Verbrauch: " + actualVerbrauch + " l/100km, "
          + "<br>Benzinpreis: " + actualFuelPrice + " €/l"
        const betrag = euroToNumber(booking.amount) / nSplits
        const kmEnde = +booking.km
        const kmStart = kmEnde - booking.kmSinceLastEntry // parseFloat(booking.kmSinceLastEntry || "0")
        bk = new Booking(booking.nr, booking.date, 0, betrag, text, betrag, 0, sollAccount.id, habenAccount.id)
        book(bk, sollAccount, habenAccount)
        bookingWasUsed = true
        // logd("bookEverythingToBS.Tanken: ", splits, bk, from, to, booking.kmSinceLastFuelFill)
        /* Tanken verbucht */

        // Tankstand auf Statistikkonto "LiterKraftstoff" verbuchen
        sollAccount = bs.findAccount(companyName, "LiterKraftstoff")
        habenAccount = bs.findAccount(splitAccount, "LiterKraftstoff")
        const text2 = splitAccount + " hat " + booking.liters / nSplits + " Liter getankt"
        bk = new Booking(booking.nr, booking.date, 0, booking.liters / nSplits, text2, booking.liters / nSplits, 0, sollAccount.id, habenAccount.id)
        book(bk, sollAccount, habenAccount)
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
            receipient === companyName ||
            (shStore?.personen.indexOf(receipient) || 0) >= 0
          )
      }

      if (isAusgleichszahlung(booking)) {
        //logd("Ausgleichszahlung: ", booking)
        const receipient = booking.key.split(" ")[1]
        sollAccount = bs.findAccount(receipient, "Verrechnungskonto")
        habenAccount = bs.findAccount(splitAccount, "Verrechnungskonto")
        const text = booking.account + "-->" + receipient + ": " + booking.description + " " + euroToNumber(booking.amount) / nSplits + " " + booking.amount
        const betrag = euroToNumber(booking.amount) / nSplits
        bk = new Booking(booking.nr, booking.date, 0, betrag, text, betrag, 0, sollAccount.id, habenAccount.id)
        book(bk, sollAccount, habenAccount)
        bookingWasUsed = true
      }

      const jahresendbuchung = (b: HauptbuchBooking): boolean => (b.key.toLowerCase() === "jahresendbuchung")
      if (jahresendbuchung(booking)) {
        // disable for now
        bookingWasUsed = true
        break
      }

      /* Nullbuchung ignorieren */
      const isNullbuchung = (euroToNumber(booking.amount) === 0) && +(booking.kmSinceLastEntry || "0") === 0
      if (isNullbuchung) {
        bookingWasUsed = true
        // logd("Nullbuchung ignoriert: ", booking, " " + " km:" + booking.kmSinceLastEntry + " €:" + booking.amount)
      }


      /* Fehler buchen */
      if (!bookingWasUsed) bookingError = "booking was not used<br>" + bookingError
      if (bookingError != "") {
        // logd("Fehler: ", booking.amount, " : ", booking.liters)
        sollAccount = bs.Errors
        habenAccount = bs.Errors1
        const text = booking.account + " Konto 1 " + booking.description + " "
          + "<br> amount:" + booking.amount + " " + euroToNumber(booking.amount)
          + "<br> kmSinceLastEntry:" + booking.kmSinceLastEntry
          + "<br> splits:" + splits
          + "<br> booking:" + JSON.stringify(booking)
          + "<br> bookingType:" + bookingHelpers.bookingType(booking)
          + "<br> Error:" + bookingError
        bk = new Booking(booking.nr, booking.date, 0, booking.amount, text, booking.amount, 0, sollAccount.id, habenAccount.id)
        book(bk, sollAccount, habenAccount)
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