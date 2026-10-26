import {
  clientsVisibles,
  idsCommerciaux,
  peutReattribuer,
  peutVoirTableauDeBord,
} from "./acces.js";
import { ETAPES, modifierClient } from "./crm.js";
import { chargerClients, sauverClients } from "./stockage.js";
import { formatMontantFcfa, totalParEtape, totalPipeline } from "./tableau.js";

const [utilisateurs, clientsSource] = await Promise.all([
  fetch("donnees/utilisateurs.json").then((r) => r.json()),
  fetch("donnees/clients.json").then((r) => r.json()),
]);

let clients = chargerClients(clientsSource);
const commerciaux = idsCommerciaux(utilisateurs);

const choix = document.getElementById("utilisateur");
for (const u of utilisateurs) choix.add(new Option(`${u.nom} (${u.role})`, u.id));

const selectEtape = document.getElementById("fiche-etape");
for (const etape of ETAPES) selectEtape.add(new Option(etape, etape));

const selectProprietaire = document.getElementById("fiche-proprietaire");
selectProprietaire.add(new Option("Non attribué", ""));
for (const u of utilisateurs.filter((x) => x.role === "commercial")) {
  selectProprietaire.add(new Option(u.nom, u.id));
}

function utilisateurCourant() {
  return utilisateurs.find((u) => u.id === choix.value);
}

function afficher() {
  const moi = utilisateurCourant();
  const visibles = clientsVisibles(moi, clients);
  const colonnes = document.getElementById("pipeline");
  colonnes.innerHTML = "";
  for (const etape of ETAPES) {
    const col = document.createElement("section");
    const titre = document.createElement("h2");
    titre.textContent = etape;
    col.append(titre);
    for (const c of visibles.filter((x) => x.etape === etape)) {
      const carte = document.createElement("article");
      const bouton = document.createElement("button");
      bouton.type = "button";
      bouton.textContent = `${c.entreprise} — ${formatMontantFcfa(c.montant_fcfa)}`;
      bouton.addEventListener("click", () => ouvrirFiche(c.id));
      carte.append(bouton);
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
      (nom) => `${nom} : ${formatMontantFcfa(parEtape[nom] || 0)}`,
    ).join(" · ");
  } else {
    tableau.hidden = true;
  }
}

function ouvrirFiche(id) {
  const moi = utilisateurCourant();
  const client = clientsVisibles(moi, clients).find((c) => c.id === id);
  if (!client) return;

  document.getElementById("fiche-id").value = client.id;
  document.getElementById("fiche-titre").textContent = client.entreprise;
  document.getElementById("fiche-meta").textContent =
    `${client.ville ?? ""} · ${formatMontantFcfa(client.montant_fcfa)}`;
  document.getElementById("fiche-contact").value = client.contact ?? "";
  document.getElementById("fiche-telephone").value = client.telephone ?? "";
  document.getElementById("fiche-montant").value = client.montant_fcfa;
  document.getElementById("fiche-etape").value = client.etape;

  const champProprio = document.getElementById("fiche-proprietaire-champ");
  if (peutReattribuer(moi)) {
    champProprio.hidden = false;
    selectProprietaire.value = commerciaux.includes(client.proprietaire)
      ? client.proprietaire
      : "";
  } else {
    champProprio.hidden = true;
  }
  document.getElementById("fiche").showModal();
}

document.getElementById("form-fiche").addEventListener("submit", (e) => {
  e.preventDefault();
  const moi = utilisateurCourant();
  const champs = {
    contact: document.getElementById("fiche-contact").value,
    telephone: document.getElementById("fiche-telephone").value,
    montant_fcfa: document.getElementById("fiche-montant").value,
    etape: document.getElementById("fiche-etape").value,
  };
  if (peutReattribuer(moi)) {
    champs.proprietaire = selectProprietaire.value || null;
  }
  const resultat = modifierClient(
    clients,
    moi,
    document.getElementById("fiche-id").value,
    champs,
    commerciaux,
  );
  if (resultat.ok) {
    clients = resultat.clients;
    sauverClients(clients);
    afficher();
    document.getElementById("fiche").close();
  }
});

document.getElementById("fiche-fermer").addEventListener("click", () => {
  document.getElementById("fiche").close();
});

choix.addEventListener("change", () => {
  document.getElementById("fiche").close();
  afficher();
});
afficher();
