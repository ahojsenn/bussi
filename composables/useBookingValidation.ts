import type { HauptbuchBooking } from '~/types'

// Konstanten für Validierung
export const FUEL_PRICE_LIMITS = { min: 1.2, max: 2.5 }
export const CONSUMPTION_TOLERANCE = { low: 0.8, high: 1.2 }

export interface ValidationResult {
  ok: boolean
  result: string
}

export function useBookingValidation() {
  const isParsableNumber = (v: any): boolean => !isNaN(parseFloat(v)) && isFinite(v)
  const isPositiveNumber = (v: any): boolean => isParsableNumber(v) && v > 0

  const validateFahrt = (
    bk: HauptbuchBooking,
    kmWithinRange: boolean
  ): ValidationResult => {
    let retString = ''

    retString += bk.date === '' ? 'Date not set<br>' : ''
    retString += bk.kmSinceLastEntry < 1 ? 'Bitte km angeben<br>' : ''
    retString += bk.account === '' ? 'bitte Konto angeben<br>' : ''
    retString += kmWithinRange ? '' : 'km not within range<br>'
    retString += bk.amount && bk.amount != 0 ? 'Bei Eintrag "Fahrt" bitte keinen Betrag ' + bk.amount + ' angeben<br>' : ''
    retString += bk.liters && bk.liters != 0 ? 'Bei Eintrag "Fahrt" bitte keine Liter ' + bk.liters + ' angeben<br>' : ''

    return retString !== '' ? { ok: false, result: retString } : { ok: true, result: 'ok' }
  }

  const validateTanken = (
    bk: HauptbuchBooking,
    kmWithinRange: boolean,
    averageConsumption: number,
    vollgetankt: boolean
  ): ValidationResult => {
    let retString = ''

    retString += kmWithinRange ? '' : 'km not within range<br>'
    retString += !bk.liters || bk.liters <= 0 ? 'Bitte Liter angeben<br>' : ''
    retString += !bk.amount || bk.amount <= 0 ? 'Bitte Betrag angeben<br>' : ''
    retString += bk.account === '' ? 'Konto not selected<br>' : ''

    if (vollgetankt) {
      retString += bk.consumption < CONSUMPTION_TOLERANCE.low * averageConsumption
        ? 'Verbrauch zu niedrig, bitte prüfen<br>'
        : ''
    }

    retString += bk.consumption > CONSUMPTION_TOLERANCE.high * averageConsumption
      ? 'Verbrauch zu hoch, bitte prüfen<br>'
      : ''

    retString += bk.fuelPriceInEuro < FUEL_PRICE_LIMITS.min
      ? 'Kraftstoffpreis zu niedrig, bitte prüfen<br>'
      : ''
    retString += bk.fuelPriceInEuro > FUEL_PRICE_LIMITS.max
      ? 'Kraftstoffpreis zu hoch, bitte prüfen<br>'
      : ''

    return retString !== '' ? { ok: false, result: retString } : { ok: true, result: 'ok' }
  }

  const validateSonstiges = (bk: HauptbuchBooking): ValidationResult => {
    let retString = ''

    retString += !bk.amount || bk.amount <= 0 ? 'Bitte Betrag angeben<br>' : ''
    retString += bk.account === '' ? 'Konto nicht ausgewählt<br>' : ''
    retString += bk.description === '' ? 'Bitte Beschreibung angeben<br>' : ''

    return retString !== '' ? { ok: false, result: retString } : { ok: true, result: 'ok' }
  }

  return {
    isParsableNumber,
    isPositiveNumber,
    validateFahrt,
    validateTanken,
    validateSonstiges,
  }
}
