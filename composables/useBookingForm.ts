import { ref } from 'vue'
import { HauptbuchBooking } from '~/types/bussitypes'

export type BookingType = 'Fahrt' | 'Tanken' | 'Sonstiges' | 'Ausgleichszahlung'

export function createNewBooking(
  bookingNr: number,
  lastKm: number,
  kmSinceLastFuelFill: number,
  today: string
): HauptbuchBooking {
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

export function buildAusgleichDefaultDescription(account: string, recipientName: string): string {
  if (account && recipientName) return `Ausgleich von ${account} an ${recipientName}`
  if (account) return `Ausgleich von ${account}`
  if (recipientName) return `Ausgleich an ${recipientName}`
  return 'Ausgleichszahlung'
}

export function useBookingForm(
  initialBooking: HauptbuchBooking,
  initialBookingType: BookingType = 'Fahrt'
) {
  const bookingtype = ref<BookingType>(initialBookingType)
  const thisbk = ref(initialBooking)
  const vollgetankt = ref(true)
  const nachtrag = ref(false)
  const recipient = ref('')
  const lastSubmitted = ref("nothing yet")

  const buildDescription = (
    bookingType: BookingType,
    options: {
      kmSinceLastEntry: number
      originalDescription: string
      isVollgetankt: boolean
      isNachtrag: boolean
      recipient?: string
    }
  ): string => {
    let description = "FBE: " + bookingType
    description += options.recipient ? " :: an " + options.recipient : ''
    description += options.kmSinceLastEntry > 0 ? " :: km: " + options.kmSinceLastEntry : ''
    description += options.originalDescription !== "" ? " :: " + options.originalDescription : ""
    description += bookingType === 'Tanken' && !options.isVollgetankt ? " :: nicht vollgetankt" : ""
    description += bookingType === 'Tanken' && options.isNachtrag ? " :: Nachtrag" : ""
    return description
  }

  const resetForm = (
    bookingNr: number,
    lastKm: number,
    kmSinceLastFuelFill: number,
    today: string
  ) => {
    thisbk.value = createNewBooking(bookingNr, lastKm, kmSinceLastFuelFill, today)
    vollgetankt.value = true
    nachtrag.value = false
    recipient.value = ''
  }

  return {
    bookingtype,
    thisbk,
    vollgetankt,
    nachtrag,
    recipient,
    lastSubmitted,
    buildDescription,
    resetForm,
  }
}
