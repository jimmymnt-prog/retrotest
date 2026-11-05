100 Offline Games — version application web

Lancement local (important):
1. Ne pas ouvrir index.html en double-cliquant (file://), les ROM/WASM peuvent être bloqués.
2. Lancer un petit serveur HTTP dans ce dossier.
   Python: python -m http.server 8080
3. Ouvrir http://localhost:8080/ dans Chrome/Edge.

Pour héberger en ligne, envoyer tout le contenu de ce dossier sur un serveur statique.
Le serveur doit servir les fichiers .wasm correctement (application/wasm).

Modifications effectuées:
- suppression de la dépendance chrome.runtime.getURL
- index.html comme page d'entrée web
- interface adaptée à la taille de la fenêtre
- retrait du bouton de notation Chrome Web Store

Note: les ROM et autres contenus restent soumis à leurs droits/licences respectifs.
