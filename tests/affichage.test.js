import { test } from "node:test";
import assert from "node:assert/strict";
import { formatMontantFcfa } from "../tableau.js";
import { peutVoirTableauDeBord } from "../acces.js";

test("formatMontantFcfa affiche des milliers séparés par des espaces", () => {
  assert.equal(formatMontantFcfa(1250000), "1 250 000 FCFA");
  assert.equal(formatMontantFcfa("90000"), "90 000 FCFA");
  assert.equal(formatMontantFcfa("750000"), "750 000 FCFA");
  assert.equal(formatMontantFcfa("150000"), "150 000 FCFA");
});

test("le tableau de bord n'est visible que pour la responsable", () => {
  assert.equal(
    peutVoirTableauDeBord({ id: "u3", role: "responsable" }),
    true,
  );
  assert.equal(
    peutVoirTableauDeBord({ id: "u1", role: "commercial" }),
    false,
  );
  assert.equal(
    peutVoirTableauDeBord({ id: "u2", role: "commercial" }),
    false,
  );
});
