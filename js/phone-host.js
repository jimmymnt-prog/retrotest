(() => {
  'use strict';
  const RELAY_HTTP = 'https://retro-manette.onrender.com';
  const frame = document.getElementById('emu-frame');
  const bar = document.getElementById('emu-bar');
  if (!frame || !bar || window.__retroPhoneHostV3) return;
  window.__retroPhoneHostV3 = true;

  const relayUrl = new URL('/ws', RELAY_HTTP);
  relayUrl.protocol = relayUrl.protocol === 'https:' ? 'wss:' : 'ws:';

  function checkRelay(timeout) {
    return new Promise(resolve => {
      const probe = new WebSocket(relayUrl);
      function finish(ready) {
        clearTimeout(timer);
        probe.onopen = probe.onerror = probe.onclose = null;
        probe.close();
        resolve(ready);
      }
      const timer = setTimeout(() => finish(false), timeout);
      probe.onopen = () => finish(true);
      probe.onerror = probe.onclose = () => finish(false);
    });
  }

  const wakeButton = document.getElementById('render-wake');
  if (wakeButton) {
    wakeButton.onclick = async () => {
      wakeButton.disabled = true;
      wakeButton.dataset.state = 'starting';
      wakeButton.textContent = 'Render démarre…';
      const deadline = Date.now() + 100000;
      try {
        while (Date.now() < deadline) {
          if (await checkRelay(Math.min(15000, deadline - Date.now()))) {
            wakeButton.dataset.state = 'ready';
            wakeButton.textContent = 'Render prêt ✓';
            return;
          }
          const pause = Math.max(0, Math.min(2000, deadline - Date.now()));
          await new Promise(resolve => setTimeout(resolve, pause));
        }
      } catch (_) {
        // Le bouton permet une nouvelle tentative après une erreur de connexion.
      } finally {
        wakeButton.disabled = false;
        if (wakeButton.dataset.state !== 'ready') {
          wakeButton.dataset.state = 'error';
          wakeButton.textContent = 'Réessayer Render';
        }
      }
    };
  }

  const button = document.createElement('button');
  button.id = 'remote-button'; button.type = 'button';
  button.textContent = '📱 Jouer avec mon téléphone';
  bar.insertBefore(button, document.getElementById('perf-badge'));
  const stopShare = document.createElement('button');
  stopShare.id = 'online-stop'; stopShare.type = 'button'; stopShare.hidden = true;
  stopShare.textContent = 'Arrêter le partage';
  bar.insertBefore(stopShare, document.getElementById('perf-badge'));
  const dialog = document.createElement('dialog');
  dialog.id = 'remote-dialog';
  dialog.innerHTML = `
    <button id="remote-close" class="remote-close" type="button" aria-label="Fermer">×</button>
    <p class="remote-eyebrow">MANETTES TÉLÉPHONE</p>
    <h2>À vous de jouer.</h2>
    <p class="remote-intro">Un téléphone par joueur. Scannez le QR code ou ouvrez le lien et saisissez le code.</p>
    <section class="online-invitation" aria-label="Partie en ligne">
      <button id="online-invite" type="button">Inviter un ami</button>
      <p id="online-status" role="status"></p>
      <div id="online-link-box" hidden>
        <input id="online-link" aria-label="Lien d’invitation J2" readonly>
        <button id="online-copy" type="button">Copier le lien</button>
      </div>
    </section>
    <label class="remote-mode"><input id="remote-two" type="checkbox"> Activer une deuxième manette</label>
    <small id="remote-mode-note">Choisissez aussi le mode deux joueurs dans le jeu.</small>
    <div class="remote-tabs" role="tablist" aria-label="Manette à connecter">
      <button id="remote-seat-1" type="button" role="tab" aria-controls="remote-panel" data-seat="1">Joueur 1 <span id="remote-state-1">À connecter</span></button>
      <button id="remote-seat-2" type="button" role="tab" aria-controls="remote-panel" data-seat="2">Joueur 2 <span id="remote-state-2">Désactivé</span></button>
    </div>
    <section id="remote-panel" role="tabpanel" aria-labelledby="remote-seat-1">
      <p id="remote-selected">Connecter le joueur 1</p>
      <div id="remote-qr"></div>
      <a id="remote-address" target="_blank" rel="noopener"></a>
      <div id="remote-code" aria-label="Code de la partie">······</div>
      <small id="remote-expiry"></small>
    </section>
    <p id="remote-status" role="status" aria-live="polite"></p>
    <button id="remote-new" type="button">Nouveau code / Reconnecter</button>
    <small class="remote-footnote">Un nouveau code déconnecte les manettes. La fenêtre se ferme automatiquement à la connexion.</small>`;
  document.body.appendChild(dialog);
  const find = id => dialog.querySelector('#' + id);
  const setStatus = text => { find('remote-status').textContent = text; };
  let socket, retryTimer, active = false, attempts = 0, code = '', expires = 0;
  let maxPlayers = 1, selected = 1, manager, lastReply = 0, ticks = 0, serverProtocol = 0;
  let connected = new Set();
  let onlineSupported = false, sharing = null, peer = null, inviteUrl = '', iceServers = [];
  let selectingTab = false, inviteTimer;
  const pressed = [new Set(), new Set()], lastInput = [0, 0];
  const onePlayerCores = new Set(['gb', 'gbc', 'gba', 'segaGG']);

  function gameInfo() {
    const win = frame.contentWindow, emu = win?.EJS_emulator;
    let core = emu?.getControlScheme?.() || win?.EJS_core || 'segaMD';
    if (core === 'gb' && /\.gbc(?:$|[?#])/i.test(win?.EJS_gameName || '')) core = 'gbc';
    return { type: 'info', core,
      title: document.getElementById('emu-title')?.textContent || 'Jeu rétro',
      ready: !!emu?.gameManager };
  }
  function release(player) {
    const keys = pressed[player - 1];
    for (const id of keys) { try { manager?.simulateInput(player - 1, id, 0); } catch (_) {} }
    keys.clear();
  }
  function releaseAll() { release(1); release(2); }
  function send(value) {
    if (socket?.readyState === WebSocket.OPEN && socket.bufferedAmount < 4096) socket.send(JSON.stringify(value));
  }
  function render() {
    const handheld = onePlayerCores.has(gameInfo().core);
    find('remote-two').disabled = handheld || serverProtocol === 1;
    find('remote-two').checked = maxPlayers === 2;
    find('remote-mode-note').textContent = handheld
      ? 'Une seule manette : le multijoueur par câble de cette console n’est pas pris en charge.'
      : serverProtocol === 1
        ? 'J1 disponible. Mettez le relais Render à jour pour activer deux manettes.'
        : 'Le jeu doit proposer un mode deux joueurs sur le même écran. Activez-le dans son menu.';
    if (selected > maxPlayers) selected = 1;
    find('online-invite').disabled = !code || !onlineSupported || handheld || connected.has(2) || !!sharing || selectingTab;
    find('online-link-box').hidden = !inviteUrl;
    find('online-link').value = inviteUrl;
    find('remote-panel').hidden = selected === 2 && !!inviteUrl;
    stopShare.hidden = !sharing;
    for (const player of [1, 2]) {
      const tab = find('remote-seat-' + player);
      tab.disabled = player > maxPlayers;
      tab.setAttribute('aria-selected', String(selected === player));
      find('remote-state-' + player).textContent = connected.has(player) ? 'Connecté ✓' : player === 2 && inviteUrl ? 'Invitation en ligne' : player > maxPlayers ? 'Désactivé' : 'À connecter';
    }
    find('remote-selected').textContent = 'Connecter le joueur ' + selected;
    find('remote-panel').setAttribute('aria-labelledby', 'remote-seat-' + selected);
    find('remote-code').textContent = code || '······';
    button.textContent = connected.size
      ? '📱 Manettes · ' + connected.size + '/' + maxPlayers
      : '📱 Jouer avec mon téléphone';
    const url = new URL('/', RELAY_HTTP);
    if (code) { url.searchParams.set('code', code); url.searchParams.set('player', String(selected)); }
    find('remote-address').href = url.href;
    find('remote-address').textContent = code ? 'Ouvrir la manette du joueur ' + selected : RELAY_HTTP;
    find('remote-qr').replaceChildren();
    if (code && window.qrcode) {
      const qr = window.qrcode(0, 'M'); qr.addData(url.href); qr.make();
      find('remote-qr').innerHTML = qr.createSvgTag({ cellSize: 4, margin: 16, scalable: true });
      const svg = find('remote-qr').querySelector('svg');
      svg?.setAttribute('role', 'img'); svg?.setAttribute('aria-label', 'QR code pour le joueur ' + selected);
    }
  }
  function closePeer() {
    peer?.close(); peer = null;
  }
  function stopOnline(message = '', notifyRelay = true) {
    clearTimeout(inviteTimer);
    if (sharing && notifyRelay) send({ type: 'online_stop' });
    closePeer();
    sharing?.getTracks().forEach(track => track.stop());
    sharing = null; inviteUrl = ''; iceServers = [];
    find('online-status').textContent = message;
    render();
  }
  async function inviteFriend() {
    if (!navigator.mediaDevices?.getDisplayMedia || !window.RTCPeerConnection) {
      find('online-status').textContent = 'Ouvrez RetroTest sur un navigateur PC compatible avec le partage d’onglet.';
      return;
    }
    if (!gameInfo().ready) {
      find('online-status').textContent = 'Attendez que le jeu soit chargé.';
      return;
    }
    const session = socket;
    selectingTab = true; render();
    find('online-status').textContent = 'Choisissez l’onglet RetroTest et cochez le partage du son.';
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 30, max: 30 }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true, preferCurrentTab: true, surfaceSwitching: 'exclude'
      });
      const track = stream.getVideoTracks()[0];
      const surface = track?.getSettings().displaySurface;
      if (session !== socket || socket?.readyState !== WebSocket.OPEN || !track || (surface && surface !== 'browser')) {
        stream.getTracks().forEach(item => item.stop());
        find('online-status').textContent = 'Relancez l’invitation en choisissant l’onglet RetroTest.';
        return;
      }
      sharing = stream;
      track.addEventListener('ended', () => stopOnline('Partage terminé.'), { once: true });
      send({ type: 'online_start' });
      inviteTimer = setTimeout(() => stopOnline('Le relais n’a pas confirmé l’invitation. Réessayez.'), 8000);
    } catch (_) {
      find('online-status').textContent = 'Partage annulé ou indisponible. Réessayez depuis le PC.';
    } finally {
      selectingTab = false; render();
    }
  }
  async function sendOffer() {
    closePeer();
    if (!sharing) return;
    let current;
    try {
      current = new RTCPeerConnection({ iceServers }); peer = current;
      for (const track of sharing.getTracks()) current.addTrack(track, sharing);
      await current.setLocalDescription(await current.createOffer());
      await waitForIce(current);
      if (peer === current) send({ type: 'online_signal', kind: 'offer', sdp: current.localDescription.sdp });
    } catch (_) {
      if (!current || peer === current) stopOnline('La connexion vidéo a échoué. Créez une nouvelle invitation.');
    }
  }
  function waitForIce(connection) {
    return new Promise(resolve => {
      function finish() {
        clearTimeout(timer);
        connection.removeEventListener('icegatheringstatechange', changed);
        resolve();
      }
      function changed() { if (connection.iceGatheringState === 'complete') finish(); }
      const timer = setTimeout(finish, 8000);
      connection.addEventListener('icegatheringstatechange', changed);
      changed();
    });
  }
  find('online-invite').onclick = inviteFriend;
  find('online-copy').onclick = async () => {
    find('online-link').select();
    try {
      await navigator.clipboard.writeText(inviteUrl);
      find('online-status').textContent = 'Lien copié. Envoyez-le à votre ami.';
    } catch (_) {
      find('online-status').textContent = 'Lien sélectionné. Copiez-le avec Ctrl + C.';
    }
  };
  stopShare.onclick = () => stopOnline('Partage terminé.');
  function stop() {
    active = false; clearTimeout(retryTimer); retryTimer = null;
    stopOnline(); onlineSupported = false;
    releaseAll(); const previous = socket; socket = null; previous?.close();
    connected.clear(); code = ''; expires = 0; serverProtocol = 0;
    render();
  }
  function applyInput(data) {
    const player = data.player || 1;
    if (![1, 2].includes(player) || !Array.isArray(data.buttons) || data.buttons.length > 24 ||
        !data.buttons.every(i => Number.isInteger(i) && i >= 0 && i <= 23)) return;
    const nextManager = frame.contentWindow?.EJS_emulator?.gameManager;
    if (manager !== nextManager) { releaseAll(); manager = nextManager; }
    lastInput[player - 1] = Date.now();
    if (!manager || player > maxPlayers) return;
    const current = pressed[player - 1], next = new Set(data.buttons);
    for (const id of new Set([...current, ...next])) {
      if (current.has(id) === next.has(id)) continue;
      try {
        manager.simulateInput(player - 1, id, next.has(id) ? (id >= 16 ? 32767 : 1) : 0);
        if (next.has(id)) current.add(id); else current.delete(id);
      } catch (_) { /* Réessaie au prochain état si le cœur démarre encore. */ }
    }
  }
  function connect(fresh = true) {
    stop(); active = true;
    if (fresh) attempts = 0;
    if (onePlayerCores.has(gameInfo().core)) maxPlayers = 1;
    render(); setStatus('Connexion au relais…');
    const current = new WebSocket(relayUrl); socket = current; lastReply = Date.now();
    current.onopen = () => {
      if (socket !== current) return;
      lastReply = Date.now(); send({ type: 'create', protocol: 3, maxPlayers });
    };
    current.onmessage = event => {
      if (socket !== current) return;
      let data; try { data = JSON.parse(event.data); } catch (_) { return; }
      lastReply = Date.now();
      if (data.type === 'created') {
        if (!/^\d{6}$/.test(String(data.code || ''))) {
          active = false; setStatus('Le relais a renvoyé un code invalide. Réessayez.'); current.close(); return;
        }
        serverProtocol = Number(data.protocol) >= 3 ? 3 : 1;
        onlineSupported = data.online === true;
        if (!onlineSupported) find('online-status').textContent = 'Mettez le relais Render à jour pour les invitations.';
        attempts = 0; code = String(data.code); expires = data.expires;
        maxPlayers = serverProtocol >= 3 && data.maxPlayers === 2 ? 2 : 1;
        render(); send(gameInfo());
        setStatus(serverProtocol >= 3
          ? 'Scannez le QR code ou saisissez le code pour connecter le joueur ' + selected + '.'
          : 'Code et QR code prêts pour J1. Le relais actuel accepte une seule manette.');
      } else if (data.type === 'online_invite' && sharing) {
        clearTimeout(inviteTimer);
        iceServers = data.iceServers;
        const link = new URL('/online', RELAY_HTTP);
        link.hash = new URLSearchParams({ code, token: data.token }).toString();
        inviteUrl = link.href;
        find('online-status').textContent = sharing.getAudioTracks().length
          ? 'Invitation prête pour J2.' : 'Invitation prête pour J2. Le navigateur partage la vidéo seule.';
        render();
      } else if (data.type === 'online_error') {
        stopOnline(data.message);
      } else if (data.type === 'online_signal' && data.kind === 'answer' && peer) {
        const currentPeer = peer;
        currentPeer.setRemoteDescription({ type: 'answer', sdp: data.sdp }).catch(() => {
          if (peer === currentPeer) stopOnline('Réponse vidéo invalide. Créez une nouvelle invitation.');
        });
      } else if (data.type === 'roster') {
        connected = new Set(data.players); maxPlayers = data.maxPlayers; render();
      } else if (data.type === 'phone_connected') {
        connected.add(data.player || 1); render();
        setStatus('Joueur ' + (data.player || 1) + ' connecté.');
        if (dialog.open) dialog.close();
        if (data.online) sendOffer();
      } else if (data.type === 'phone_disconnected') {
        if (data.player === 2) closePeer();
        connected.delete(data.player || 1); release(data.player || 1); render();
        setStatus('Joueur ' + (data.player || 1) + ' déconnecté. Vous pouvez reconnecter cette place.');
      } else if (data.type === 'input') applyInput(data);
      else if (data.type === 'error') { active = false; releaseAll(); setStatus(data.message); }
    };
    current.onerror = () => {};
    current.onclose = () => {
      if (socket !== current) return;
      socket = null; stopOnline('', false); releaseAll(); connected.clear(); code = ''; render();
      if (!active) return;
      if (attempts++ < 5) {
        setStatus('Connexion perdue. Reconnexion au relais…');
        retryTimer = setTimeout(() => connect(false), Math.min(15000, 1500 * 2 ** attempts));
      } else setStatus('Relais indisponible. Cliquez sur Reconnecter pour réessayer.');
    };
  }
  function setMode(count) {
    if (count === 2 && (serverProtocol === 1 || onePlayerCores.has(gameInfo().core))) {
      maxPlayers = 1; render(); return;
    }
    if (count === 1 && sharing) stopOnline('Partage terminé.');
    maxPlayers = count; if (maxPlayers === 1) release(2);
    send({ type: 'set_players', maxPlayers }); render();
  }
  find('remote-two').onchange = () => setMode(find('remote-two').checked ? 2 : 1);
  for (const player of [1, 2]) find('remote-seat-' + player).onclick = () => { selected = player; render(); };
  button.onclick = () => {
    selected = connected.has(1) && maxPlayers === 2 && !connected.has(2) ? 2 : 1;
    render(); if (!dialog.open) dialog.showModal();
    if (!socket && !retryTimer) connect();
  };
  find('remote-close').onclick = () => dialog.close();
  find('remote-new').onclick = () => connect();
  document.getElementById('emu-back')?.addEventListener('click', () => {
    stop(); maxPlayers = 1; selected = 1; render(); dialog.close();
  });
  frame.addEventListener('load', () => { releaseAll(); manager = null; });
  window.addEventListener('pagehide', stop);
  setInterval(() => {
    for (const player of [1, 2]) if (Date.now() - lastInput[player - 1] > 1200) release(player);
    if (socket?.readyState !== WebSocket.OPEN) return;
    if (Date.now() - lastReply > 6000) { socket.close(); return; }
    if (++ticks % 5 !== 0) return;
    const nextManager = frame.contentWindow?.EJS_emulator?.gameManager;
    if (manager !== nextManager) { releaseAll(); manager = nextManager; }
    const info = gameInfo();
    if (onePlayerCores.has(info.core) && maxPlayers === 2) setMode(1);
    send(info); send({ type: 'ping' });
    find('remote-expiry').textContent = expires > Date.now()
      ? 'Code valable pour une connexion pendant 15 minutes.'
      : connected.size ? 'Partie en cours.' : code ? 'Code expiré : créez un nouveau code.' : '';
  }, 100);
  render();
})();


