import { ETAPES } from "./crm.js";
import { montantNumerique } from "./tableau.js";

export const CLE_CLIENTS = "mini-crm-clients";

function copierClients(clients) {
  return clients.map((c) => ({ ...c }));
}

export function fusionnerClients(source, sauvegarde) {
  if (!Array.isArray(sauvegarde)) {
    return copierClients(source);
  }
  const parId = new Map(sauvegarde.map((c) => [c.id, c]));
  return source.map((c) => {
    const enregistre = parId.get(c.id);
    if (!enregistre) {
      return { ...c };
    }
    return {
      ...c,
      contact: enregistre.contact ?? c.contact,
      telephone: enregistre.telephone ?? c.telephone,
      montant_fcfa:
        enregistre.montant_fcfa === undefined
          ? c.montant_fcfa
          : montantNumerique(enregistre.montant_fcfa),
      etape: ETAPES.includes(enregistre.etape) ? enregistre.etape : c.etape,
      proprietaire:
        "proprietaire" in enregistre ? enregistre.proprietaire : c.proprietaire,
      id: c.id,
    };
  });
}

export function chargerClients(source, stockage = globalThis.localStorage) {
  try {
    const brut = stockage?.getItem?.(CLE_CLIENTS);
    if (!brut) {
      return copierClients(source);
    }
    return fusionnerClients(source, JSON.parse(brut));
  } catch {
    return copierClients(source);
  }
}

export function sauverClients(clients, stockage = globalThis.localStorage) {
  stockage?.setItem?.(CLE_CLIENTS, JSON.stringify(clients));
}