# 100 Offline Games — Multi-Console Web

Cette version conserve les 100 jeux Mega Drive intégrés et ajoute le chargement de ROMs locales depuis le PC.

## Consoles prises en charge

- Mega Drive / Genesis : .md, .gen, .bin (choix manuel recommandé pour .bin)
- Master System : .sms
- Game Gear : .gg
- NES : .nes
- Super Nintendo / SNES : .sfc, .smc
- Game Boy / Game Boy Color : .gb, .gbc
- Game Boy Advance : .gba
- Nintendo 64 : .z64, .n64, .v64
- PlayStation 1 : .chd ou archive .zip/.7z contenant les fichiers du disque

## Charger un jeu depuis le PC

1. Ouvrir le site.
2. Cliquer sur **+ Charger un jeu depuis le PC**.
3. Choisir la console ou laisser la détection automatique.
4. Choisir/glisser la ROM.
5. Cliquer sur **Lancer le jeu**.

Le fichier reste dans le navigateur : il n'est pas téléversé sur Vercel.

### Cas PS1

Pour un jeu composé d'un `.cue` et de plusieurs `.bin`, placez-les ensemble dans un ZIP et sélectionnez **PlayStation 1** manuellement avant de lancer le ZIP. Un `.chd` peut être ouvert directement. Selon les jeux, un BIOS peut être requis et certains très gros titres peuvent dépasser les limites mémoire du navigateur.

## EmulatorJS

Les cœurs multi-consoles sont chargés depuis le CDN stable officiel d'EmulatorJS :
`https://cdn.emulatorjs.org/stable/data/`

Cela évite de stocker plusieurs centaines de Mo de cœurs dans GitHub/Vercel. Une connexion Internet est donc nécessaire pour initialiser les cœurs EmulatorJS. Les 100 ROMs Mega Drive restent dans le dépôt.

## Déploiement Vercel

Projet statique :
- Framework Preset : Other
- Build Command : vide
- Output Directory : vide
- `index.html` doit être à la racine du dépôt

## Ajouter des jeux intégrés

Pour ajouter un jeu permanent au catalogue, ajoutez la ROM dans `games/`, la jaquette dans `images/`, puis ajoutez une entrée dans `js/popup.js` dans le tableau `GAMES`.

N'hébergez que des ROMs et BIOS que vous êtes autorisé à utiliser/distribuer.

## V3 — Mode Performance

Cette version optimise automatiquement les consoles les plus lourdes :

- **PS1** : cœur `pcsx_rearmed` (cœur PS1 par défaut performant d’EmulatorJS).
- **Nintendo 64** : `mupen64plus_next` avec WebGL2 quand disponible ; repli vers `parallel-n64` sur navigateur limité.
- **Threads WebAssembly** : activés automatiquement pour PS1/N64 quand `SharedArrayBuffer` est disponible.
- **Vercel** : `vercel.json` envoie COOP/COEP, nécessaires aux threads.
- **ROM locale** : le navigateur transmet désormais directement l’objet `File` à EmulatorJS afin d’éviter une copie mémoire supplémentaire, surtout utile pour les gros jeux PS1/N64.
- **Consoles 8/16/32 bits légères** : les cœurs rapides par défaut sont conservés, sans overhead de threads inutile.

### GameCube

GameCube n’est **pas activé dans cette version**. Le cœur Dolphin n’est pas actuellement exploitable de façon performante dans EmulatorJS/WebAssembly. Ajouter un bouton GameCube donnerait une expérience extrêmement lente plutôt qu’une console réellement jouable. Une future version pourra l’ajouter si un cœur Web performant devient viable.

### Vérifier que les threads fonctionnent sur Vercel

Ouvrez le site déployé dans Chrome/Edge puis la console développeur :

```js
crossOriginIsolated
```

La valeur doit être `true`. Si elle est `false`, redéployez après avoir vérifié que `vercel.json` est bien à la racine du dépôt.
