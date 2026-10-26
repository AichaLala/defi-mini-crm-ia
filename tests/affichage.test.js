import { readFileSync } from "node:fs";
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
  // Garde-fou de la règle extraite. Le 10:59, ce fichier n'a pas pu s'exécuter
  // (export formatMontantFcfa absent) : pas d'échec d'assertion avant correction.
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

test("le HTML masque le tableau de bord par défaut", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /id="tableau-de-bord"[^>]*\bhidden\b/);
});
