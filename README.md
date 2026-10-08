# Just for you, my Tütüş ♡

Site d’anniversaire **HTML, CSS et JavaScript pur**, violet nuit et lavande. Aucun framework, service tiers, tracker ni serveur à héberger. Le navigateur charge uniquement des fichiers statiques. Les titres, citations et la lettre utilisent **Edu QLD Hand**, hébergée localement dans `assets/fonts/`, avec sa licence OFL. Les contrôles et petites indications conservent la police système.

Le contrôle horaire est actuellement commenté dans `app.js` pour les tests. À chaque ouverture, un écran demande **Français ou Türkçe**, puis **avec ou sans musique**. Les deux choix doivent être confirmés pour entrer dans la lettre ; ils ne sont jamais sauvegardés. La musique démarre uniquement après accord sur cet écran, avec un fondu doux. Si le navigateur la bloque, le bouton musique ou un nouveau geste permet de la lancer. Choisir sans musique laisse toute l’expérience silencieuse, sauf si la visiteuse décide ensuite d’activer le bouton.

## Ouvrir et préparer le site

Les 20 photos sont préparées localement en trois tailles, sans métadonnées EXIF/GPS. Le message français est généré depuis `message.txt`, sans correction ni copie manuelle. La traduction turque complète vient de `message.tr.txt`, avec le même ordre et le même nombre de paragraphes. Titres, boutons, indications, textes alternatifs et erreurs sont traduits via `i18n.js`. Aucun service externe de traduction n’est utilisé. Les originaux restent en dehors de `dist/`.

Sous Windows avec Node.js installé :

```powershell
npm.cmd run build
npm.cmd test
```

Pas de `npm install` nécessaire sous Windows : conversion native System.Drawing. Sous macOS/Linux, installer le seul outil de préparation des images : `npm install --no-save sharp`, puis `npm run build`. Sharp produit des WebP, Windows des JPEG optimisés. Un format HEIC non pris en charge doit être converti localement en JPEG.

Ouvrir `dist/index.html` dans le navigateur, ou `index.html` après la préparation. Pour voir la version ouverte avant l’heure : ajouter `?preview=true` à l’adresse **locale** (`file://`, localhost ou 127.0.0.1). Ce paramètre est ignoré sur GitHub Pages et tous les domaines distants. Le remplacement de `VITE_PREVIEW_MODE` par ce paramètre local est volontaire : le site n’utilise pas Vite.

## Publier sur GitHub Pages

Le workflow `.github/workflows/pages.yml` prépare et publie uniquement `dist/`. Il s’exécute après un push sur `main`, ou manuellement depuis **Actions → Publier le site anniversaire → Run workflow**.

1. Envoyer les fichiers du projet dans ton dépôt GitHub, avec `message.txt`, `message.tr.txt` et `images/` nécessaires à la préparation.
2. Dans le dépôt, ouvrir **Settings → Pages → Source → GitHub Actions**.
3. Après l’heure d’ouverture, lancer le workflow (ou pousser sur `main`). L’URL sera affichée par le job de publication. Pour ce dépôt, l’adresse attendue est `https://moqim-ghizlan.github.io/tutus-birthday/` ; elle n’est active qu’après une publication réussie.

Le workflow **refuse de publier avant le 8 octobre 2026 à 20:59 UTC**. Il faut le relancer après l’heure : aucune programmation automatique à la seconde n’est promise. Aucun push ni déploiement n’a été effectué par l’agent. Pour publier manuellement ailleurs, envoyer seulement le contenu de `dist/` : pas de commande ni serveur en production. Les chemins relatifs fonctionnent sous `/tutus-birthday/`.

## Ouverture et confidentialité

Instant d’ouverture prévu : **8 octobre 2026 à 23:59 Sofia = 22:59 Paris = `2026-10-08T20:59:00Z`**. Le contrôle horaire est actuellement commenté pour les tests : l’accueil est disponible immédiatement et le contenu local se prépare en arrière-plan. La lettre n’apparaît qu’après confirmation de la langue et du choix de musique. Ni l’état de déverrouillage, ni la langue, ni le choix de musique ne sont enregistrés dans le navigateur.

**Le compte à rebours côté navigateur est cosmétique, pas un embargo sécurisé.** L’heure de l’appareil peut être modifiée et les URL des fichiers publiés restent récupérables. GitHub Pages rend les médias déployés publics. Un dépôt public expose aussi `message.txt` et les photos originales dès le push, même sans Pages. Garder le dépôt privé si l’offre GitHub permet Pages privé-source, ou ne pousser les fichiers privés qu’après l’ouverture. Le refus de publication du workflow évite un déploiement anticipé via ce workflow, mais ne protège ni les sources d’un dépôt public, ni les déploiements manuels.

Les textes et photos ne sont envoyés à aucune API par les scripts. Le workflow les transmet à GitHub uniquement lorsque tu choisis de pousser et de publier le projet. `noindex` décourage l’indexation sans garantir la confidentialité.

## Modifier les contenus

- Modifier `message.txt`, mettre à jour la traduction correspondante dans `message.tr.txt`, puis refaire la préparation. Le français demeure intact, avec ses retours de ligne, accents et expressions personnelles. Le build vérifie que les deux versions ont le même nombre de paragraphes. Les aperçus sont extraits du texte dans la langue choisie.
- Ajouter des photos dans `images/hers/` et `images/together/`, puis refaire le build. Les images sont affichées sans recadrage destructeur, avec agrandissement au clic. `photo-positions.json` permet un réglage par nom (`"hers/IMG_2317.JPEG": "50% 35%"`).
- Ajouter un fichier audio autorisé dans `audio/` ou à la racine (MP3, OGG, M4A ou WAV), puis refaire le build. Sans audio, aucun contrôle persistant n’apparaît. La musique démarre seulement si elle est choisie sur l’accueil, avec un fondu et un volume modéré, puis reste contrôlable jusqu’à la fin.
- Les couleurs principales sont les variables en tête de `style.css` : violet `#a879df`, lavande `#d7bcfa`, violet nuit `#10091f`.

## Vérifications

`npm test` vérifie les bornes de l’ouverture, les fuseaux, le décompte, les deux messages intégraux UTF-8 et leurs paragraphes, les clés de traduction, l’inventaire des photos, les chemins relatifs, la copie fidèle du MP3, l’absence d’EXIF dans les JPEG optimisés et la correspondance entre les sources et `dist`.

`npm run test:browser` vérifie dans Edge sous Windows : choix obligatoires à chaque ouverture et rechargement ; silence avant accord et après choix sans musique ; lettres française et turque complètes, interface et erreurs traduites ; police locale ; hébergement dans un sous-répertoire comme GitHub Pages ; lecture du vrai MP3, fondu et pause ; relecture sans redémarrage du morceau ; décodage des 21 images affichées ; largeurs 320, 375, 430, 768 et 1440 px pour l’accueil et les deux langues ; texte agrandi à 200 % ; bouton final au clavier et cible tactile ; lightbox, Échap et retour du focus ; mode lecture ; reduced-motion ; repli d’une photo manquante ; récupération du contenu avec Réessayer après un chargement bloqué. Les contrôles ont réussi sans exception JavaScript. Le scroll reste natif, sans sections bloquées.
# i-love-my-tutus
