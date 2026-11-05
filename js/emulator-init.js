'use strict';
window.addEventListener('message', function (e) {
  const data = e.data;
  if (!data || data.type !== 'launch') return;

  // EmulatorJS accepts File objects directly. This avoids an extra full ROM copy
  // for large local PS1/N64 files and reduces memory pressure.
  let gameSource;
  if (data.gameFile instanceof File || data.gameFile instanceof Blob) {
    gameSource = data.gameFile;
  } else {
    const blob = new Blob([data.romBuffer], { type: data.mimeType || 'application/octet-stream' });
    gameSource = URL.createObjectURL(blob);
  }

  window.EJS_player = '#game';
  window.EJS_core = data.core;
  window.EJS_gameUrl = gameSource;
  window.EJS_gameName = data.romName;
  window.EJS_pathtodata = data.pathToData;
  window.EJS_startOnLoaded = true;
  window.EJS_fullscreenOnLoad = false;
  window.EJS_disableAutoLang = false;

  const reportProgress = (progress, status) => {
    try { parent.postMessage({type:'emu-progress', progress, status}, '*'); } catch (_) {}
  };
  reportProgress(70, 'Chargement du cœur d’émulation…');
  window.EJS_ready = () => reportProgress(90, 'Émulateur prêt · lancement du jeu…');
  window.EJS_onGameStart = () => reportProgress(100, 'Jeu démarré');

  // Performance profile. Threads only work when COOP/COEP expose SharedArrayBuffer.
  window.EJS_threads = !!data.useThreads && self.crossOriginIsolated && typeof SharedArrayBuffer !== 'undefined';
  window.EJS_forceLegacyCores = !!data.forceLegacy;

  // Keep expensive extras off by default; users can still change core settings.
  window.EJS_Buttons = {
    restart:true, playPause:true, mute:true, settings:true,
    saveState:true, loadState:true, fullscreen:true, enterFullscreen:true,
    exitFullscreen:true, gamepad:true, volumeSlider:true,
    saveSavFiles:true, loadSavFiles:true, quickSave:true, quickLoad:true,
    screenshot:true, cacheManager:false, cheat:false, netplay:false,
    diskButton:true, rightClick:false
  };

  const script = document.createElement('script');
  script.src = data.pathToData + 'loader.js';
  script.crossOrigin = 'anonymous';
  script.onerror = () => {
    document.body.innerHTML = '<div style="color:white;padding:30px;font-family:sans-serif">Impossible de charger EmulatorJS. Vérifiez la connexion Internet et les en-têtes COOP/COEP.</div>';
  };
  script.onload = () => reportProgress(82, 'Cœur chargé · initialisation…');
  document.body.appendChild(script);
}, { once:true });
