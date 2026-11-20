# Bang! — jeu de base

Entrée depuis l’accueil Complot : « Jouer à BANG! ». Route `/bang`, invitations `/bang?code=ABCDE`.
4 à 7 joueurs humains. Aucun bot ajouté aux parties réelles.

## Règles et contenu

16 personnages, paquet de 80 cartes avec quantités/couleurs/valeurs du jeu de base, rôles privés, Shérif public et bonus de vie, distribution initiale, pioche, une attaque BANG par tour (exceptions Volcanic/Willy), distances circulaires entre survivants et modificateurs, équipements uniques et remplacement d’arme.

Cartes : BANG, Raté, Bière, Saloon, Convoi, Diligence, Magasin, Braquage, Coup de foudre, Gatling, Indiens, Duel, Planque, Prison, Dynamite, Mustang, Lunette et cinq armes. Les noms Convoi (2 cartes) / Diligence (3 cartes) suivent le livret français fourni.

Tous les pouvoirs sont gérés : Bart, Black Jack, Calamity, El Gringo, Jesse, Jourdonnais, Kit, Lucky, Paul, Pedro, Rose, Sid, Slab, Suzy, Sam et Willy. Lucky choisit son dégaine ; Kit choisit la carte à remettre. Jesse/Pedro choisissent leur première source de pioche. Sid sélectionne deux cartes. Une réponse n’est jamais jouée automatiquement à la place d’un humain.

Perte de vie, fenêtre de sauvetage mortel, Bière inactive à deux survivants, Dynamite avant Prison, récompense d’un Hors-la-loi, pénalité du Shérif, victoire des camps et revanche. Une revanche redistribue tous les personnages (la conservation facultative des personnages n’est pas activée).

## Architecture

`bang-data.js` : contenu du jeu. `bang.js` : logique serveur et espace Socket.IO `/bang`. Une file séquence les effets. Le serveur décide des résultats ; le client envoie uniquement des intentions. `snapshot` exclut les mains adverses, identifiants de session, rôles secrets, pioche et options privées de Kit.

Le serveur Complot conserve son espace Socket.IO habituel et ses règles. Le nouveau module est attaché au même serveur HTTP, sans nouveau service payant. Les sessions Bang utilisent un jeton et un stockage distincts. Déconnexion d’un survivant : pause et restauration à la reconnexion. Quitter volontairement en partie élimine le joueur ; l’hôte peut retirer un absent. Les salons abandonnés expirent après une heure. Un redémarrage serveur efface les salons des deux jeux.

Interface : accueil conservé, saloon dédié, table adaptée à la largeur, cibles/attaquants identifiés, rôle/main masquables, explication des cartes, fiches joueurs, journal en direct et boutons de réponse contextuels. La page Bang défile verticalement sur petit écran pour garder les cartes lisibles. Pas de nouvelle dépendance native : composants Expo/React Native existants.

## Vérifications

Serveur : `node --test server.test.js bang.test.js bang.socket.test.js`.
Client : `npx tsc --noEmit`, puis ESLint sur les fichiers modifiés, puis `npx expo export --platform web`.
Les tests Bang couvrent les règles, les secrets, les reconnexions Socket.IO et 12 parties simulées vérifiant la conservation des 80 cartes à chaque étape. Les joueurs de test ne sont présents que sur le serveur de vérification local.

## Sources

- Livret fourni : `C:\Users\thoma\OneDrive\Documents\Bang_rules_FRA.pdf`, quatrième édition, jeu de base. Le PDF contient des pages dupliquées.
- Liste officielle des cartes : https://bang.dvgiochi.com/list_download.php?id=1
- Liste illustrée officielle : https://www.dvgiochi.com/giochi/bang/download/BANG!%20Card%20List.pdf

Graphismes des cartes recréés en composants ; aucune illustration commerciale copiée. BANG! est un jeu d’Emiliano Sciarra édité par dV Games. Cette implémentation est indépendante.
