import { computed } from 'vue'
import { HauptbuchBooking } from '~/types/bussitypes'
import { isTanken } from '~/composables/bookingHelpers'

export function useFuelConsumption(bookings: Ref<HauptbuchBooking[]>) {
  const allLiters = computed(() =>
    bookings.value.reduce((acc, cv) => acc += cv.liters, 0)
  )

  const allKM = computed(() => {
    if (bookings.value.length === 0) return 0
    const lastBooking = bookings.value[bookings.value.length - 1]
    return lastBooking.km - bookings.value[0].km
  })

  const averageConsumption = (): number => {
    return Math.round(10000 * allLiters.value / allKM.value) / 100
  }

  const kmAtLastFuelfill = (): number => {
    const tankBookings = bookings.value.filter(b => isTanken(b))
    if (tankBookings.length === 0) return 0
    return tankBookings[tankBookings.length - 1].km || 0
  }

  const calculateConsumption = (liters: number, kmSinceLastFuelFill: number): number => {
    return Math.round(10000 * liters / kmSinceLastFuelFill) / 100
  }

  const estimatedFuelCapacity = (kmSinceLastFuelFill: number): number => {
    return kmSinceLastFuelFill * averageConsumption() / 100 
  }

  const estimatedFuelInTank = (kmSinceLastFuelFill: number): number => {
    return totalFuelCapacity - estimatedFuelCapacity(kmSinceLastFuelFill)
  }

  const estimatedKmLeftInTank = (kmSinceLastFuelFill: number): number => {
    return 100 * estimatedFuelInTank(kmSinceLastFuelFill) / averageConsumption()
  }


  const totalFuelCapacity = 80

  return {
    allLiters,
    allKM,
    averageConsumption,
    kmAtLastFuelfill,
    calculateConsumption,
    estimatedFuelCapacity,
    estimatedFuelInTank,
    estimatedKmLeftInTank,
    totalFuelCapacity
  }
}
