(() => {
  'use strict';
  const params = new URLSearchParams(location.hash.slice(1));
  const host = params.get('peer'), token = params.get('token');
  const status = document.getElementById('connection-status');
  const line = document.getElementById('connection-line');
  const dpad = document.getElementById('dpad');
  const actions = document.getElementById('action-buttons');
  const center = document.getElementById('center-buttons');
  let peer, connection, timeout, wakeLock, lastPing = 0, ready = false, core = '', direction = [];
  const pointers = new Map();
  const directions = new Map();
  const profiles = {
    segaMD: [['X',10],['Y',9],['Z',11],['A',1],['B',0],['C',8]],
    nes: [['B',0],['A',8]], gb: [['B',0],['A',8]],
    gba: [['L',10],['R',11],['B',0],['A',8]],
    snes: [['L',10],['X',9],['R',11],['Y',1],['B',0],['A',8]],
    psx: [['L1',10],['△',9],['R1',11],['□',1],['×',0],['○',8],['L2',12],['L3',14],['R2',13],['R3',15]],
    n64: [['L',10],['C↑',23],['R',11],['C←',21],['C↓',22],['C→',20],['Z',12],['B',1],['A',0]],
    segaMS: [['1',0],['2',8]], segaGG: [['1',0],['2',8]]
  };
  function setStatus(text, connected = false) { status.textContent = text; line.classList.toggle('connected', connected); }
  function state() { return [...new Set([...pointers.values(), ...direction])]; }
  function send() {
    if (!connection?.open) return;
    try { connection.send({ type: 'state', buttons: ready && !document.hidden ? state() : [] }); } catch (_) {}
  }
  function clear() {
    pointers.clear(); directions.clear(); direction = [];
    document.querySelectorAll('.pressed').forEach(el => el.classList.remove('pressed')); send();
  }
  function makeButton(label, id, target) {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.dataset.input = id;
    b.addEventListener('pointerdown', e => {
      e.preventDefault(); if (!ready) return;
      b.setPointerCapture(e.pointerId); pointers.set(e.pointerId, id); b.classList.add('pressed'); send();
    });
    const end = e => {
      pointers.delete(e.pointerId);
      if (![...pointers.values()].includes(id)) b.classList.remove('pressed');
      send();
    };
    b.addEventListener('pointerup', end); b.addEventListener('pointercancel', end); b.addEventListener('lostpointercapture', end);
    target.appendChild(b);
  }
  function render(next) {
    clear(); core = next;
    actions.replaceChildren(); center.replaceChildren();
    const profile = profiles[core] || profiles.snes;
    profile.forEach(([label, id]) => makeButton(label, id, actions));
    if (!['n64','segaMS','segaGG'].includes(core)) makeButton(core === 'segaMD' ? 'MODE' : 'SELECT', 2, center);
    if (core !== 'segaMS') makeButton('START',3,center);
    document.getElementById('stick-option').hidden = core !== 'n64';
  }
  function updateDirection(e) {
    if (!ready) return;
    const r = dpad.getBoundingClientRect(), x = (e.clientX-r.left)/r.width*2-1, y = (e.clientY-r.top)/r.height*2-1;
    const stick = core === 'n64' && document.getElementById('stick-mode').checked;
    const a = [];
    if (x < -.28) a.push(stick ? 17 : 6);
    if (x > .28) a.push(stick ? 16 : 7);
    if (y < -.28) a.push(stick ? 19 : 4);
    if (y > .28) a.push(stick ? 18 : 5);
    directions.set(e.pointerId, a); applyDirections();
  }
  function applyDirections() {
    direction = [...new Set([...directions.values()].flat())];
    for (const [name, ids] of Object.entries({up:[4,19],down:[5,18],left:[6,17],right:[7,16]})) {
      dpad.querySelector('.'+name).classList.toggle('pressed', ids.some(i => direction.includes(i)));
    }
    send();
  }
  dpad.addEventListener('pointerdown', e => { e.preventDefault(); dpad.setPointerCapture(e.pointerId); updateDirection(e); });
  dpad.addEventListener('pointermove', e => { if (directions.has(e.pointerId)) updateDirection(e); });
  for (const type of ['pointerup','pointercancel','lostpointercapture']) dpad.addEventListener(type, e => { directions.delete(e.pointerId); applyDirections(); });
  document.getElementById('stick-mode').onchange = clear;
  async function keepAwake() {
    try { if (!wakeLock && !document.hidden && connection?.open) { wakeLock = await navigator.wakeLock?.request('screen'); wakeLock?.addEventListener('release', () => { wakeLock = null; }); } } catch (_) {}
  }
  function connect() {
    clear(); ready = false; connection?.close(); connection = null; peer?.destroy(); clearTimeout(timeout);
    if (!host || !token) { setStatus('Ouvrez un jeu sur l’ordinateur puis scannez son QR code.'); return; }
    if (!window.Peer) { setStatus('Le fichier de connexion est manquant.'); return; }
    setStatus('Connexion à votre ordinateur…');
    const current = peer = new Peer(undefined, { debug: 0 });
    timeout = setTimeout(() => { if (peer === current && !connection?.open) setStatus('Connexion impossible. Essayez le même Wi-Fi, puis Reconnecter.'); }, 18000);
    current.on('open', () => {
      if (peer !== current) return;
      const incoming = current.connect(host, { reliable:true, serialization:'json', metadata:{token} });
      connection = incoming;
      incoming.on('open', () => {
        if (connection !== incoming) return;
        clearTimeout(timeout); lastPing = Date.now(); setStatus('Connecté · En attente du jeu…', true); send(); keepAwake();
      });
      incoming.on('data', data => {
        if (connection !== incoming || !data) return;
        lastPing = Date.now();
        if (data.type === 'info') {
          if (core !== data.core) render(data.core);
          ready = !!data.ready;
          document.getElementById('game-name').textContent = data.title || 'Joueur 1';
          setStatus(ready ? 'Connecté · Joueur 1' : 'Connecté · Démarrez le jeu sur l’ordinateur',true);
        }
      });
      const disconnected = () => {
        if (connection !== incoming) return;
        clear(); ready = false; connection = null;
        setStatus('Déconnecté · Appuyez sur Reconnecter ou scannez le nouveau QR code.');
        wakeLock?.release();
      };
      incoming.on('close',disconnected); incoming.on('error',disconnected);
    });
    current.on('error', () => { if (peer === current) { ready = false; clear(); setStatus('Connexion impossible. Vérifiez le Wi-Fi et le QR code puis reconnectez.'); } });
  }
  document.getElementById('reconnect').onclick = connect;
  document.getElementById('fullscreen').onclick = async () => {
    try { if (!document.fullscreenElement) await document.documentElement.requestFullscreen(); else await document.exitFullscreen(); } catch (_) { setStatus('Plein écran indisponible sur ce navigateur. Jouez en paysage.'); }
    keepAwake();
  };
  document.addEventListener('contextmenu',e => e.preventDefault());
  document.addEventListener('visibilitychange',() => { clear(); if (!document.hidden) keepAwake(); });
  window.addEventListener('blur',clear); window.addEventListener('pagehide',() => { clear(); peer?.destroy(); });
  window.addEventListener('orientationchange',clear);
  setInterval(() => {
    if (connection?.open && Date.now()-lastPing > 1800) {
      clear(); ready = false; setStatus('L’ordinateur ne répond plus. Reconnectez la manette.');
    }
    send();
  },100);
  render('segaMD'); connect();
})();
