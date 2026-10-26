import { test } from "node:test";
import assert from "node:assert/strict";
import {
  clientsVisibles,
  peutModifierClient,
  peutReattribuer,
} from "../acces.js";

const responsable = { id: "u3", role: "responsable" };
const commercialU1 = { id: "u1", role: "commercial" };
const commercialU2 = { id: "u2", role: "commercial" };
const aMoi = { id: "c1", proprietaire: "u1" };
const aLui = { id: "c2", proprietaire: "u2" };
const orphelin = { id: "c3", proprietaire: null };

test("un commercial ne peut modifier que ses propres clients", () => {
  assert.equal(peutModifierClient(commercialU1, aMoi), true);
  assert.equal(peutModifierClient(commercialU1, aLui), false);
  assert.equal(peutModifierClient(commercialU1, orphelin), false);
  assert.equal(peutModifierClient(commercialU2, aMoi), false);
});

test("la responsable peut modifier tous les clients et réattribuer", () => {
  assert.equal(peutModifierClient(responsable, aMoi), true);
  assert.equal(peutModifierClient(responsable, aLui), true);
  assert.equal(peutModifierClient(responsable, orphelin), true);
  assert.equal(peutReattribuer(responsable), true);
  assert.equal(peutReattribuer(commercialU1), false);
  assert.equal(peutReattribuer(commercialU2), false);
});

test("un commercial ne consulte pas un client qu'il ne peut pas modifier", () => {
  const visibles = clientsVisibles(commercialU1, [aMoi, aLui, orphelin]);
  assert.deepEqual(visibles.map((c) => c.id), ["c1"]);
});
