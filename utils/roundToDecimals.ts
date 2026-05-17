export  function roundToDecimals(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export default roundToDecimals
// Examples:
/*
console.log(roundToDecimals(3.14159, 1)); // Output: 3.1
console.log(roundToDecimals(3.14159, 2)); // Output: 3.14
console.log(roundToDecimals(3.14159, 3)); // Output: 3.142
console.log(roundToDecimals(12.34, 0));   // Output: 12
*/