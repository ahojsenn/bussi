export function formatAttributesWithBr(obj: Record<string, any>): string {
  return Object.entries(obj)
    .map(([key, value]) => {
      // Optional: clean up long decimals (like your fuel price)
      const displayValue = typeof value === 'number' && !Number.isInteger(value) 
        ? value.toFixed(2) 
        : value;

      return `<br>${key}: ${displayValue}`;
    })
    .join('');
}

export default formatAttributesWithBr