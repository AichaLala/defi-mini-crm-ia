import { clientsVisibles, peutVoirTableauDeBord } from "./acces.js";
import { formatMontantFcfa, totalParEtape, totalPipeline } from "./tableau.js";

const ETAPES = ["prospect", "qualifie", "proposition", "gagne", "perdu"];
const [utilisateurs, clients] = await Promise.all([
  fetch("donnees/utilisateurs.json").then((r) => r.json()),
  fetch("donnees/clients.json").then((r) => r.json()),
]);

const choix = document.getElementById("utilisateur");
for (const u of utilisateurs) choix.add(new Option(`${u.nom} (${u.role})`, u.id));

function afficher() {
  const moi = utilisateurs.find((u) => u.id === choix.value);
  const visibles = clientsVisibles(moi, clients);
  const colonnes = document.getElementById("pipeline");
  colonnes.innerHTML = "";
  for (const etape of ETAPES) {
    const col = document.createElement("section");
    col.innerHTML = `<h2>${etape}</h2>`;
    for (const c of visibles.filter((x) => x.etape === etape)) {
      const carte = document.createElement("article");
      carte.textContent = `${c.entreprise} — ${formatMontantFcfa(c.montant_fcfa)}`;
      col.append(carte);
    }
    colonnes.append(col);
  }
  const tableau = document.getElementById("tableau-de-bord");
  if (peutVoirTableauDeBord(moi)) {
    tableau.hidden = false;
    document.getElementById("total").textContent = formatMontantFcfa(
      totalPipeline(clients),
    );
    const parEtape = totalParEtape(clients);
    document.getElementById("par-etape").textContent = ETAPES.map(
      (etape) => `${etape} : ${formatMontantFcfa(parEtape[etape] || 0)}`,
    ).join(" · ");
  } else {
    tableau.hidden = true;
  }
}
choix.addEventListener("change", afficher);
afficher();
