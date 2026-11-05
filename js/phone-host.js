/* Téléphone → EmulatorJS. Les commandes passent par WebRTC, joueur 1. */
(() => {
  'use strict';
  const frame = document.getElementById('emu-frame');
  const bar = document.getElementById('emu-bar');
  if (!frame || !bar) return;
  const button = document.createElement('button');
  button.id = 'phone-play'; button.type = 'button';
  button.textContent = '📱 Jouer avec mon téléphone';
  bar.insertBefore(button, document.getElementById('perf-badge'));
  const modal = document.createElement('dialog');
  modal.id = 'phone-dialog';
  modal.innerHTML = `<button type="button" id="phone-close" aria-label="Fermer">×</button><h2>Votre téléphone devient la manette</h2><p>Scannez ce QR code avec l’appareil photo du téléphone.</p><div id="phone-qr"></div><p id="phone-status" role="status"></p><input id="phone-link" readonly aria-label="Lien de la manette"><p class="phone-note">Gardez le jeu ouvert sur cet ordinateur. Pour une meilleure connexion, utilisez le même Wi-Fi.</p><button type="button" id="phone-new">Nouvelle connexion</button>`;
  document.body.appendChild(modal);
  const status = modal.querySelector('#phone-status');
  const qr = modal.querySelector('#phone-qr');
  const link = modal.querySelector('#phone-link');
  let peer, connection, token, lastSeen = 0, applied = {}, manager, lastInfo = '', opening;
  const setStatus = text => { status.textContent = text; };
  function release() {
    if (manager) for (const key of Object.keys(applied)) {
      try { manager.simulateInput(0, +key, 0); } catch (_) {}
    }
    applied = {};
  }
  function reset() {
    release(); connection?.close(); connection = null;
    peer?.destroy(); peer = null; clearTimeout(opening);
    qr.replaceChildren(); link.value = ''; lastInfo = '';
    button.textContent = '📱 Jouer avec mon téléphone';
  }
  function info() {
    const emu = frame.contentWindow?.EJS_emulator;
    return { type: 'info', core: emu?.getControlScheme?.() || frame.contentWindow?.EJS_core || 'segaMD', title: document.getElementById('emu-title').textContent, ready: !!emu?.gameManager };
  }
  function start() {
    reset();
    if (!window.Peer || !window.qrcode) { setStatus('Fichiers de connexion manquants. Vérifiez le dossier js/vendor.'); return; }
    token = crypto.randomUUID();
    setStatus('Création de la connexion…');
    const current = peer = new Peer(undefined, { debug: 0 });
    opening = setTimeout(() => { if (peer === current && !link.value) setStatus('Le service de connexion ne répond pas. Réessayez.'); }, 15000);
    current.on('open', id => {
      if (peer !== current) return;
      clearTimeout(opening);
      const url = new URL('manette.html', location.href);
      url.hash = new URLSearchParams({ peer: id, token }).toString();
      link.value = url.href;
      const code = qrcode(0, 'M'); code.addData(url.href); code.make();
      qr.innerHTML = code.createSvgTag({ cellSize: 4, margin: 16, scalable: true });
      setStatus('Prêt à scanner · joueur 1');
    });
    current.on('connection', incoming => {
      if (peer !== current || incoming.metadata?.token !== token || connection) {
        incoming.on('open', () => incoming.close()); return;
      }
      connection = incoming;
      incoming.on('open', () => {
        lastSeen = Date.now(); lastInfo = '';
        button.textContent = '📱 Téléphone connecté';
        setStatus('Téléphone connecté ! Vous pouvez fermer cette fenêtre.');
      });
      incoming.on('data', data => {
        if (connection !== incoming || !data || data.type !== 'state' || !Array.isArray(data.buttons) || data.buttons.length > 24) return;
        if (!data.buttons.every(i => Number.isInteger(i) && i >= 0 && i <= 23)) return;
        lastSeen = Date.now();
        const nextManager = frame.contentWindow?.EJS_emulator?.gameManager;
        if (manager !== nextManager) { release(); manager = nextManager; }
        if (!manager) return;
        const next = Object.fromEntries(data.buttons.map(i => [i, i >= 16 ? 32767 : 1]));
        for (const key of new Set([...Object.keys(applied), ...Object.keys(next)])) {
          if ((applied[key] || 0) !== (next[key] || 0)) manager.simulateInput(0, +key, next[key] || 0);
        }
        applied = next;
      });
      const disconnected = () => {
        if (connection !== incoming) return;
        release(); connection = null; button.textContent = '📱 Reconnecter le téléphone';
        setStatus('Téléphone déconnecté. Reconnectez-le ou scannez à nouveau.');
      };
      incoming.on('close', disconnected); incoming.on('error', disconnected);
    });
    current.on('error', () => { if (peer === current) setStatus('Connexion indisponible. Vérifiez Internet et cliquez sur Nouvelle connexion.'); });
    current.on('disconnected', () => { if (peer === current && !connection) setStatus('Service déconnecté. Cliquez sur Nouvelle connexion.'); });
  }
  setInterval(() => {
    if (!connection?.open) return;
    if (Date.now() - lastSeen > 1200) release();
    const details = info(), text = JSON.stringify(details);
    // Ping also lets the phone detect an unresponsive or suspended computer.
    try { connection.send({ type: 'ping' }); if (text !== lastInfo) { connection.send(details); lastInfo = text; } } catch (_) { release(); }
  }, 300);
  button.addEventListener('click', () => { if (!modal.open) modal.showModal(); if (!peer || peer.destroyed) start(); });
  modal.querySelector('#phone-close').onclick = () => modal.close();
  modal.querySelector('#phone-new').onclick = start;
  link.onclick = () => link.select();
  document.getElementById('emu-back').addEventListener('click', () => { reset(); modal.close(); });
  frame.addEventListener('load', () => { release(); manager = null; lastInfo = ''; });
  window.addEventListener('pagehide', reset);
})();
