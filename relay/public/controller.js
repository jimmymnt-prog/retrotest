(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const pad = $('pad'), codeInput = $('code'), seat = $('seat');
  let socket, retryTimer, attempts = 0, running = false, joined = false, ready = false;
  let core = '', player = 0, currentCode = '', lastReply = 0, wakeLock, ticks = 0;
  const held = new Map(), directions = new Map(), pointers = new Set();
  const b = (key, label, id, x, y, tone = '') => ({ key, label, id, x, y, tone });
  const profiles = {
    segaMD: { name: 'MEGA DRIVE', sub: '16-BIT CONTROL PAD', caption: 'SIX BUTTON CONTROL',
      actions: [b('x','X',10,18,24), b('y','Y',9,50,18), b('z','Z',11,82,12), b('a','A',1,18,82), b('b','B',0,50,76), b('c','C',8,82,70)], center: [['mode','MODE',2],['start','START',3]] },
    nes: { name: 'NES', sub: 'ENTERTAINMENT SYSTEM', caption: 'CLASSIC CONTROL',
      actions: [b('b','B',0,30,60,'red'),b('a','A',8,78,60,'red')], center: [['select','SELECT',2],['start','START',3]] },
    snes: { name: 'SUPER NINTENDO', sub: 'ENTERTAINMENT SYSTEM', caption: 'SUPER CONTROL PAD',
      actions: [b('y','Y',1,17,50,'green'),b('x','X',9,50,15,'blue'),b('b','B',0,50,85,'yellow'),b('a','A',8,83,50,'red')],
      shoulders: [['l','L',10],['r','R',11]], center: [['select','SELECT',2],['start','START',3]] },
    gb: { name: 'GAME BOY', sub: 'ORIGINAL POCKET CONTROL', caption: 'PORTABLE CLASSIC',
      actions: [b('b','B',0,26,70,'berry'),b('a','A',8,77,40,'berry')], center: [['select','SELECT',2],['start','START',3]] },
    gbc: { name: 'GAME BOY COLOR', sub: 'POCKET CONTROL', caption: 'COLOR EDITION',
      actions: [b('b','B',0,26,70),b('a','A',8,77,40)], center: [['select','SELECT',2],['start','START',3]] },
    gba: { name: 'GAME BOY ADVANCE', sub: 'ADVANCED POCKET CONTROL', caption: 'ADVANCE CONTROL',
      actions: [b('b','B',0,26,70),b('a','A',8,77,40)], shoulders: [['l','L',10],['r','R',11]], center: [['select','SELECT',2],['start','START',3]] },
    psx: { name: 'PLAYSTATION', sub: 'DIGITAL CONTROL PAD', caption: 'ORIGINAL DIGITAL CONTROLLER',
      actions: [b('square','□',1,17,50,'pink-symbol'),b('triangle','△',9,50,15,'green-symbol'),b('cross','×',0,50,85,'blue-symbol'),b('circle','○',8,83,50,'red-symbol')],
      shoulders: [['l2','L2',12],['l1','L1',10],['r2','R2',13],['r1','R1',11]], center: [['select','SELECT',2],['start','START',3]] },
    n64: { name: 'NINTENDO 64', sub: 'THREE GRIP CONTROL', caption: 'STICK · C BUTTONS · Z TRIGGER',
      actions: [b('b','B',1,15,64,'green'),b('a','A',0,39,88,'blue'),b('cu','C↑',23,72,16,'yellow'),b('cl','C←',21,50,42,'yellow'),b('cr','C→',20,94,42,'yellow'),b('cd','C↓',22,72,68,'yellow')],
      shoulders: [['l','L',10],['r','R',11],['z','Z',12]], center: [['start','START',3]] },
    segaMS: { name: 'MASTER SYSTEM', sub: 'CONTROL PAD', caption: '8-BIT CONTROL',
      actions: [b('one','1',0,28,60,'ms-blue'),b('two','2',8,77,60,'ms-blue')], center: [] },
    segaGG: { name: 'GAME GEAR', sub: 'PORTABLE COLOR CONTROL', caption: 'PORTABLE CONTROL',
      actions: [b('one','1',0,28,70,'red'),b('two','2',8,77,40,'red')], center: [['start','START',3]] }
  };
  const aliases = { segaCD: 'segaMD', sega32x: 'segaMD', nds: 'snes' };
  function status(text, ok = false) { $('status').textContent = text; $('status').classList.toggle('connected', ok); }
  function send(value) {
    if (socket?.readyState === WebSocket.OPEN && socket.bufferedAmount < 4096) socket.send(JSON.stringify(value));
  }
  function buttonsNow() { return [...new Set([...held.values(), ...[...directions.values()].flat()])]; }
  function sendState() { if (joined) send({ type: 'state', buttons: ready && !document.hidden ? buttonsNow() : [] }); }
  function paint() {
    const inputs = buttonsNow();
    pad.querySelectorAll('button[data-input]').forEach(button => button.classList.toggle('pressed', inputs.includes(Number(button.dataset.input))));
    for (const [name, ids] of Object.entries({ up:[4,19], down:[5,18], left:[6,17], right:[7,16] })) {
      $('dpad').querySelector('.' + name).classList.toggle('pressed', ids.some(i => inputs.includes(i)));
    }
  }
  function clear() {
    held.clear(); directions.clear(); pointers.clear(); $('knob').style.transform = '';
    paint(); sendState();
  }
  function setReady(value) { ready = value; pad.inert = !ready; pad.classList.toggle('is-ready', ready); if (!ready) clear(); }
  function makeButton(item, target) {
    const button = document.createElement('button');
    const { key, label, id, x, y, tone } = item;
    button.type = 'button'; button.textContent = label;
    button.dataset.key = key; button.dataset.input = id;
    button.setAttribute('aria-label', 'Bouton ' + label);
    if (tone) button.dataset.tone = tone;
    if (x !== undefined) { button.style.left = x + '%'; button.style.top = y + '%'; }
    button.addEventListener('pointerdown', event => {
      event.preventDefault(); if (!ready) return;
      button.setPointerCapture(event.pointerId); pointers.add(event.pointerId); held.set(event.pointerId, id); paint(); sendState(); keepAwake();
    });
    button.addEventListener('pointermove', event => {
      if (!pointers.has(event.pointerId)) return;
      const hit = document.elementFromPoint(event.clientX, event.clientY)?.closest('button[data-input]');
      if (hit && pad.contains(hit)) held.set(event.pointerId, Number(hit.dataset.input));
      else held.delete(event.pointerId);
      paint(); sendState();
    });
    for (const type of ['pointerup','pointercancel','lostpointercapture']) button.addEventListener(type, event => {
      pointers.delete(event.pointerId); held.delete(event.pointerId); paint(); sendState();
    });
    button.addEventListener('keydown', event => {
      if (!ready || !['Space','Enter'].includes(event.code)) return;
      event.preventDefault(); held.set('key:' + key + event.code, id); paint(); sendState();
    });
    button.addEventListener('keyup', event => { held.delete('key:' + key + event.code); paint(); sendState(); });
    target.appendChild(button);
  }
  function render(next) {
    clear(); core = next;
    const theme = profiles[core] ? core : aliases[core] || 'snes';
    const profile = profiles[theme];
    pad.dataset.console = theme; pad.setAttribute('aria-label', 'Manette ' + profile.name);
    $('console-name').textContent = profile.name; $('console-subtitle').textContent = profile.sub;
    $('pad-caption').textContent = profile.caption;
    $('actions').replaceChildren(); $('center-buttons').replaceChildren(); $('shoulders').replaceChildren();
    profile.actions.forEach(item => makeButton(item, $('actions')));
    (profile.center || []).forEach(([key,label,id]) => makeButton({key,label,id}, $('center-buttons')));
    (profile.shoulders || []).forEach(([key,label,id]) => makeButton({key,label,id}, $('shoulders')));
    $('analog').hidden = theme !== 'n64';
    $('control-note').textContent = theme === 'n64'
      ? 'Stick tactile huit directions · Croix et boutons C indépendants.'
      : 'Plusieurs touches peuvent être maintenues en même temps.';
  }
  function setupDirection(element, analog) {
    element.addEventListener('pointerdown', event => {
      event.preventDefault(); if (!ready) return;
      element.setPointerCapture(event.pointerId); update(event); keepAwake();
    });
    function update(event) {
      if (!ready) return;
      const r = element.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (event.clientX-r.left)/r.width*2-1));
      const y = Math.max(-1, Math.min(1, (event.clientY-r.top)/r.height*2-1));
      const a = [];
      if (x < -.28) a.push(analog ? 17 : 6); if (x > .28) a.push(analog ? 16 : 7);
      if (y < -.28) a.push(analog ? 19 : 4); if (y > .28) a.push(analog ? 18 : 5);
      directions.set(event.pointerId, a);
      if (analog) $('knob').style.transform = `translate(${x * 25}px, ${y * 25}px)`;
      paint(); sendState();
    }
    element.addEventListener('pointermove', event => { if (directions.has(event.pointerId)) update(event); });
    for (const type of ['pointerup','pointercancel','lostpointercapture']) element.addEventListener(type, event => {
      directions.delete(event.pointerId); if (analog) $('knob').style.transform = '';
      paint(); sendState();
    });
  }
  setupDirection($('dpad'), false); setupDirection($('analog'), true);
  async function keepAwake() {
    try {
      if (!wakeLock && joined && !document.hidden) {
        wakeLock = await navigator.wakeLock?.request('screen');
        wakeLock?.addEventListener('release', () => { wakeLock = null; });
      }
    } catch (_) {}
  }
  function connect(fresh = true) {
    clearTimeout(retryTimer);
    const code = codeInput.value.replace(/\D/g, ''); codeInput.value = code;
    if (joined && currentCode === code && Number(seat.value) === player && fresh) { $('pairing').open = false; return; }
    clear(); joined = false; setReady(false); player = 0; document.body.dataset.player = '0';
    $('player-badge').textContent = 'HORS LIGNE';
    const previous = socket; socket = null; previous?.close();
    if (!/^\d{6}$/.test(code)) { running = false; status('Saisissez les 6 chiffres affichés sur le PC.'); return; }
    if (fresh) attempts = 0;
    running = true; currentCode = code;
    const url = new URL('/ws', location.href); url.protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const current = new WebSocket(url); socket = current; lastReply = Date.now();
    status('Connexion à la partie…');
    current.onopen = () => {
      if (socket !== current) return;
      lastReply = Date.now(); send({ type:'join', protocol:3, code, player: Number(seat.value) });
    };
    current.onmessage = event => {
      if (socket !== current) return;
      let data; try { data = JSON.parse(event.data); } catch (_) { return; }
      lastReply = Date.now();
      if (data.type === 'joined') {
        const modernRelay = Number(data.protocol) >= 3;
        if (!modernRelay && Number(seat.value) === 2) {
          running = false; status('Le relais actuel accepte J1 seulement. Mettez-le à jour pour connecter J2.');
          $('pairing').open = true; current.close(); return;
        }
        joined = true; attempts = 0; player = modernRelay && data.player === 2 ? 2 : 1;
        seat.value = String(player);
        seat.querySelector('option[value="2"]').disabled = !modernRelay || data.maxPlayers !== 2;
        document.body.dataset.player = String(player);
        $('player-badge').textContent = 'JOUEUR ' + player; $('pad-player').textContent = 'J' + player;
        $('pairing').open = false; status('Connecté · Joueur ' + player + ' · En attente du jeu', true);
        sendState(); keepAwake();
      } else if (data.type === 'info') {
        if (core !== data.core) render(data.core);
        setReady(data.ready === true); $('game-name').textContent = data.title;
        status(ready ? 'Connecté · Joueur ' + player : 'Démarrez le jeu sur le PC', true);
      } else if (data.type === 'roster') {
        seat.querySelector('option[value="2"]').disabled = data.maxPlayers < 2;
      } else if (data.type === 'error') {
        running = false; setReady(false); status(data.message); $('pairing').open = true;
      }
    };
    current.onerror = () => {};
    current.onclose = event => {
      if (socket !== current) return;
      socket = null; joined = false; setReady(false); wakeLock?.release();
      document.body.dataset.player = '0'; $('player-badge').textContent = 'HORS LIGNE';
      if (!running) return;
      if ([1000,1008].includes(event.code)) { running = false; status('Session fermée. Saisissez un nouveau code du PC.'); $('pairing').open = true; }
      else if (attempts++ < 5) {
        status('Connexion perdue · Reconnexion à votre place…');
        retryTimer = setTimeout(() => connect(false), Math.min(15000,1500 * 2 ** attempts));
      } else { status('Relais indisponible. Réessayez avec Connecter.'); $('pairing').open = true; }
    };
  }
  $('pair-form').onsubmit = event => { event.preventDefault(); connect(); };
  $('fullscreen').onclick = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch (_) { status('Le plein écran n’est pas disponible ici. Tournez le téléphone en paysage.'); }
    keepAwake();
  };
  pad.addEventListener('contextmenu', event => event.preventDefault());
  document.addEventListener('visibilitychange', () => { clear(); if (!document.hidden) keepAwake(); });
  window.addEventListener('blur', clear); window.addEventListener('orientationchange', clear);
  window.addEventListener('pagehide', () => { running = false; clearTimeout(retryTimer); clear(); socket?.close(); });
  setInterval(() => {
    if (!joined) return;
    if (Date.now() - lastReply > 5000) { clear(); socket?.close(); return; }
    sendState(); if (++ticks % 10 === 0) send({ type:'ping' });
  }, 100);
  render('segaMD');
  const params = new URLSearchParams(location.search);
  codeInput.value = params.get('code') || '';
  seat.value = ['1','2'].includes(params.get('player')) ? params.get('player') : '0';
  if (/^\d{6}$/.test(codeInput.value)) connect();
})();

