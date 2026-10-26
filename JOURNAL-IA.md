# Journal d'usage de l'IA

*À remplir au fil de l'eau, pas à la fin. Soyez honnête : une erreur de l'IA que vous avez repérée compte plus qu'un code parfait
dont vous ne savez pas d'où il vient.*

- **Nom :*Mame Lala Aïcha Dieng*
- **Outil(s) d'IA utilisé(s), et pour quoi :J’utilise Cursor pour analyser le code existant, m’aider à implémenter les fonctionnalités du mini-CRM, identifier et corriger les défauts, et générer des tests automatisés**
- **Heure de départ :*9h38*

## Chronologie

| Heure | Ce que j'ai demandé à l'IA (en résumé) | Ce qu'elle a produit | Ce que j'ai vérifié, corrigé ou refusé |
|---|---|---|---|
| 10:53 | Analyser le projet sans modifier les fichiers | Diagnostic : pipeline en lecture seule, fuite d'accès (`!c.proprietaire`), montants en chaînes, dashboard visible à tous | Relu `acces.js`, `donnees/`, `tests/`. Diagnostic conforme au code. |
| 10:55 | Corriger les droits d'accès en commençant par des tests qui échouent | Tests dans `tests/acces.test.js`, puis `clientsVisibles` avec `===` | Tests lancés **avant** correction : 2 échecs (orphelins visibles). Le test `"u1 "` isolé **passait déjà** (`"u1 " == "u1"` est faux). Première version du test espace échouait à cause du `null`, pas de l'espace : j'ai demandé d'isoler le cas. Après correction : `npm.cmd test` → 5 pass / 0 fail. |

## Les erreurs de l'IA que j'ai repérées

- Premier jet du test `"u1 "` mélangeait ce client avec les `proprietaire: null`. Il échouait, mais **pour la mauvaise raison** (fuite des orphelins). Isolé, le test passait déjà avant la correction : `==` ne considère pas `"u1 "` comme `"u1"`. Le `===` reste utile pour figer la règle et éviter une égalité trop large plus tard.

## Les défauts trouvés dans le code et les données de départ

| Défaut | Où | Pourquoi c'est un problème | Ma correction | Le test qui le prouve |
|---|---|---|---|---|
| Un commercial voit aussi les clients sans propriétaire (`\|\| !c.proprietaire`) | `acces.js` (`clientsVisibles`) | Un commercial accède à des fiches qui ne lui appartiennent pas (données personnelles) | Filtrer uniquement `c.proprietaire === utilisateur.id` ; la responsable reçoit toute la liste | `tests/acces.test.js` : commercial = id exact ; orphelins invisibles. Échouaient avant correction (`actual: ['c-u1', 'c-null']`). |
| Propriétaire `"u1 "` (espace) dans les données | `donnees/clients.json` (c16) + comparaison d'id | Yoff Digital n'est rattaché ni à `u1` ni à `u2` | Comparaison stricte `===` (le client reste invisible aux commerciaux, visible à la responsable). Données non encore nettoyées. | `tests/acces.test.js` : `"u1 "` n'appartient pas à `u1`. Passait déjà avec `==` ; conservé comme garde-fou. |

## Ce que je ferais avec plus de temps

-
