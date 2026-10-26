import { test } from "node:test";
import assert from "node:assert/strict";
import { modifierClient, ETAPES } from "../crm.js";
import { totalPipeline } from "../tableau.js";

const responsable = { id: "u3", role: "responsable" };
const commercialU1 = { id: "u1", role: "commercial" };

const clientsDepart = () => [
  {
    id: "c1",
    contact: "Awa",
    telephone: "77 000 00 00",
    montant_fcfa: 100000,
    etape: "prospect",
    proprietaire: "u1",
  },
  {
    id: "c2",
    contact: "Ibrahima",
    telephone: "77 111 11 11",
    montant_fcfa: "90000",
    etape: "qualifie",
    proprietaire: "u2",
  },
];

const commerciaux = ["u1", "u2"];

test("un commercial peut modifier contact, téléphone, montant et étape de son client", () => {
  const { ok, clients } = modifierClient(clientsDepart(), commercialU1, "c1", {
    contact: "Nouveau contact",
    telephone: "+221 77 999 99 99",
    montant_fcfa: "250000",
    etape: "proposition",
  });
  assert.equal(ok, true);
  assert.equal(clients[0].contact, "Nouveau contact");
  assert.equal(clients[0].telephone, "+221 77 999 99 99");
  assert.equal(clients[0].montant_fcfa, 250000);
  assert.equal(typeof clients[0].montant_fcfa, "number");
  assert.equal(clients[0].etape, "proposition");
  assert.equal(clients[1].contact, "Ibrahima");
});

test("un commercial ne peut ni modifier ni réattribuer le client d'un autre", () => {
  const depart = clientsDepart();
  const edition = modifierClient(depart, commercialU1, "c2", {
    contact: "Intrus",
  });
  assert.equal(edition.ok, false);
  assert.equal(edition.clients[1].contact, "Ibrahima");

  const vol = modifierClient(depart, commercialU1, "c2", {
    proprietaire: "u1",
  });
  assert.equal(vol.ok, false);
  assert.equal(vol.clients[1].proprietaire, "u2");
});

test("la responsable peut réattribuer un client à un commercial", () => {
  const { ok, clients } = modifierClient(
    clientsDepart(),
    responsable,
    "c2",
    { proprietaire: "u1" },
    commerciaux,
  );
  assert.equal(ok, true);
  assert.equal(clients[1].proprietaire, "u1");
});

test("chaque étape commerciale est acceptée", () => {
  let clients = clientsDepart();
  for (const etape of ETAPES) {
    const resultat = modifierClient(clients, commercialU1, "c1", { etape });
    assert.equal(resultat.ok, true);
    assert.equal(resultat.clients[0].etape, etape);
    clients = resultat.clients;
  }
});

test("un client passé en perdu sort du total du pipeline", () => {
  const { ok, clients } = modifierClient(clientsDepart(), commercialU1, "c1", {
    etape: "perdu",
  });
  assert.equal(ok, true);
  assert.equal(totalPipeline(clients), 90000);
});

test("la responsable peut attribuer un client sans propriétaire", () => {
  const depart = [
    {
      id: "c0",
      contact: "Orphelin",
      telephone: "77",
      montant_fcfa: 1000,
      etape: "prospect",
      proprietaire: null,
    },
  ];
  const { ok, clients } = modifierClient(
    depart,
    responsable,
    "c0",
    { proprietaire: "u2" },
    commerciaux,
  );
  assert.equal(ok, true);
  assert.equal(clients[0].proprietaire, "u2");
});

test("la responsable peut retirer l'attribution d'un client", () => {
  const { ok, clients } = modifierClient(
    clientsDepart(),
    responsable,
    "c1",
    { proprietaire: null },
    commerciaux,
  );
  assert.equal(ok, true);
  assert.equal(clients[0].proprietaire, null);
});

test("un commercial ne peut pas changer le propriétaire de son propre client", () => {
  const { ok, clients } = modifierClient(
    clientsDepart(),
    commercialU1,
    "c1",
    { proprietaire: "u2" },
    commerciaux,
  );
  assert.equal(ok, false);
  assert.equal(clients[0].proprietaire, "u1");
});

test("une étape inconnue ou un commercial invalide est refusé", () => {
  const mauvaiseEtape = modifierClient(clientsDepart(), commercialU1, "c1", {
    etape: "en-cours",
  });
  assert.equal(mauvaiseEtape.ok, false);
  assert.equal(mauvaiseEtape.clients[0].etape, "prospect");
  assert.ok(ETAPES.includes("perdu"));

  const mauvaisProprio = modifierClient(
    clientsDepart(),
    responsable,
    "c1",
    { proprietaire: "u3" },
    commerciaux,
  );
  assert.equal(mauvaisProprio.ok, false);
  assert.equal(mauvaisProprio.clients[0].proprietaire, "u1");
});
