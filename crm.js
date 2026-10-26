import { peutModifierClient, peutReattribuer } from "./acces.js";
import { montantNumerique } from "./tableau.js";

export const ETAPES = ["prospect", "qualifie", "proposition", "gagne", "perdu"];

export function modifierClient(
  clients,
  utilisateur,
  id,
  champs,
  commerciaux = [],
) {
  const actuel = clients.find((c) => c.id === id);
  if (!actuel || !peutModifierClient(utilisateur, actuel)) {
    return { ok: false, clients };
  }

  const maj = { ...actuel };

  if ("contact" in champs) {
    maj.contact = String(champs.contact);
  }
  if ("telephone" in champs) {
    maj.telephone = String(champs.telephone);
  }
  if ("montant_fcfa" in champs) {
    maj.montant_fcfa = montantNumerique(champs.montant_fcfa);
  }
  if ("etape" in champs) {
    if (!ETAPES.includes(champs.etape)) {
      return { ok: false, clients };
    }
    maj.etape = champs.etape;
  }
  if ("proprietaire" in champs) {
    if (!peutReattribuer(utilisateur)) {
      return { ok: false, clients };
    }
    if (champs.proprietaire === null || champs.proprietaire === "") {
      maj.proprietaire = null;
    } else if (!commerciaux.includes(champs.proprietaire)) {
      return { ok: false, clients };
    } else {
      maj.proprietaire = champs.proprietaire;
    }
  }

  return {
    ok: true,
    clients: clients.map((c) => (c.id === id ? maj : c)),
  };
}