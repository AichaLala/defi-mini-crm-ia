# Journal d'usage de l'IA

*À remplir au fil de l'eau, pas à la fin. Soyez honnête : une erreur de l'IA que vous avez repérée compte plus qu'un code parfait
dont vous ne savez pas d'où il vient.*

- **Nom :** Mame Lala Aïcha Dieng
- **Outil(s) d'IA utilisé(s), et pour quoi :** Cursor (analyse du dépôt, corrections, fonctionnalités CRM, CSS, tests, journal) et ChatGPT
- **Heure de départ :** 9h38

## Chronologie

| Heure | Ce que j'ai demandé à l'IA (en résumé) | Ce qu'elle a produit | Ce que j'ai vérifié, corrigé ou refusé |
|---|---|---|---|
| 10:53 | Analyser le projet sans modifier les fichiers | Diagnostic : pipeline en lecture seule, fuite d'accès (`!c.proprietaire`), montants en chaînes, dashboard visible à tous | Relu `acces.js`, `donnees/`, `tests/`. Diagnostic conforme au code. |
| 10:55 | Corriger les droits d'accès en commençant par des tests qui échouent | Tests dans `tests/acces.test.js`, puis `clientsVisibles` avec `===` | Tests lancés **avant** correction : 2 échecs (orphelins visibles). Le test `"u1 "` isolé **passait déjà** (`"u1 " == "u1"` est faux). Première version du test espace échouait à cause du `null`, pas de l'espace : j'ai demandé d'isoler le cas. Après correction : `npm.cmd test` → 5 pass / 0 fail. |
| 10:59 | Corriger les totaux (montants chaînes) et réserver le tableau de bord à la responsable | Tests `tests/tableau.test.js` et `tests/affichage.test.js` ; `montantNumerique` + `formatMontantFcfa` ; `peutVoirTableauDeBord` ; UI `#tableau-de-bord` | **Avant** : 9 tests lancés, 5 pass / 4 fail. Les 3 tests de `tableau.test.js` échouent pour la concaténation (`typeof` string, `perdu` = `'090000'`). `affichage.test.js` n'a **pas** pu s'exécuter : `formatMontantFcfa` n'existait pas (`SyntaxError`). Le test de visibilité n'a donc pas échoué par assertion avant correction. **Après** : `npm.cmd test` → 10 pass / 0 fail. Pas de vérif navigateur à ce moment-là. |
| 11:14 | Implémenter fiche, édition, étapes, localStorage, droits d'écriture et réattribution, avec tests | Modules `crm.js` / `stockage.js`, fiche `<dialog>` dans `index.html`, `app.js` branché dessus, tests `crm.test.js`, `stockage.test.js`, `permissions.test.js` | En relisant le dépôt, une grande partie de cette logique était déjà présente (20 tests verts). J'ai ajouté des tests ciblés. **Échec réel avant correction :** « une étape invalide en sauvegarde ne remplace pas l'étape source » (`actual: 'en-cours'`). Correction : `fusionnerClients` ignore une étape hors `ETAPES`. Autres ajouts : ne pas réattribuer un orphelin par défaut au premier commercial ; `proprietaire` vide/null autorisé pour la responsable. `npm.cmd test` ensuite : 27 pass / 0 fail. Tentative d'ouverture navigateur via l'outil Cursor : **interrompue**, donc pas de vérif UI par l'IA. |
| 11:33 | Améliorer uniquement le CSS (SaaS, responsive), sans casser la logique | `styles.css` + structure HTML (header, cartes KPI, classes boutons). `app.js` inchangé | `npm.cmd test` : 27 pass / 0 fail. Pas de vérif visuelle par l'IA (outil navigateur interrompu). |
| 11:59 | Finaliser le journal et les livrables README, sans commit | Mise à jour de `JOURNAL-IA.md` et de la section Livrables | Tests présents : `exemple`, `acces`, `tableau`, `affichage`, `crm`, `permissions`, `stockage` (`npm test` = `node --test`). `npm.cmd test` : 27 pass / 0 fail. `git diff --check` : espace en fin de ligne sur le README, corrigé. Pas de commit, pas de déploiement. |

## Les erreurs de l'IA que j'ai repérées

- Premier jet du test `"u1 "` mélangeait ce client avec les `proprietaire: null`. Il échouait, mais **pour la mauvaise raison** (fuite des orphelins). Isolé, le test passait déjà avant la correction : `==` ne considère pas `"u1 "` comme `"u1"`. Le `===` reste utile pour figer la règle et éviter une égalité trop large plus tard.
- Le test de visibilité du tableau de bord a d'abord été collé dans le même fichier que `formatMontantFcfa`. Comme cet export n'existait pas, **tout le fichier a planté au chargement** : le défaut « dashboard visible aux commerciaux » n'a pas été démontré par une assertion avant la correction. J'ai séparé les tests de calcul (fonctions déjà présentes) des tests d'affichage.
- Lors de la demande « implémenter les fonctionnalités CRM », une partie du code (fiche, `modifierClient`, localStorage) était déjà dans le dépôt. Relancer une réécriture complète aurait été inutile ; j'ai durci la fusion localStorage et la réattribution.
- L'outil navigateur Cursor a été lancé pour vérifier l'UI puis **interrompu**. Je n'ai donc pas de constat visuel de l'IA. Les vérifications manuelles (changement d'étape, persistance, totaux, réaffectation manager) sont celles que j'ai faites moi-même ensuite.

## Les défauts trouvés dans le code et les données de départ

| Défaut | Où | Pourquoi c'est un problème | Ma correction | Le test qui le prouve |
|---|---|---|---|---|
| Un commercial voit aussi les clients sans propriétaire (`\|\| !c.proprietaire`) | `acces.js` (`clientsVisibles`) | Un commercial accède à des fiches qui ne lui appartiennent pas (données personnelles) | Filtrer uniquement `c.proprietaire === utilisateur.id` ; la responsable reçoit toute la liste | `tests/acces.test.js` : commercial = id exact ; orphelins invisibles. Échouaient avant correction (`actual: ['c-u1', 'c-null']`). |
| Propriétaire `"u1 "` (espace) dans les données | `donnees/clients.json` (c16) + comparaison d'id | Yoff Digital n'est rattaché ni à `u1` ni à `u2` | Comparaison stricte `===` (le client reste invisible aux commerciaux, visible à la responsable). Données non encore nettoyées. | `tests/acces.test.js` : `"u1 "` n'appartient pas à `u1`. Passait déjà avec `==` ; conservé comme garde-fou. |
| Montants `montant_fcfa` parfois en chaîne (`"90000"`, `"750000"`, `"150000"`) | `donnees/clients.json` + `tableau.js` (`+`) | `+` concatène : totaux de type string, pipeline faux | `montantNumerique()` puis addition ; données d'origine inchangées | `tests/tableau.test.js` : totaux number, pipeline 1 640 000 hors perdu. Avant : `'string' !== 'number'` et `'090000' !== 90000`. |
| Tableau de bord visible pour tous, totaux en JSON brut | `index.html`, `app.js` | Un commercial voyait les agrégats de tout le pipeline ; format illisible | `peutVoirTableauDeBord` (responsable seulement) ; `#tableau-de-bord` masqué sinon ; `formatMontantFcfa` | `tests/affichage.test.js`. Avant correction : fichier non chargé (`formatMontantFcfa` absent). Après : 2 tests passent. Pas de test DOM. |
| Une sauvegarde localStorage pouvait restaurer une étape hors liste | `stockage.js` (`fusionnerClients`) | Un client pouvait sortir du pipeline visuel (étape inconnue) | Ne reprendre `etape` que si elle est dans `ETAPES` | `tests/stockage.test.js` : « une étape invalide en sauvegarde… ». Échouait (`'en-cours'`), puis passe. |

## Couverture : tests automatisés vs vérifications manuelles

**Couvert par `npm test` (`node --test`, fichiers dans `tests/`) :** droits de lecture (`acces.test.js`, `exemple.test.js`) ; totaux et format FCFA (`tableau.test.js`, `affichage.test.js`) ; visibilité du dashboard *en fonction* (`peutVoirTableauDeBord`), pas le DOM ; édition / étapes / réattribution (`crm.test.js`, `permissions.test.js`) ; sauvegarde et rechargement via un faux `localStorage` (`stockage.test.js`).

**Vérifié manuellement dans le navigateur (par moi, pas par l'IA) :** changement d'étape, persistance après actualisation, calculs du pipeline, réaffectation par le manager.

**Non vérifié par l'IA dans le navigateur :** rendu CSS, bascule Awa/Mariama à l'écran, ouverture de la fiche au clic. Les IDs HTML (`utilisateur`, `pipeline`, `tableau-de-bord`, `fiche`, etc.) n'ont pas été renommés.

## Ce que je ferais avec plus de temps

- Publier le site sur here.now (non fait).
- Nettoyer le propriétaire `"u1 "` dans `donnees/clients.json`.
- Ajouter un test DOM ou une vérif automatisée de `[hidden]` sur le tableau de bord.
