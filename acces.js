// Règle d'accès du mini-CRM.
// Un commercial ne voit QUE ses propres clients ; le responsable voit tout.
export function clientsVisibles(utilisateur, clients) {
  if (utilisateur.role === "responsable") {
    return clients;
  }
  return clients.filter((c) => c.proprietaire === utilisateur.id);
}

export function peutVoirTableauDeBord(utilisateur) {
  return utilisateur.role === "responsable";
}
