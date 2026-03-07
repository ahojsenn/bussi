// /utils/generateStructuredAddountId.ts

/**
 * Generiert eine ID im Millionen-Nummernkreis
 * @param sh_id - ID des Stakeholders (max 999)
 * @param k_id - ID des Kontotyps/Accounts (max 999)
 */
export const generateStructuredAccountId = (sh_id: string | number, k_id: string | number): number => {
  //logd("generateStructuredAccountId: sh_id=", sh_id, "k_id=", k_id, "sId=", sId, "aId=", aId);
  // Konstruktion: 1.000.000 + (Account * 10.000) + Stakeholder
  // Das füllt die Stellen 2-4 für SH und 5-8 für Acc automatisch mit Nullen auf
  return (parseInt(String(sh_id)) * 1000) + parseInt(String(k_id));
}