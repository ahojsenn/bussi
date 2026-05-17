import { HauptbuchBooking } from '@/types'
import { useBookingValidation } from './useBookingValidation'

describe('useBookingValidation', () => {
  const createBooking = () => new HauptbuchBooking(
    '1',
    '2026-03-14T10:00',
    'Alice',
    12345,
    0,
    200,
    0,
    0,
    0,
    25,
    '',
    '',
    1
  )

  it('accepts a valid balancing payment between two shareholders', () => {
    const { validateAusgleichszahlung } = useBookingValidation()

    const result = validateAusgleichszahlung(createBooking(), 'Bob', ['Alice', 'Bob'])

    expect(result).toEqual({ ok: true, result: 'ok' })
  })

  it('rejects balancing payments to the same shareholder', () => {
    const { validateAusgleichszahlung } = useBookingValidation()

    const result = validateAusgleichszahlung(createBooking(), 'Alice', ['Alice', 'Bob'])

    expect(result.ok).toBe(false)
    expect(result.result).toContain('Ausgleichszahlung an sich selbst ist nicht möglich')
  })
})
