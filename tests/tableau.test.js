import { test } from "node:test";
import assert from "node:assert/strict";
import { totalParEtape, totalPipeline } from "../tableau.js";

const clientsMelanges = [
  { id: "n1", etape: "qualifie", montant_fcfa: 250000 },
  { id: "s1", etape: "qualifie", montant_fcfa: "90000" },
  { id: "s2", etape: "prospect", montant_fcfa: "750000" },
  { id: "s3", etape: "gagne", montant_fcfa: "150000" },
  { id: "n2", etape: "gagne", montant_fcfa: 400000 },
  { id: "p1", etape: "perdu", montant_fcfa: 150000 },
];

test("totalParEtape additionne les montants numériques même s'ils sont des chaînes", () => {
  const totaux = totalParEtape(clientsMelanges);
  assert.equal(typeof totaux.qualifie, "number");
  assert.equal(typeof totaux.prospect, "number");
  assert.equal(typeof totaux.gagne, "number");
  assert.equal(typeof totaux.perdu, "number");
  assert.equal(totaux.qualifie, 340000);
  assert.equal(totaux.prospect, 750000);
  assert.equal(totaux.gagne, 550000);
  assert.equal(totaux.perdu, 150000);
});

test("totalPipeline est une somme numérique qui exclut les clients perdus", () => {
  const total = totalPipeline(clientsMelanges);
  assert.equal(typeof total, "number");
  assert.equal(total, 1640000);
});

test("un montant perdu en chaîne n'entre pas dans le pipeline", () => {
  const clients = [
    { etape: "proposition", montant_fcfa: 250000 },
    { etape: "perdu", montant_fcfa: "90000" },
  ];
  assert.equal(totalPipeline(clients), 250000);
  assert.equal(totalParEtape(clients).perdu, 90000);
});
