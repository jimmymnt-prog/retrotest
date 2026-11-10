(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const video = $('game');
  const inputMode = $('input-mode');
  const phoneOption = inputMode.querySelector('option[value="phone"]');
  const invite = new URLSearchParams(location.hash.slice(1));
  const code = invite.get('code'), token = invite.get('token');
  const layouts = {
    segaMD: [['z',1,'A'],['x',0,'B'],['c',8,'C'],['a',10,'X'],['s',9,'Y'],['d',11,'Z']],
    nes: [['z',0,'B'],['x',8,'A']],
    snes: [['z',0,'B'],['x',8,'A'],['c',1,'Y'],['v',9,'X'],['a',10,'L'],['s',11,'R']],
    psx: [['z',0,'×'],['x',8,'○'],['c',1,'□'],['v',9,'△'],['a',10,'L1'],['s',11,'R1'],['q',12,'L2'],['w',13,'R2']],
    n64: [['z',1,'B'],['x',0,'A'],['i',23,'C↑'],['j',21,'C←'],['k',22,'C↓'],['l',20,'C→'],['a',10,'L'],['s',11,'R'],['d',12,'Z']],
    segaMS: [['z',0,'1'],['x',8,'2']]
  };
  const physical = {
    segaMD: [1,0,8,9,10,11], nes: [0,8], snes: [0,8,1,9,10,11],
    psx: [0,8,1,9,10,11,12,13], n64: [0,1,21,23,10,11,12,20], segaMS: [0,8]
  };
  let socket, peer, iceServers = [], joined = false, gameReady = false, watching = false;
  let core = '', keyMap = new Map(), held = new Set(), timer, lastReply = 0, error = '';
  const status = message => { $('status').textContent = message; };
  function send(data) {
    if (socket?.readyState === WebSocket.OPEN && socket.bufferedAmount < 16384) socket.send(JSON.stringify(data));
  }
  function configure(coreName) {
    core = ['segaCD', 'sega32x'].includes(coreName) ? 'segaMD' : coreName;
    const keys = layouts[core] || layouts.snes;
    const arrows = core === 'n64' ? [19,18,17,16] : [4,5,6,7];
    keyMap = new Map(keys.map(([key, id]) => [key, id]));
    ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].forEach((key, index) => keyMap.set(key, arrows[index]));
    if (core !== 'segaMS') keyMap.set('Enter', 3);
    if (!['segaMS', 'n64'].includes(core)) keyMap.set('Shift', 2);
    held.clear();
    const system = core === 'segaMS' ? '' : core === 'n64' ? ' · Entrée Start' : ' · Entrée Start · Maj ' + (core === 'segaMD' ? 'Mode' : 'Select');
    $('keys').textContent = 'Flèches pour se déplacer · ' + keys.map(([key, , label]) => key.toUpperCase() + ' = ' + label).join(' · ') + system + '. Manette physique compatible également.';
  }
  function gamepadInputs() {
    let pad;
    try { pad = Array.from(navigator.getGamepads?.() || []).find(item => item?.mapping === 'standard'); } catch (_) {}
    if (!pad) return [];
    const inputs = [];
    const map = physical[core] || physical.snes;
    map.forEach((id, index) => { if (pad.buttons[index]?.pressed) inputs.push(id); });
    if (core !== 'segaMS' && pad.buttons[9]?.pressed) inputs.push(3);
    if (!['segaMS','n64'].includes(core) && pad.buttons[8]?.pressed) inputs.push(2);
    [4,5,6,7].forEach((id,index) => { if (pad.buttons[12 + index]?.pressed) inputs.push(id); });
    const directions = core === 'n64' ? [19,18,17,16] : [4,5,6,7];
    const [x,y] = pad.axes;
    if (y < -.35) inputs.push(directions[0]);
    if (y > .35) inputs.push(directions[1]);
    if (x < -.35) inputs.push(directions[2]);
    if (x > .35) inputs.push(directions[3]);
    if (core === 'n64') {
      const [, , rightX, rightY] = pad.axes;
      if (rightY < -.35) inputs.push(23);
      if (rightY > .35) inputs.push(22);
      if (rightX < -.35) inputs.push(21);
      if (rightX > .35) inputs.push(20);
    }
    return inputs;
  }
  function sendInputs() {
    if (!joined || inputMode.value !== 'local') return;
    const enabled = watching && gameReady && !document.hidden && document.hasFocus();
    const buttons = enabled ? [...new Set([...held].map(key => keyMap.get(key)).concat(gamepadInputs()))] : [];
    send({ type: 'state', buttons });
  }
  function release() {
    held.clear();
    if (joined) send({ type: 'state', buttons: [] });
  }
  function resetPhonePairing() {
    $('phone-pairing').hidden = true;
    $('phone-link').hidden = true;
    $('phone-link').removeAttribute('href');
    $('phone-qr').replaceChildren();
  }
  function setPhoneStatus(connected) {
    $('phone-status').textContent = connected
      ? 'Téléphone connecté · Joueur 2'
      : 'Scannez ce QR code avec le téléphone qui servira de manette J2.';
    $('phone-qr').hidden = connected;
    $('phone-link').hidden = connected || !$('phone-link').hasAttribute('href');
  }
  inputMode.onchange = () => {
    release();
    if (inputMode.value === 'phone') {
      $('phone-pairing').hidden = false;
      $('phone-status').textContent = 'Création du QR code…';
      send({ type: 'online_phone_enable' });
    } else {
      send({ type: 'online_phone_disable' });
      resetPhonePairing();
    }
    inputMode.blur();
  };
  function waitForIce(connection) {
    return new Promise(resolve => {
      function finish() {
        clearTimeout(timeout);
        connection.removeEventListener('icegatheringstatechange', changed);
        resolve();
      }
      function changed() { if (connection.iceGatheringState === 'complete') finish(); }
      const timeout = setTimeout(finish, 8000);
      connection.addEventListener('icegatheringstatechange', changed);
      changed();
    });
  }
  async function answer(sdp) {
    peer?.close();
    let current;
    try {
      current = new RTCPeerConnection({ iceServers }); peer = current;
      const stream = new MediaStream();
      video.srcObject = stream;
      current.ontrack = event => {
        stream.addTrack(event.track);
        if (event.track.kind === 'audio') $('sound').disabled = false;
        video.play().catch(() => status('Cliquez sur la vidéo pour la lire.'));
      };
      current.onconnectionstatechange = () => {
        if (peer !== current) return;
        if (current.connectionState === 'connected') {
          watching = true;
          status('Connecté · J2');
        }
        if (['failed','disconnected'].includes(current.connectionState)) {
          watching = false; release();
          error = 'Connexion vidéo interrompue. Réessayez de rejoindre la partie.';
          socket?.close();
        }
      };
      await current.setRemoteDescription({ type: 'offer', sdp });
      await current.setLocalDescription(await current.createAnswer());
      await waitForIce(current);
      if (peer === current) send({ type: 'online_signal', kind: 'answer', sdp: current.localDescription.sdp });
    } catch (_) {
      if (!current || peer === current) {
        error = 'Impossible de démarrer la vidéo. Réessayez.';
        socket?.close();
      }
    }
  }
  function join() {
    release();
    const previous = socket; socket = null; previous?.close();
    peer?.close(); peer = null; video.srcObject = null;
    watching = joined = gameReady = false; error = ''; clearInterval(timer);
    inputMode.value = 'local'; inputMode.disabled = true; phoneOption.disabled = true;
    resetPhonePairing();
    $('join').disabled = true; $('sound').disabled = true; $('fullscreen').disabled = true;
    status('Connexion à la partie…');
    const url = new URL('/ws', location.href); url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    const current = new WebSocket(url); socket = current; lastReply = Date.now();
    const videoDeadline = Date.now() + 35000;
    current.onopen = () => {
      if (socket === current) send({ type: 'join_online', code, token });
    };
    current.onmessage = event => {
      if (socket !== current) return;
      let data; try { data = JSON.parse(event.data); } catch (_) { return; }
      lastReply = Date.now();
      if (data.type === 'joined') joined = data.player === 2;
      if (data.type === 'online_ready') {
        iceServers = data.iceServers;
        inputMode.disabled = false; phoneOption.disabled = data.phone !== true;
        status('Réception de la vidéo…');
      }
      if (data.type === 'online_phone_pairing' && inputMode.value === 'phone') {
        const link = new URL('/', location.origin);
        link.hash = new URLSearchParams({ code, phone: data.token }).toString();
        $('phone-link').href = link.href;
        if (window.qrcode) {
          const qr = window.qrcode(0, 'M');
          qr.addData(link.href); qr.make();
          $('phone-qr').innerHTML = qr.createSvgTag({ cellSize: 4, margin: 16, scalable: true });
          const svg = $('phone-qr').querySelector('svg');
          svg.setAttribute('role', 'img');
          svg.setAttribute('aria-label', 'QR code de la manette téléphone J2');
        }
        setPhoneStatus(data.connected);
      }
      if (data.type === 'online_phone_status' && inputMode.value === 'phone') setPhoneStatus(data.connected);
      if (data.type === 'online_signal' && data.kind === 'offer') answer(data.sdp);
      if (data.type === 'info') {
        if (core !== data.core) configure(data.core);
        gameReady = data.ready === true;
        $('game-title').textContent = data.title;
      }
      if (data.type === 'error') { error = data.message; current.close(); }
    };
    current.onclose = () => {
      if (socket !== current) return;
      clearInterval(timer); release(); joined = watching = false;
      inputMode.disabled = true; inputMode.value = 'local'; resetPhonePairing();
      peer?.close(); peer = null; video.srcObject = null;
      $('join').disabled = false; $('join').textContent = 'Réessayer';
      $('sound').disabled = true; $('fullscreen').disabled = true;
      status(error || 'Connexion fermée. Vous pouvez réessayer avec ce lien.');
    };
    let ticks = 0;
    timer = setInterval(() => {
      if (!watching && Date.now() > videoDeadline) {
        error = 'La connexion vidéo n’a pas démarré. Réessayez de rejoindre la partie.';
        current.close();
        return;
      }
      if (Date.now() - lastReply > 25000) { current.close(); return; }
      sendInputs();
      if (++ticks % 10 === 0 && joined) send({ type: 'ping' });
    }, 100);
  }
  const keyName = event => event.key.length === 1 ? event.key.toLowerCase() : event.key;
  window.addEventListener('keydown', event => {
    const key = keyName(event);
    if (!watching || !gameReady || inputMode.value !== 'local' || event.ctrlKey || event.metaKey || event.altKey || !keyMap.has(key)) return;
    if (event.target === inputMode) return;
    if (event.key === 'Enter' && event.target instanceof HTMLButtonElement && !event.target.disabled) return;
    event.preventDefault(); held.add(key); sendInputs();
  });
  window.addEventListener('keyup', event => { if (held.delete(keyName(event))) sendInputs(); });
  window.addEventListener('blur', release);
  document.addEventListener('visibilitychange', release);
  window.addEventListener('pagehide', () => { release(); socket?.close(); peer?.close(); });
  video.addEventListener('playing', () => { $('fullscreen').disabled = !video.requestFullscreen; });
  video.onclick = () => { video.play().catch(() => {}); };
  $('sound').onclick = () => {
    video.muted = !video.muted;
    $('sound').textContent = video.muted ? 'Activer le son' : 'Couper le son';
    $('sound').blur();
  };
  $('fullscreen').onclick = () => video.requestFullscreen().catch(() => {});
  $('join').onclick = join;
  if (!/^\d{6}$/.test(code || '') || !/^[A-Za-z0-9_-]{32}$/.test(token || '') || !window.RTCPeerConnection) {
    $('join').disabled = true;
    status('Ouvrez un lien d’invitation RetroTest valide dans un navigateur compatible.');
  }
})();
