// Exemple de test (il passe déjà). Ajoutez les vôtres : chaque défaut que vous corrigez doit avoir un test
// qui ÉCHOUAIT avant votre correction. Lancer : npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { clientsVisibles } from "../acces.js";

test("le responsable voit tous les clients", () => {
  const clients = [{ id: "a", proprietaire: "u1" }, { id: "b", proprietaire: "u2" }];
  assert.equal(clientsVisibles({ id: "u3", role: "responsable" }, clients).length, 2);
});
