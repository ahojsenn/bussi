import { ref } from 'vue'
import { HauptbuchBooking } from '~/types/bussitypes'

export type BookingType = 'Fahrt' | 'Tanken' | 'Sonstiges'

export function useBookingForm(
  initialBooking: HauptbuchBooking,
  initialBookingType: BookingType = 'Fahrt'
) {
  const bookingtype = ref<BookingType>(initialBookingType)
  const thisbk = ref(initialBooking)
  const vollgetankt = ref(true)
  const liters = ref("Litres")
  const amount = ref("Euro")
  const lastSubmitted = ref("nothing yet")

  const createNewBooking = (
    bookingNr: number,
    lastKm: number,
    kmSinceLastFuelFill: number,
    today: string
  ): HauptbuchBooking => {
    return new HauptbuchBooking(
      bookingNr.toString(),
      today,
      '',
      lastKm,
      0,
      kmSinceLastFuelFill,
      0,
      0,
      0,
      0,
      '',
      '',
      bookingNr
    )
  }

  const buildDescription = (
    bookingType: BookingType,
    kmSinceLastEntry: number,
    originalDescription: string,
    isVollgetankt: boolean
  ): string => {
    let description = "FBE: " + bookingType
    description += kmSinceLastEntry > 0 ? " :: km: " + kmSinceLastEntry : ''
    description += originalDescription !== "" ? " :: " + originalDescription : ""
    description += !isVollgetankt ? " :: nicht vollgetankt" : ""
    return description
  }

  const resetForm = (
    bookingNr: number,
    lastKm: number,
    kmSinceLastFuelFill: number,
    today: string
  ) => {
    thisbk.value = createNewBooking(bookingNr, lastKm, kmSinceLastFuelFill, today)
    liters.value = "Litres"
    amount.value = "Euro"
  }

  return {
    bookingtype,
    thisbk,
    vollgetankt,
    liters,
    amount,
    lastSubmitted,
    createNewBooking,
    buildDescription,
    resetForm,
  }
}
