# Jouer à Complot

## Démarrage dans deux terminaux PowerShell

```powershell
cd C:\Users\thoma\complot-server
npm.cmd start
```

```powershell
cd C:\Users\thoma\complot-mobile
npm.cmd start
```

Appuyer sur `w` dans le terminal Expo, ou ouvrir `http://localhost:8081`.
Les dépendances sont déjà installées sur ce PC.

## Jouer ensemble sur le même Wi-Fi

L'hôte crée une salle. Les amis ouvrent `http://ADRESSE_IP_DU_PC:8081`
dans leur navigateur, choisissent **Rejoindre**, puis saisissent le code de cinq caractères.
`ipconfig` affiche l'adresse IPv4 de la carte Wi-Fi. Le bouton **Copier l'invitation**
de la salle prépare le lien et le code. Le PC hôte doit rester allumé et les deux
terminaux doivent rester ouverts. L'adresse `localhost` ne fonctionne que sur le PC hôte.

Au 22 octobre 2026, l'adresse Wi-Fi vérifiée est `10.114.128.179`.
Elle peut changer après un changement de réseau. Les ports locaux utilisés sont 8081
(interface Expo) et 3001 (serveur du jeu). Aucun compte n'est nécessaire.

## À la table

- Deux à huit joueurs. Chacun confirme **Je suis prêt** ; l'hôte lance ensuite la partie.
- L'hôte choisit la variante classique (Ambassadeur) ou Inquisiteur.
- En duel, chacun reçoit une carte aléatoire et choisit sa seconde influence.
- Les actions disponibles indiquent leurs coûts et leurs conditions. Le bluff reste possible.
- Variante de la table : l'Assassin (3 pièces) et l'assassinat (7 pièces) nécessitent
  de choisir un joueur et de deviner un rôle caché. Si le rôle est absent, les pièces
  sont perdues et aucune influence ne tombe. S'il est présent, seule une carte de ce
  rôle peut être révélée. Une carte déjà révélée ne compte pas comme un rôle caché.
- Les réactions sont explicites : accepter, contester ou contrer. Aucun délai automatique
  ne décide à la place d'un joueur.
- Le carnet de règles est accessible à tout moment. Le journal de bord ne contient
  que des informations publiques, jamais les cartes cachées.
- **Masquer** protège votre main des regards. Les autres clients ne reçoivent pas vos cartes.
- À la fin, l'hôte peut préparer une revanche. Les victoires sont conservées et le vainqueur
  de la manche précédente commence.

## Connexion et sauvegarde

Une coupure de connexion suspend la partie si le joueur est encore en jeu. La reconnexion
reprend le tour et les choix en attente. Dans un navigateur, actualiser le même onglet
conserve la place grâce à un jeton de session. Deux onglets distincts peuvent servir à
deux joueurs de test. Dans l'application native, la reconnexion est conservée tant
que l'application n'est pas entièrement arrêtée.

L'hôte peut retirer un joueur déconnecté qui ne revient pas. En cours de partie, ses
influences sont alors révélées et il abandonne la manche. Un simple clic sur **Quitter**
demande confirmation avant l'abandon.

Les salles sont stockées en mémoire du serveur : son redémarrage termine les parties.
Une salle sans aucun joueur connecté expire au bout d'environ une heure.

## Vérification du code

```powershell
cd C:\Users\thoma\complot-server
npm.cmd test
```

Les tests couvrent les tailles de table, le duel, les coûts, les contestations, les contres,
les échanges, l'Inquisiteur, la confidentialité des états, les déconnexions et les revanches.

```powershell
cd C:\Users\thoma\complot-mobile
npx.cmd tsc --noEmit
npm.cmd run lint
```

Les six portraits originaux sont générés avec imagegen et intégrés dans `assets/art`. Les cadres et dos de cartes sont dessinés dans `components/Card.tsx`. Voir `DESIGN.md` pour les bibliothèques et `assets/art/ARTWORK.md` pour les prompts.
Le thème commun se trouve dans `game/theme.ts`. Les règles sont appliquées par le serveur ;
le client n'est jamais la source d'autorité pour les pièces ou les cartes.

