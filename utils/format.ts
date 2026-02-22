// utils/format.ts
export const formatEuro = (val: number) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(val);
}
// In deinem Template (Beispiel für deine Bilanz-Tabelle):
// td.inner {{ formatEuro(acc.saldo) }}

export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

// format km mit dezimalen und "km" am Ende
export const formatKm = (km: number) => {
  return `${km.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} km`;
}

export const formatLiter = (liter: number) => {
  return `${liter.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L`;
}

export const formatConsumption = (consumption: number) => {
  return `${consumption.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L/100km`;
}

export const formatCO2 = (co2: number) => {
  return `${co2.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} t CO2`;
}