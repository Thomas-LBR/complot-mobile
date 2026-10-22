# Direction visuelle — salon de complots

Palette vert profond, laiton et ivoire. Illustrations originales à l’huile/gouache, cadres et dos de cartes dessinés en SVG.

## Bibliothèques
- expo-linear-gradient ~15.0.8 : lumière du plateau, boutons et fenêtres.
- react-native-reanimated (déjà présent) : apparition des panneaux et interaction des boutons. Les animations utilisent ReduceMotion.System.
- @expo-google-fonts/cormorant-garamond et @expo-google-fonts/manrope : polices intégrées au projet, sans appel Google Fonts pendant la partie.
- @expo/vector-icons (déjà présent) : icônes des actions et des rôles.
- expo-image (déjà présent) : affichage et cache des portraits.

## Illustrations
Les six portraits ont été créés avec l’outil imagegen intégré.
Fichiers dans C:\Users\thoma\complot-mobile\assets\art :
duchesse.png, assassin.png, capitaine.png, comtesse.png, ambassadeur.png, inquisiteur.png.
Les prompts exacts figurent dans assets/art/ARTWORK.md.
Les fichiers originaux restent aussi dans le dossier de travail design-v2/assets/art.

## Vérifications
- TypeScript et ESLint : aucune erreur ni avertissement.
- Accueil, salle et plateau vérifiés à 1280 × 720 et 390 × 844 dans le navigateur.
- Partie à huit joueurs : placement, cartes privées, masquage et confirmation d’action vérifiés.
- Rechargement : la même partie et la main sont restaurées.
- Bundles Android et iOS : compilation HTTP 200. Aucun test sur appareil physique.
- Aucun changement du moteur, des coûts ou de la variante de règles pendant cette refonte.

## Revenir au rendu précédent
Les fichiers remplacés sont sauvegardés dans
C:\Users\thoma\OneDrive\Documents\ChatGPT\jeux compot\backup\before-design-v2.

