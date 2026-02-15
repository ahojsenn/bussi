import type { HauptbuchBooking } from '../types';
import { useStakeholderStore } from '../stores/stakeholder'

function isValidDate(dateString: string): boolean {
  // Dieser eine Regex deckt alles ab: Datum sowie optional (Zeit und optional Sekunden)
  const regEx = /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}(:\d{2})?)?$/;
  
  // 1. Format-Check
  if (!regEx.test(dateString)) return false;

  // 2. Parsen in ein Date-Objekt
  // Wir ersetzen das Leerzeichen durch 'T' für ISO-Konformität beim Parsen
  const date = new Date(dateString.replace(" ", "T"));

  // 3. Logik-Check (Gültiges Datum wie 31. Feb?)
  // Wenn JS ein ungültiges Datum parst (z.B. 31.02.), "rollt" es zum 03.03.
  // Wir prüfen, ob der Zeitstempel gültig ist (NaN Check)
  if (isNaN(date.getTime())) return false;

  // 4. Zeitfenster-Check (50 Jahre Vergangenheit bis Jetzt + Puffer)
  const now = new Date();
  const fiftyYearsAgo = new Date();
  fiftyYearsAgo.setFullYear(now.getFullYear() - 50);
  
  const buffer = new Date();
  buffer.setFullYear(now.getFullYear() + 1); // 1 Jahr Puffer in die Zukunft

  return date >= fiftyYearsAgo && date <= buffer;
}

const lastBooking: Partial<HauptbuchBooking> = {}

export const checkBookingSyntax = (booking: HauptbuchBooking, lastBooking: HauptbuchBooking) => {
  let errorCode = ""

  // check if booking.date is a valid date
  if (!isValidDate(booking.date)) errorCode += "<br>" + "booking.date " + booking.date + " is invalid"

  // check if booking.date is larger than the last booking date - for rowNr >2
  if ((new Date(booking.date).getTime() < new Date(lastBooking.date).getTime()))
    errorCode += "<br> booking.date " + booking.date + "  " + new Date(booking.date).getTime() + " is before lastBooking.date " + lastBooking.date + " " + new Date(lastBooking.date).getTime()

  // check if amount is reasonable
  if (
    ((booking.amount < 0) && (booking.key != "Jahresendbuchung"))
    || booking.amount > 5000)
    errorCode += "<br>booking.amount " + booking.amount + " is unreasonable"

  // check in km are reasonable
  if (booking.km < 0 || booking.km > 3000000) errorCode += "<br>booking.lm " + booking.km + " is unreasonable"

  // check kmSinceLastEntry
  if ((booking.kmSinceLastEntry != booking.km - lastBooking.km)) errorCode += "km are wrong: " + booking.km + "-" + lastBooking.km + " != " + booking.kmSinceLastEntry

  // check, if the new Bob is a valid Stakeholder
  const sl = useStakeholderStore().stakeholderListe
  if (sl.indexOf(booking.account) == -1)
    errorCode += "booking.account " + booking.account + " is not in " + sl

  // chek if kmSincelastFuelfill is not negative
  if ((booking.kmSinceLastFuelFill) && booking.kmSinceLastFuelFill < 0)
    errorCode += "booking.kmSinceLastFuelFill is negative "

  // append row nr
  if (errorCode != "") errorCode += " in row " + booking.nr + "<br>"

  // if (errorCode != "") logd(errorCode)

  return errorCode
};
