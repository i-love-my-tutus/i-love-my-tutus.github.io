# PLAN.md — « Just For You, My Tütüş »

> Cahier des charges à donner à un agent Codex. **Réaliser le site intégralement**, pas seulement une maquette. Ne pas demander de nouvelles informations si les fichiers locaux permettent d'avancer. L'expérience doit être soignée, personnelle, poétique, émotionnelle et **mobile-first**.

## 0. Mission et priorité absolue

Construire un **site d'anniversaire romantique, cinématographique et interactif**, destiné à ma copine, avec un très long message d'amour révélé au fil du scroll, nos photos de couple et ses photos, des transitions magnifiques, une musique facultative et un final mémorable.

Le résultat attendu n'est **pas** un modèle générique de landing page ni une succession de cartes banales : c'est un **film d'amour dans lequel elle avance à son rythme**.

**Fichiers locaux existants (sources de vérité) :**

- `./message.txt` : message intégral que j'ai écrit. À lire et à conserver fidèlement.
- `./images/together/` : photos de nous deux ensemble.
- `./images/hers/` : photos d'elle seule.
- Optionnel : `./public/audio/` ou `./audio/` pour un morceau que j'ajouterai légalement moi-même.

Ne jamais inventer de souvenirs, lieux, dates, citations ou légendes présentés comme personnels. Ne jamais envoyer les images ni le texte à une API externe. **Les photos et le message sont privés**.

## 1. Date d'ouverture et verrouillage

**Ouverture : le 8 octobre 2026 à 23:59:00, dans le fuseau `Europe/Sofia` (Bulgarie).** Ce même instant correspond au **8 octobre 2026 à 22:59:00 à Paris** (`Europe/Paris`) : à cette date la Bulgarie a une heure d'avance sur la France.

- Utiliser l'instant absolu de déverrouillage : `2026-10-08T20:59:00Z` (UTC). Pas de calcul naïf « heure de France +1 » ni de fuseau basé sur le téléphone.
- Avant cette heure, afficher **uniquement une page teaser élégante** : ciel nocturne, étoiles subtiles, mention « Quelque chose de spécial t'attend… », compte à rebours `JJ : HH : MM : SS` vers l'instant cible, mention « Ouverture à 23:59, heure de Bulgarie », bouton de musique uniquement s'il existe une bande-son pour le teaser.
- Après l'heure, débloquer automatiquement l'expérience **sans rechargement** ; si elle arrive plus tard, ouvrir directement l'expérience.
- Garder la même règle quel que soit le pays ou le fuseau de son appareil ; sauvegarder uniquement la préférence de son et éventuellement la progression, jamais l'heure du déverrouillage dans le stockage local.
- **Important :** sur un site purement statique, l'heure du navigateur peut être modifiée et les fichiers statiques restent récupérables avant l'heure. Le blocage côté frontend est donc **cosmétique et non sécurisé**. Pour une vraie confidentialité/embargo du texte et des photos avant 23:59, **ne pas publier les fichiers privés avant l'heure**, ou prévoir une architecture serveur/edge qui refuse de servir tout asset privé et toute page contenant les données jusqu'à l'heure cible, en s'appuyant sur une horloge serveur fiable. La publication programmée au bon moment est la voie la plus simple. Documenter clairement le niveau de protection réellement mis en place.
- Si le projet est développé après l'heure cible ou testé plus tard, prévoir `VITE_PREVIEW_MODE=true` **uniquement en local/development** pour prévisualiser la version ouverte ; ne jamais activer ce mode en production.

## 2. Identité artistique : « une lettre d'amour sous les étoiles »

**Palette :** bleu nuit presque noir `#080C19`, noir bleuté `#111827`, or doux `#E7C98B`, ivoire `#FAF3E7`, rose poudré très discret `#DDA8B5`. Dégradés subtils, reflets lumineux, poussières d'étoiles très légères.

**Typographies :** une serif élégante pour les déclarations/titres (ex. Cormorant Garamond ou Playfair Display) et une sans serif simple et lisible pour les paragraphes (ex. Inter). Polices locales ou chargement optimisé ; pas de texte trop petit.

**Direction :** haut de gamme, émotionnelle, calme, intime et cinématographique. Ne pas surcharger de cœurs flottants ni de gifs. Utiliser le vide, le rythme, les silences visuels, des fondus, de la profondeur et quelques effets spectaculaires réservés aux moments clés.

**Adaptation mobile prioritaire :** cible iPhone/Android, largeur 320–430 px, avec version desktop harmonieuse. Utiliser `100dvh`, safe-area insets, écrans tactiles, images optimisées et animations performantes.

## 3. Scénario détaillé (ordre narratif)

### Acte 0 — La porte fermée (avant 23:59 Sofia)

- Fond presque noir, étoiles animées lentement, lueur de lune subtile.
- Phrase centrale : « Il y a quelque chose que je voulais te dire… Mais pas tout de suite. ♡ »
- Décompte chic, discret et lisible. À zéro, une étoile filante traverse l'écran, fondu vers l'acte 1.

### Acte 1 — « Tu pensais que j'avais oublié ? » (entrée)

- Écran plein, fond nuit étoilée, lumière au centre et court texte qui se révèle caractère par caractère ou mot par mot, sans effet machine à écrire interminable.
- Suggestion de texte **uniquement si cohérente avec `message.txt`** : « Tu pensais peut-être que j'avais oublié… » ; privilégier les vraies phrases du fichier.
- Un bouton clair : **« Découvrir ce que j'ai gardé pour toi ♡ »**. Le clic marque le début volontaire de l'expérience et permet d'activer l'audio conformément aux règles des navigateurs.
- Une petite indication « Fais défiler doucement ↓ » et un contrôle « Musique : activée / coupée ».

### Acte 2 — Le mystère et la réponse

- Longue section immersive à **scroll narratif** : quelques phrases du message apparaissent successivement au centre (opacity, blur léger, translateY), la phrase précédente s'éloigne puis la suivante entre.
- Utiliser éventuellement un **pinned section** GSAP ScrollTrigger : scène fixe pendant que le scroll déroule 3–5 moments. Garder un échappatoire normal sur mobile et éviter tout scroll-jacking.
- Progression émotionnelle : doute → attente → « non, je n'ai pas oublié » → raison de cette surprise.
- Le texte doit être **extrait de `message.txt`**, sans changer le sens, sans supprimer les formulations personnelles ni réécrire arbitrairement la déclaration.

### Acte 3 — « Elle, à travers mes yeux » (ses photos)

- Galerie éditoriale artistique alimentée par `./images/hers/` : portraits plein écran, transitions lentes, cadres Polaroid très discrets ou passe-partout élégants ; légère parallaxe.
- Alterner des photos verticales avec de petites phrases tirées du message ; affichage lent et respectueux, jamais un diaporama agressif.
- Un effet par moment : fond qui s'assombrit derrière le portrait, liseré or, légende douce (« Ce sourire… » uniquement s'il correspond au message ; sinon aucun faux souvenir).
- Permettre de toucher une photo pour l'agrandir (lightbox accessible), et de fermer aisément.

### Acte 4 — « Nous » (nos photos ensemble)

- Section plus chaleureuse, constellation de souvenirs : photos de `./images/together/` disposées en composition éditoriale, révélées au scroll.
- Proposer un fil lumineux fin qui relie quelques images, comme les pages d'un album. Sur desktop, mise en scène avec profondeur légère ; sur mobile, timeline verticale, sans chevauchements.
- Créer un moment fort où 2–3 images de couple apparaissent en séquence avec une grande déclaration de `message.txt`.
- **Ne pas inventer** de dates/captions ; si métadonnées de dates fiables disponibles, ne pas les afficher automatiquement sans nécessité.

### Acte 5 — « Ce que je veux vraiment te dire » (message intégral)

- C'est le cœur du site. **Tout le message de `./message.txt` doit être lisible**, dans son ordre exact. L'effet visuel ne doit jamais masquer, tronquer, réordonner, dupliquer ou supprimer des paragraphes.
- Construire une présentation **progressive au scroll** : paragraphes par paragraphes, avec apparition lente (`opacity`, `transform`, éventuellement blur très léger) et accents visuels sur certaines phrases importantes. Ne pas ralentir au point que le long texte devienne pénible à lire.
- Mettre en valeur les paragraphes avec une largeur de lecture confortable (max 60–70 caractères), line-height 1.65–1.85, beaucoup d'air, contraste suffisant.
- Si des extraits ont déjà été montrés dans les actes 1–4, **conserver quand même le texte intégral dans l'acte 5** ; les extraits sont des aperçus, pas un remplacement.
- Prévoir bouton **« Lire tout le message »** en mode lecture simple (sans animations, scrolling naturel) pour accessibilité et confort.
- Ne pas convertir automatiquement les retours de ligne en une seule masse : respecter paragraphes et ponctuation d'origine ; conserver les expressions affectives et surnoms (notamment « Tütüş » si présents).
- Le message est la star : aucun effet ne doit concurrencer sa lecture.

### Acte 6 — Grand final : « Happy Birthday, My Tütüş »

- À la fin du message, apparition d'un grand ciel étoilé ; les points lumineux convergent en **un cœur ou une constellation** (CSS/canvas léger selon performances).
- Apparition de la déclaration finale : **« Joyeux anniversaire, mon amour. ❤️ »** et, si pertinent, « Happy Birthday, My Tütüş ».
- Transition vers une belle photo de couple en fond/portrait, choisie automatiquement avec un recadrage soigné, en évitant de masquer les visages par le texte.
- Ajouter **« Une dernière chose… »** : clic → dévoile un dernier fragment affectueux issu du message si approprié, sinon une simple phrase sobre (« Je t'aime. Aujourd'hui, demain, et tous les jours. »). Pas de faux engagement ni d'anecdote fabriquée.
- Bouton **« Revoir notre histoire ♡ »** qui remonte tout en haut sans perdre le contrôle audio.

## 4. Gestion réelle de `message.txt`

1. Lire `./message.txt` dès le début du travail et inspecter l'encodage (`UTF-8`, accents, caractères turcs/arabe possibles).
2. Ne pas recopier manuellement le message dans le code ; prévoir un chargement à partir d'un fichier inclus au build, ou génération locale d'un module de contenu. En production, ne pas le récupérer avant l'heure si un véritable embargo est requis.
3. Séparer sur les paragraphes/retours de ligne **sans supprimer le texte original** ; si des titres/extraits d'ouverture sont choisis, ils viennent du fichier quand possible.
4. S'il est très long, conserver une navigation fluide, des reveal simples pour le corps du texte, et un mode lecture sans animation.
5. Tester les caractères spéciaux, apostrophes, emojis, retours de ligne et l'intégralité du contenu affiché.
6. Jamais de correction orthographique automatique : le texte est personnel ; proposer des modifications seulement si elles sont explicitement demandées.

## 5. Gestion des photos

1. Lire l'inventaire réel des fichiers sous `./images/hers/` et `./images/together/` (jpg/jpeg/png/webp/heic si possible). **Ne pas supposer le nombre ni les noms**.
2. Préparer un script d'import local qui détecte les images, génère un manifeste typé, convertit les formats incompatibles (HEIC si outils disponibles) et produit des variantes WebP/AVIF + tailles adaptées si possible. Conserver les originaux hors du bundle de prod.
3. Optimiser sans dégrader les visages, préserver le ratio, éviter les recadrages sévères ; permettre un réglage `object-position` photo par photo via un manifeste.
4. Varier les images entre les actes ; éviter les doublons involontaires et les collages trop chargés.
5. Charger en priorité uniquement l'image d'accueil, puis lazy-load les autres ; utiliser `srcset`, `sizes`, dimensions explicites pour prévenir le layout shift.
6. Ajouter de beaux placeholders pendant le chargement et une gestion propre en cas d'image manquante.
7. Ne pas intégrer de services tiers d'analytics, traqueurs, reconnaissance faciale ni upload des images.
8. Confidentialité : éviter d'exposer de données EXIF/GPS, retirer les métadonnées lors des conversions, et prévenir dans le README que des URL publiques donnent accès aux images déployées.

## 6. Musique et sons

- Prévoir une **vraie bande-son** si un fichier local (ex. `./public/audio/romantic.mp3`) est présent. **Ne pas utiliser de morceau protégé provenant d'une source pirate** et ne pas intégrer de streaming tiers sans demande.
- Au clic sur « Découvrir… », démarrer la musique en douceur avec un fade-in de 2–3 secondes ; volume initial modéré (`0.25–0.4`). Si le navigateur bloque la lecture, garder un bouton Play accessible et ne pas présenter cela comme une erreur.
- Bouton persistant et discret avec icône, état réel play/pause ; respecter son choix lors du scroll, pas de redémarrage à chaque section.
- Fondu musical au grand final si un effet de transition est implémenté. Ne pas chercher à synchroniser précisément chaque phrase sur le morceau car la vitesse de scroll varie.
- Si aucun fichier audio n'existe : site pleinement fonctionnel, bouton « Ajouter une musique » non affiché pour la visiteuse, et consigne simple dans le README pour ajouter le MP3 ultérieurement.
- Jamais d'autoplay sonore forcé à l'ouverture de page.

## 7. Animations, techniques et garde-fous

**Stack préférée :** Vite + Vue 3 + TypeScript + GSAP + ScrollTrigger, CSS moderne. Three.js **uniquement si** un effet 3D apporte une valeur claire et reste fluide sur mobile. Pas de backend nécessaire pour une simple publication différée ; backend/edge uniquement pour un véritable blocage d'accès avant l'ouverture.

**Animations souhaitées :**

- ciel étoilé avec déplacement très lent et une ou deux étoiles filantes occasionnelles ;
- reveal au scroll par phrase/paragraphes (`opacity`, `translateY`, légère variation de blur) ;
- passages « plein écran » ponctuels, sans casser le scroll natif ;
- parallax très léger derrière les images ;
- transitions crossfade entre chapitres ;
- particules convergentes en constellation/cœur final ;
- barre de progression narrative fine, discrète ;
- boutons avec micro-interactions douces, retour tactile clair.

**Ne pas faire :** scroll horizontal involontaire, animations déclenchées en boucle qui donnent la nausée, écran blanc pendant chargement, texte illisible sur photo, cœur/pétales partout, intro impossible à passer, piège de scroll, textes révélés trop lentement.

**Performance :** viser 60 fps quand possible ; utiliser `transform`/`opacity`, limiter le canvas et le nombre de particules, désactiver les animations lourdes sur appareils modestes, préserver l'autonomie, détruire proprement les instances GSAP, éviter les watchers inutiles.

**Accessibilité :** support de `prefers-reduced-motion`, navigation clavier, boutons avec labels, contraste correct, alternative non animée pour le message, audio contrôlable et images avec alt adaptés (sans prétendre décrire des détails qu'on ignore).

## 8. Architecture proposée

Adapter au projet existant s'il y a déjà une base. Sinon initialiser :

```text
.
├── message.txt                    # source existante, ne pas réécrire
├── images/
│   ├── hers/                      # source existante
│   └── together/                  # source existante
├── scripts/
│   └── prepare-assets.mjs         # optimise / inventorie les photos
├── public/
│   ├── audio/                     # fichier local facultatif
│   └── optimized/                 # images générées par script
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── CountdownGate.vue
│   │   ├── NightSky.vue
│   │   ├── MusicControl.vue
│   │   ├── ScrollRevealText.vue
│   │   ├── PhotoPortraits.vue
│   │   ├── TogetherMemories.vue
│   │   ├── LoveLetter.vue
│   │   ├── GrandFinal.vue
│   │   └── PhotoLightbox.vue
│   ├── composables/
│   │   ├── useUnlockTime.ts
│   │   ├── useMusic.ts
│   │   └── useReducedMotion.ts
│   ├── data/
│   │   ├── message.ts             # généré depuis message.txt, pas de copie manuelle
│   │   └── photos.ts              # généré depuis les dossiers images
│   ├── styles/
│   ├── App.vue
│   └── main.ts
├── tests/
├── .env.example
├── README.md
└── package.json
```

Utiliser une structure cohérente avec les besoins réels plutôt que multiplier inutilement les abstractions.

## 9. Ordre de réalisation demandé à Codex

1. **Analyser les sources** : existence et contenu de `message.txt`, nombre/formats/dimensions des photos, présence éventuelle de musique, structure actuelle du projet.
2. Construire un **plan d'extraction du texte** : introduction, 2–4 phrases fortes et chapitres **sans modifier** le message intégral.
3. Installer/configurer Vue 3 + Vite + TypeScript et les dépendances justifiées.
4. Implémenter le **gate 23:59 Europe/Sofia** + compte à rebours et tests de fuseaux horaires.
5. Implémenter la scène d'introduction, le scroll narratif et le mode lecture complet.
6. Générer le manifeste photos et intégrer les deux galeries, au moins une scène portrait et une scène couple.
7. Ajouter la musique facultative, son contrôle et les transitions du final.
8. Faire une passe de **direction artistique** : typographie, rythme, espacements, mobile, recadrage des visages, palette, détails subtils.
9. Tester build, responsive, lecteur audio, clavier, reduced-motion, chargement photos et compte à rebours.
10. Produire un `README.md` clair : commandes pour lancer et construire, où ajouter une musique, comment tester avant l'heure, comment déployer, **limitations de sécurité du gate**.

**Ne pas s'arrêter à un prototype.** Produire les fichiers effectifs, effectuer le build et corriger les erreurs trouvées. Si les assets ne sont pas présents dans l'environnement de Codex, réaliser le site avec des états de repli clairs et signaler les fichiers manquants sans inventer des images/photos de la copine.

## 10. Critères d'acceptation vérifiables

- [ ] Avant le **08/10/2026 23:59 Sofia**, teaser et compte à rebours seulement ; à/près de 23:59, expérience visible et transition automatique.
- [ ] Même instant d'ouverture pour téléphone français, bulgare et dans un autre fuseau ; tests avec horloge simulée.
- [ ] Le fonctionnement et les limites de sécurité du verrou sont expliqués honnêtement.
- [ ] `message.txt` est utilisé comme source et **100 % de ses paragraphes** sont accessibles en lecture, dans le bon ordre.
- [ ] Les photos de `images/hers` et `images/together` sont réellement exploitées dans **deux mises en scène différentes**, sans liens cassés et sans recadrage désagréable.
- [ ] Scroll narratif fluide, non bloquant et agréable sur mobile ; mode lecture simple disponible.
- [ ] Musique facultative activable après interaction ; aucun son forcé, contrôle persistant et fiable.
- [ ] Finale émotionnelle, soignée et avec bouton de relecture.
- [ ] Responsive : 320 px, 375 px, 430 px, tablette et desktop ; sans défilement horizontal.
- [ ] Accessibilité minimale, `prefers-reduced-motion` et contrôle clavier.
- [ ] Images optimisées, chargement progressif, pas d'erreurs fatales si l'audio est absent.
- [ ] `npm run build` réussit, tests essentiels passent et aucune erreur console bloquante.

## 11. Priorités si le temps de développement est limité

**P0 :** ouverture programmée, message complet et fidèle, belles photos, expérience responsive, lisibilité, déploiement fonctionnel.

**P1 :** scroll narratif sophistiqué, direction artistique cinématographique, musique avec contrôle, grand final.

**P2 :** constellation animée avancée, transitions 3D complexes, micro-interactions supplémentaires.

**Instruction finale à l'agent :** prends des décisions de design ambitieuses mais garde toujours une priorité : **elle doit pouvoir lire tous mes mots, voir ses photos et nos photos, sentir que ce site a été conçu uniquement pour elle, et arriver jusqu'à une fin qui lui restera en mémoire**.
