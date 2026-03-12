// /composables/book.ts
import { Account, Booking } from '@/types'

export const book = (bk: Booking, sollAccount: Account, habenAccount: Account) => {
  if (!bk || !sollAccount || !habenAccount) return;

  // 1. Eintrag für das Soll-Konto (Empfänger/Wertzuwachs)
  const entrySoll = new Booking(
    bk.nr, bk.date,
    bk.amount,   // Betrag steht hier im SOLL
    0,           // Haben ist 0
    bk.description, bk.amount, bk.quantity,
    sollAccount.id, habenAccount.id
  );

  // 2. Eintrag für das Haben-Konto (Quelle/Wertabgang)
  const entryHaben = new Booking(
    bk.nr, bk.date,
    0,           // Soll ist 0
    bk.amount,   // Betrag steht hier im HABEN
    bk.description, bk.amount, bk.quantity,
    sollAccount.id, habenAccount.id
  );

  sollAccount.bookings.push(entrySoll);
  habenAccount.bookings.push(entryHaben);
};


// 