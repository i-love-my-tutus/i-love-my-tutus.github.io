# Just for you, my Tütüş ♡

Site d’anniversaire **HTML, CSS et JavaScript pur**, violet nuit et lavande. Aucun framework, service tiers, tracker ni serveur à héberger. Le navigateur charge uniquement des fichiers statiques. Les titres, citations et la lettre utilisent **Edu QLD Hand**, hébergée localement dans `assets/fonts/`, avec sa licence OFL. Les contrôles et petites indications conservent la police système.

Avant le **8 octobre 2026 à 23:59 en Bulgarie**, seule la page romantique avec son compte à rebours apparaît. À l’heure cible, elle laisse automatiquement place au choix **Français ou Türkçe**, puis **avec ou sans musique**, sans rechargement ni nouveau déploiement. Les deux choix doivent être confirmés pour entrer dans la lettre ; ils ne sont jamais sauvegardés. La musique démarre uniquement après accord sur cet écran, avec un fondu doux. Si le navigateur la bloque, le bouton musique ou un nouveau geste permet de la lancer.

## Ouvrir et préparer le site

Les 20 photos sont préparées localement en trois tailles, sans métadonnées EXIF/GPS. Le message français est généré depuis `message.txt`, sans correction ni copie manuelle. La traduction turque complète vient de `message.tr.txt`, avec le même ordre et le même nombre de paragraphes. Titres, boutons, indications, textes alternatifs et erreurs sont traduits via `i18n.js`. Aucun service externe de traduction n’est utilisé. Les originaux restent en dehors de `dist/`. Les images optimisées et `assets/content.js` sont versionnés pour la publication depuis la racine de `main`.

Sous Windows avec Node.js installé :

```powershell
npm.cmd run build
npm.cmd test
```

Pas de `npm install` nécessaire sous Windows : conversion native System.Drawing. Sous macOS/Linux, installer le seul outil de préparation des images : `npm install --no-save sharp`, puis `npm run build`. Sharp produit des WebP, Windows des JPEG optimisés. Un format HEIC non pris en charge doit être converti localement en JPEG.

Ouvrir `dist/index.html` dans le navigateur, ou `index.html` après la préparation. Pour voir la version ouverte avant l’heure : ajouter `?preview=true` à l’adresse **locale** (`file://`, localhost ou 127.0.0.1). Ce paramètre est ignoré sur GitHub Pages et tous les domaines distants. Le remplacement de `VITE_PREVIEW_MODE` par ce paramètre local est volontaire : le site n’utilise pas Vite.

## Publier sur GitHub Pages

Le dépôt est `i-love-my-tutus/i-love-my-tutus.github.io` et le site est servi directement à la racine de `https://i-love-my-tutus.github.io/`, sans préfixe de dossier.

Une seule méthode est conservée : la publication automatique GitHub Pages depuis **`main` → `/ (root)`**. Le réglage distant existant est `build_type: legacy`, avec cette branche et ce dossier. Cette méthode fonctionne sans accès administrateur pour changer les réglages. Le workflow personnalisé `.github/workflows/pages.yml`, qui échouait volontairement avant l’heure, est supprimé ; aucun deuxième workflow de publication n’est ajouté.

1. Après une modification des sources, lancer `npm.cmd run build` puis `npm.cmd test` localement.
2. Committer les changements **avec `assets/content.js`, `assets/photos/`, la musique et les polices**. Ces fichiers générés sont désormais suivis par Git ; `dist/` reste ignoré.
3. Pousser sur `main`. GitHub lance automatiquement **pages build and deployment** pour publier la racine du dépôt. Le fichier `.nojekyll` permet de servir les fichiers statiques tels quels.
4. Consulter `https://i-love-my-tutus.github.io/`. Cette adresse est publique ; avant l’heure, elle montre le compte à rebours.

La publication peut réussir **avant l’heure** : le verrou est géré par le navigateur. Aucun job ne doit attendre le 8 octobre ou échouer à cause de la date. Les anciens runs du workflow supprimé peuvent rester visibles dans l’historique d’Actions, mais ne se déclenchent plus sur les prochains pushs. Ne pas réintroduire un workflow `deploy-pages` en parallèle de la publication depuis la branche. Tous les chemins restent relatifs et sont testés sous **`/`**, y compris les images, la musique, la police et le script de contenu. Pour un autre hébergement, envoyer seulement le contenu de `dist/`.

## Ouverture et confidentialité

Instant absolu d’ouverture : **8 octobre 2026 à 23:59 Sofia = 22:59 Paris = `2026-10-08T20:59:00Z`**. Avant cet instant, seul le teaser apparaît et le navigateur ne demande ni `assets/content.js`, ni les photos, ni le MP3. À partir de cet instant, il charge automatiquement le contenu et affiche le choix de langue et de musique. Une visite plus tardive mène directement aux choix. Ni l’état de déverrouillage, ni la langue, ni le choix de musique ne sont enregistrés dans le navigateur.

**Le compte à rebours côté navigateur est cosmétique, pas un embargo sécurisé.** L’heure de l’appareil peut être modifiée et les URL des fichiers publiés restent récupérables. La publication depuis la racine de la branche sert aussi les fichiers sources présents dans ce dossier ; le dépôt public expose le message et les originaux dès le push. Les images optimisées sont sans EXIF, mais cela ne retire pas les métadonnées des originaux publics.

Pour un véritable embargo, publier seulement le teaser maintenant et conserver le message, les photos et le MP3 hors du dépôt public jusqu’à l’heure. Il faudra alors un deuxième déploiement pour les ajouter. Pour conserver une seule publication et obtenir un embargo réel, servir les contenus privés depuis un serveur/edge qui les refuse avant l’heure selon une horloge serveur fiable. GitHub Pages seul ne peut pas fournir cette protection.

Les textes et photos ne sont envoyés à aucune API par les scripts. Le workflow les transmet à GitHub uniquement lorsque tu choisis de pousser et de publier le projet. `noindex` décourage l’indexation sans garantir la confidentialité.

## Modifier les contenus

- Modifier `message.txt`, mettre à jour la traduction correspondante dans `message.tr.txt`, puis refaire la préparation. Le français demeure intact, avec ses retours de ligne, accents et expressions personnelles. Le build vérifie que les deux versions ont le même nombre de paragraphes. Les aperçus sont extraits du texte dans la langue choisie.
- Ajouter des photos dans `images/hers/` et `images/together/`, puis refaire le build. Les images sont affichées sans recadrage destructeur, avec agrandissement au clic. `photo-positions.json` permet un réglage par nom (`"hers/IMG_2317.JPEG": "50% 35%"`).
- Ajouter un fichier audio autorisé dans `audio/` ou à la racine (MP3, OGG, M4A ou WAV), puis refaire le build. Sans audio, aucun contrôle persistant n’apparaît. La musique démarre seulement si elle est choisie sur l’accueil, avec un fondu et un volume modéré, puis reste contrôlable jusqu’à la fin.
- Les couleurs principales sont les variables en tête de `style.css` : violet `#a879df`, lavande `#d7bcfa`, violet nuit `#10091f`.

## Vérifications

`npm test` vérifie les bornes de l’ouverture, les fuseaux, le décompte, le mode aperçu limité aux adresses locales, les deux messages intégraux UTF-8 et leurs paragraphes, les clés de traduction, l’inventaire des photos, les chemins relatifs, la copie fidèle du MP3, l’absence d’EXIF dans les JPEG optimisés, la correspondance entre les sources et `dist` et l’absence de workflow de publication concurrent.

`npm run test:browser` vérifie dans Edge sous Windows : teaser seul avant l’heure dans trois fuseaux ; aucune requête de contenu, photo ou musique avant l’heure ; ouverture automatique avec horloge simulée, sans rechargement ; chemins sous `/` ; choix obligatoires à chaque ouverture ; silence avant accord ; français/turc intégraux ; police locale ; vrai MP3, fondu et pause ; relecture ; décodage des 21 images ; largeurs 320, 375, 430, 768 et 1440 px ; texte à 200 % ; clavier/focus ; reduced-motion ; photo manquante et récupération après un échec de chargement. Le design et les animations existants sont conservés.
# i-love-my-tutus
