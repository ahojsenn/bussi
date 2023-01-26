import logd from './logDebug'
import { Account, Booking } from './types'

export const book = (bk: Booking, from: Account, to: Account) => {
  if (bk === null) return
  const bk1 = new Booking(bk.nr, bk.date, bk.soll, bk.haben, bk.description, bk.kmStart, bk.kmEnde, bk.abschreibedauer)
  const bk2 = new Booking(bk.nr, bk.date, bk.haben, bk.soll, bk.description, bk.kmStart, bk.kmEnde, bk.abschreibedauer)
  // logd("book", bk1, bk2)
  from.bookings.push(bk1)
  to.bookings.push(bk2)
}