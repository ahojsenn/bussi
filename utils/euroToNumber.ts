
export const euroToNumber = (e: string | number) => typeof e === "string" ? Number.parseFloat(e.replaceAll('.', '').
  replace('€', '').trim().replace(',', '.')) : e

