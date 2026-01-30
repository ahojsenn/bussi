import { reactive } from 'vue'

/**
 * Returns the i-th digit of a given number.
 * @param num - The number to extract the digit from.
 * @param index - The zero-based index of the digit (from left to right).
 * @returns The digit at the given index, or 0 if invalid.
 */
function getDigitAt(num: number, index: number): number {
  if (!Number.isFinite(num) || !Number.isInteger(index) || index < 0) {
    console.error("Invalid input: num must be finite, index must be a non-negative integer.");
    return 0;
  }

  const numStr = Math.abs(num).toString();

  if (index >= numStr.length) {
    console.warn("Index out of range.");
    return 0;
  }

  return Number(numStr.charAt(index));
}

export function useKilometerCounter(initialKm: number, range: number = 950) {
  const km = reactive({
    digits: new Array(6).fill(0).map((_, i) => getDigitAt(initialKm, i)),
    
    value: () => +km.digits.join(''),
    
    kmDriven: (lastKm: number): number => km.value() - lastKm,
    
    range,
    
    toFar: (lastKm: number) => km.value() - lastKm > km.range,
    
    withinRange: (lastKm: number) => km.value() - lastKm < km.range,
    
    inc: (i: number) => km.set(i, km.digits[i] + 1),
    
    dec: (i: number) => km.set(i, km.digits[i] - 1),
    
    set: (index: number, value: number) => {
      if (value == 10) {
        km.digits[index] = 0
        km.set(index - 1, km.digits[index - 1] + 1)
      }
      else if (value == -1) {
        km.digits[index] = 9
        km.set(index - 1, km.digits[index - 1] - 1)
      }
      else {
        km.digits[index] = +value
      }
    },
    
    resetToMinimum: (minKm: number) => {
      if (km.value() < minKm) {
        km.digits = new Array(6).fill(0).map((_, i) => getDigitAt(minKm, i))
      }
    },
    
    reset: (newKm: number) => {
      km.digits = new Array(6).fill(0).map((_, i) => getDigitAt(newKm, i))
    }
  })

  return km
}
