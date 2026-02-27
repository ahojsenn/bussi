// /utils/generateStructuredAddountId.ts

/**
 * Generiert eine ID im Millionen-Nummernkreis
 * @param sh_id - ID des Stakeholders (max 999)
 * @param k_id - ID des Kontotyps/Accounts (max 999)
 */
export const generateStructuredAccountId = (sh_id: string | number, k_id: string | number): number => {
  // Sicherstellen, dass wir mit Zahlen arbeiten
  const sId = Math.min(Math.max(parseInt(String(sh_id)) || 0, 0), 999);
  const aId = Math.min(Math.max(parseInt(String(k_id)) || 0, 0), 999);
  //logd("generateStructuredAccountId: sh_id=", sh_id, "k_id=", k_id, "sId=", sId, "aId=", aId);
  // Konstruktion: 1.000.000 + (Stakeholder * 10.000) + Account
  // Das füllt die Stellen 2-4 für SH und 5-8 für Acc automatisch mit Nullen auf
  return 1000000 + (sId * 1000) + aId;
}