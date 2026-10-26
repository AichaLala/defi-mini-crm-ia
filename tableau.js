// Indicateurs du tableau de bord.

export function montantNumerique(montant) {
  const n = Number(montant);
  return Number.isFinite(n) ? n : 0;
}

export function totalParEtape(clients) {
  const total = {};
  for (const c of clients) {
    total[c.etape] = (total[c.etape] || 0) + montantNumerique(c.montant_fcfa);
  }
  return total;
}

export function totalPipeline(clients) {
  return clients
    .filter((c) => c.etape !== "perdu")
    .reduce((somme, c) => somme + montantNumerique(c.montant_fcfa), 0);
}

export function formatMontantFcfa(montant) {
  const entier = Math.trunc(montantNumerique(montant));
  const groupes = String(Math.abs(entier)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const signe = entier < 0 ? "-" : "";
  return `${signe}${groupes} FCFA`;
}
