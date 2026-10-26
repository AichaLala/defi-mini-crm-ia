import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { clientsVisibles } from "../acces.js";

const responsable = { id: "u3", role: "responsable" };
const commercialU1 = { id: "u1", role: "commercial" };
const commercialU2 = { id: "u2", role: "commercial" };

const clients = [
  { id: "c-u1", proprietaire: "u1" },
  { id: "c-u2", proprietaire: "u2" },
  { id: "c-null", proprietaire: null },
  { id: "c-espace", proprietaire: "u1 " },
];

test("la responsable voit tous les clients", () => {
  const visibles = clientsVisibles(responsable, clients);
  assert.equal(visibles.length, clients.length);
  assert.deepEqual(
    visibles.map((c) => c.id),
    ["c-u1", "c-u2", "c-null", "c-espace"],
  );
});

test("un commercial ne voit que les clients dont le propriétaire correspond exactement à son identifiant", () => {
  const visiblesU1 = clientsVisibles(commercialU1, clients);
  const visiblesU2 = clientsVisibles(commercialU2, clients);
  assert.deepEqual(visiblesU1.map((c) => c.id), ["c-u1"]);
  assert.deepEqual(visiblesU2.map((c) => c.id), ["c-u2"]);
  assert.ok(visiblesU1.every((c) => c.proprietaire === commercialU1.id));
  assert.ok(visiblesU2.every((c) => c.proprietaire === commercialU2.id));
});

test("les clients sans propriétaire ne sont pas visibles par un commercial", () => {
  const idsU1 = clientsVisibles(commercialU1, clients).map((c) => c.id);
  const idsU2 = clientsVisibles(commercialU2, clients).map((c) => c.id);
  assert.equal(idsU1.includes("c-null"), false);
  assert.equal(idsU2.includes("c-null"), false);
});

test('le propriétaire "u1 " avec un espace final n\'appartient pas à u1', () => {
  // Garde-fou : ce cas isolé passait déjà avec == avant le passage à ===.
  const jeu = [
    { id: "c-u1", proprietaire: "u1" },
    { id: "c-espace", proprietaire: "u1 " },
  ];
  const visibles = clientsVisibles(commercialU1, jeu);
  assert.equal(
    visibles.some((c) => c.proprietaire === "u1 "),
    false,
  );
  assert.deepEqual(visibles.map((c) => c.id), ["c-u1"]);
});

test("les données de départ : c16 a proprietaire \"u1 \" et n'est pas visible de u1", () => {
  const clients = JSON.parse(
    readFileSync(new URL("../donnees/clients.json", import.meta.url), "utf8"),
  );
  const c16 = clients.find((c) => c.id === "c16");
  assert.equal(c16.proprietaire, "u1 ");
  assert.notEqual(c16.proprietaire, "u1");
  const visibles = clientsVisibles(
    { id: "u1", role: "commercial" },
    [c16],
  );
  assert.equal(visibles.length, 0);
});
