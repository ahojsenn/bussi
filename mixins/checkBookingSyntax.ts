import logd from './logDebug';
import type { HauptbuchBooking } from './types';

function isValidDate(dateString: string) {
  let regEx = /^\d{4}-\d{2}-\d{2}$/;
  if (!new RegExp(regEx).exec(dateString)) return false;  // Invalid format
  let d = new Date(dateString);
  let dNum = d.getTime();
  if (!dNum && dNum !== 0) return false; // NaN value, Invalid date
  return d.toISOString().slice(0, 10) === dateString;
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
  if (Number.parseFloat(booking.amount) < 0 || Number.parseFloat(booking.amount) > 5000) errorCode += "<br>booking.amount " + booking.amount + " is unreasonable"

  // check in km are reasonable
  if (booking.km < 0 || booking.km > 3000000) errorCode += "<br>booking.lm " + booking.km + " is unreasonable"

  // check kmSinceLastEntry
  if (+booking.nr > 0 && (booking.kmSinceLastEntry != booking.km - lastBooking.km)) errorCode += "km are wrong: " + booking.km

  // append row nr
  if (errorCode != "") errorCode += " in row " + booking.nr + "<br>"

  if (errorCode != "") logd(errorCode)

  return errorCode
};
