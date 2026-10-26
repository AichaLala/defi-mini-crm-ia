// Indicateurs du tableau de bord.
export function totalParEtape(clients) {
  const total = {};
  for (const c of clients) {
    total[c.etape] = (total[c.etape] || 0) + c.montant_fcfa;
  }
  return total;
}

export function totalPipeline(clients) {
  return clients
    .filter((c) => c.etape !== "perdu")
    .reduce((somme, c) => somme + c.montant_fcfa, 0);
}
