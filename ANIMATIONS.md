# Table animée — validation et maintenance

La logique de jeu reste dans server.js. visualEvents est un journal public borné à 40 événements, avec un identifiant monotone et des instantanés de joueurs explicitement filtrés. Aucun rôle caché, jeton de session, paquet ni carte d'échange n'est envoyé dans ce journal.

useTableTimeline sérialise les événements par identifiant, ignore les doublons et reprend l'état courant lors d'une reconnexion, d'un changement de manche ou d'un retour au premier plan. Les changements de compteurs et d'influences suivent la présentation de l'événement, sans écrire dans le moteur. Les feuilles de révélation et d'échange attendent la fin des effets déjà reçus. La victoire laisse finir la dernière animation.

TableBoard mesure les sièges et les centres des avatars, cartes et pièces avec onLayout. TableEffects utilise ces coordonnées relatives à la table. Les déplacements et pulsations utilisent Reanimated, les cartes publiques se retournent en 3D et les cartes en transit restent de dos. Les préférences système de réduction des mouvements désactivent les trajectoires, secousses, particules et pulsations. Les boutons conservent leur animation de pression existante.

Validation automatisée : TypeScript, ESLint, compilation Hermes Android et 24 tests Socket.IO (dont ordre des attaques, bouclier accepté/brisé, confidentialité, synchronisation et journal borné).
Validation navigateur : petit écran 390 × 844, partie réelle à trois clients, revenu et échange privé. Cette vérification n'est pas une mesure de 60 FPS sur appareil physique.

Pour voir les nouveaux événements, redémarrer le processus Node du serveur, puis recharger le client. Les salons existants sont en mémoire : terminer les parties avant ce redémarrage. Aucune nouvelle dépendance native n'a été ajoutée. Utiliser un Expo Go correspondant au SDK 54 du projet.

À vérifier sur les téléphones ciblés : vol entre sièges opposés, attaque bloquée puis contestée, perte des deux influences, rotation/redimensionnement, réduction des mouvements et retour après mise en arrière-plan. Observer le FPS en build natif sur un appareil de référence avant toute promesse de 60 FPS.
