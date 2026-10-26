import { test } from "node:test";
import assert from "node:assert/strict";
import { CLE_CLIENTS, chargerClients, sauverClients } from "../stockage.js";

function memoire(initial = {}) {
  const store = { ...initial };
  return {
    getItem(cle) {
      return Object.hasOwn(store, cle) ? store[cle] : null;
    },
    setItem(cle, valeur) {
      store[cle] = String(valeur);
    },
  };
}

const source = [
  { id: "c1", contact: "A", etape: "prospect", montant_fcfa: 100, proprietaire: "u1" },
  { id: "c2", contact: "B", etape: "gagne", montant_fcfa: 200, proprietaire: "u2" },
];

test("sans sauvegarde, chargerClients recopie la source", () => {
  const charges = chargerClients(source, memoire());
  assert.deepEqual(charges, source);
  charges[0].contact = "modifié";
  assert.equal(source[0].contact, "A");
});

test("sauver puis charger restaure étape, contact et propriétaire", () => {
  const stockage = memoire();
  const modifies = [
    { ...source[0], contact: "Awa", etape: "proposition", proprietaire: "u2" },
    source[1],
  ];
  sauverClients(modifies, stockage);
  assert.ok(stockage.getItem(CLE_CLIENTS));

  const charges = chargerClients(source, stockage);
  assert.equal(charges[0].contact, "Awa");
  assert.equal(charges[0].etape, "proposition");
  assert.equal(charges[0].proprietaire, "u2");
  assert.equal(charges[1].contact, "B");
});

test("une sauvegarde illisible est ignorée", () => {
  const stockage = memoire({ [CLE_CLIENTS]: "{pas-json" });
  const charges = chargerClients(source, stockage);
  assert.equal(charges[0].contact, "A");
  assert.equal(charges.length, 2);
});

test("une étape invalide en sauvegarde ne remplace pas l'étape source", () => {
  const stockage = memoire();
  sauverClients(
    [
      { ...source[0], etape: "en-cours" },
      source[1],
    ],
    stockage,
  );
  const charges = chargerClients(source, stockage);
  assert.equal(charges[0].etape, "prospect");
  assert.equal(charges[0].contact, "A");
});

test("un client absent de la source n'est pas injecté par la sauvegarde", () => {
  const stockage = memoire();
  sauverClients(
    [...source, { id: "c99", contact: "Intrus", etape: "gagne", proprietaire: "u1" }],
    stockage,
  );
  const charges = chargerClients(source, stockage);
  assert.deepEqual(
    charges.map((c) => c.id),
    ["c1", "c2"],
  );
});
