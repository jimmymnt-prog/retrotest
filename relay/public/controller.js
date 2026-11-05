(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const codeInput = $('code');
  const status = $('status');
  const dpad = $('dpad');

  let socket;
  let joined = false;
  let ready = false;
  let core = '';
  let retry;
  let tries = 0;
  let running = false;
  let lastReply = 0;
  let wakeLock;

  const buttons = new Map();
  const directions = new Map();

  const profiles = {
    segaMD: [
      ['X', 10], ['Y', 9], ['Z', 11],
      ['A', 1], ['B', 0], ['C', 8]
    ],
    nes: [['B', 0], ['A', 8]],
    gb: [['B', 0], ['A', 8]],
    gba: [['L', 10], ['R', 11], ['B', 0], ['A', 8]],
    snes: [
      ['L', 10], ['X', 9], ['R', 11],
      ['Y', 1], ['B', 0], ['A', 8]
    ],
    psx: [
      ['L1', 10], ['△', 9], ['R1', 11],
      ['□', 1], ['×', 0], ['○', 8],
      ['L2', 12], ['R2', 13]
    ],
    n64: [
      ['L', 10], ['C↑', 23], ['R', 11],
      ['C←', 21], ['C↓', 22], ['C→', 20],
      ['Z', 12], ['B', 1], ['A', 0]
    ],
    segaMS: [['1', 0], ['2', 8]],
    segaGG: [['1', 0], ['2', 8]]
  };

  const setStatus = (text, ok = false) => {
    status.textContent = text;
    status.classList.toggle('connected', ok);
  };

  function send(value) {
    if (
      socket?.readyState === WebSocket.OPEN &&
      socket.bufferedAmount < 4096
    ) {
      socket.send(JSON.stringify(value));
    }
  }

  function sendState() {
    if (!joined) return;

    const held =
      ready && !document.hidden
        ? [
            ...new Set([
              ...buttons.values(),
              ...[...directions.values()].flat()
            ])
          ]
        : [];

    send({
      type: 'state',
      buttons: held
    });
  }

  function clear() {
    buttons.clear();
    directions.clear();

    document.querySelectorAll('.pressed').forEach(el => {
      el.classList.remove('pressed');
    });

    sendState();
  }

  function makeButton(label, id, target) {
    const button = document.createElement('button');

    button.type = 'button';
    button.textContent = label;

    button.addEventListener('pointerdown', e => {
      e.preventDefault();

      if (!ready) return;

      button.setPointerCapture(e.pointerId);
      buttons.set(e.pointerId, id);
      button.classList.add('pressed');

      sendState();
    });

    function end(e) {
      buttons.delete(e.pointerId);

      if (![...buttons.values()].includes(id)) {
        button.classList.remove('pressed');
      }

      sendState();
    }

    for (
      const name of [
        'pointerup',
        'pointercancel',
        'lostpointercapture'
      ]
    ) {
      button.addEventListener(name, end);
    }

    target.appendChild(button);
  }

  function render(next) {
    clear();
    core = next;

    $('actions').replaceChildren();
    $('center-buttons').replaceChildren();

    let profile = profiles[core];

    if (['segaCD', 'sega32x'].includes(core)) {
      profile = profiles.segaMD;
    }

    (profile || profiles.snes).forEach(([label, id]) => {
      makeButton(label, id, $('actions'));
    });

    if (!['n64', 'segaMS', 'segaGG'].includes(core)) {
      makeButton(
        ['segaMD', 'segaCD', 'sega32x'].includes(core)
          ? 'MODE'
          : 'SELECT',
        2,
        $('center-buttons')
      );
    }

    if (core !== 'segaMS') {
      makeButton('START', 3, $('center-buttons'));
    }

    $('stick-option').hidden = core !== 'n64';
  }

  function updateDpad(e) {
    if (!ready) return;

    const r = dpad.getBoundingClientRect();

    const x = (e.clientX - r.left) / r.width * 2 - 1;
    const y = (e.clientY - r.top) / r.height * 2 - 1;

    const stick = core === 'n64' && $('stick').checked;
    const values = [];

    if (x < -.28) values.push(stick ? 17 : 6);
    if (x > .28) values.push(stick ? 16 : 7);
    if (y < -.28) values.push(stick ? 19 : 4);
    if (y > .28) values.push(stick ? 18 : 5);

    directions.set(e.pointerId, values);

    paintDpad();
    sendState();
  }

  function paintDpad() {
    const held = [...directions.values()].flat();

    const mapping = {
      up: [4, 19],
      down: [5, 18],
      left: [6, 17],
      right: [7, 16]
    };

    for (const [name, ids] of Object.entries(mapping)) {
      dpad.querySelector('.' + name).classList.toggle(
        'pressed',
        ids.some(i => held.includes(i))
      );
    }
  }

  dpad.addEventListener('pointerdown', e => {
    e.preventDefault();

    dpad.setPointerCapture(e.pointerId);
    updateDpad(e);
  });

  dpad.addEventListener('pointermove', e => {
    if (directions.has(e.pointerId)) {
      updateDpad(e);
    }
  });

  for (
    const name of [
      'pointerup',
      'pointercancel',
      'lostpointercapture'
    ]
  ) {
    dpad.addEventListener(name, e => {
      directions.delete(e.pointerId);

      paintDpad();
      sendState();
    });
  }

  $('stick').onchange = clear;

  async function keepAwake() {
    try {
      if (!wakeLock && joined && !document.hidden) {
        wakeLock = await navigator.wakeLock?.request('screen');

        wakeLock?.addEventListener('release', () => {
          wakeLock = null;
        });
      }
    } catch (_) {}
  }

  function connect(fresh = true) {
    clearTimeout(retry);
    clear();

    joined = false;
    ready = false;

    const previous = socket;
    socket = null;
    previous?.close();

    const code = codeInput.value.replace(/\D/g, '');
    codeInput.value = code;

    if (!/^\d{6}$/.test(code)) {
      running = false;
      setStatus('Saisissez les 6 chiffres affichés sur le PC.');
      return;
    }

    if (fresh) tries = 0;

    running = true;

    const url = new URL('/ws', location.href);
    url.protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';

    const current = new WebSocket(url);
    socket = current;
    lastReply = Date.now();

    setStatus('Connexion à la partie…');

    current.onopen = () => {
      if (socket !== current) return;

      lastReply = Date.now();

      send({
        type: 'join',
        code
      });
    };

    current.onmessage = event => {
      if (socket !== current) return;

      let data;

      try {
        data = JSON.parse(event.data);
      } catch (_) {
        return;
      }

      lastReply = Date.now();

      if (data.type === 'joined') {
        joined = true;
        tries = 0;

        setStatus('Connecté · En attente du jeu', true);

        sendState();
        keepAwake();
      } else if (data.type === 'info') {
        if (core !== data.core) render(data.core);

        ready = data.ready === true;

        if (!ready) clear();

        $('game-name').textContent = data.title;

        setStatus(
          ready
            ? 'Connecté · Joueur 1'
            : 'Démarrez le jeu sur le PC',
          true
        );
      } else if (data.type === 'error') {
        running = false;
        ready = false;
        clear();

        setStatus(data.message);
      }
    };

    current.onerror = () => {};

    current.onclose = event => {
      if (socket !== current) return;

      socket = null;
      joined = false;
      ready = false;

      clear();
      wakeLock?.release();

      if (!running) return;

      if (event.code === 1000 || event.code === 1008) {
        running = false;

        setStatus(
          'Session fermée. Saisissez un nouveau code du PC.'
        );
      } else if (tries++ < 5) {
        setStatus('Connexion perdue · Reconnexion…');

        retry = setTimeout(
          () => connect(false),
          Math.min(15000, 1500 * 2 ** tries)
        );
      } else {
        setStatus(
          'Relais indisponible. Appuyez sur Connecter pour réessayer.'
        );
      }
    };
  }

  $('pair-form').onsubmit = e => {
    e.preventDefault();
    connect();
  };

  $('fullscreen').onclick = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch (_) {
      setStatus(
        'Plein écran indisponible. Utilisez le mode paysage.'
      );
    }

    keepAwake();
  };

  document.addEventListener('contextmenu', e => {
    if (e.target.closest('#pad')) e.preventDefault();
  });

  document.addEventListener('visibilitychange', () => {
    clear();

    if (!document.hidden) keepAwake();
  });

  window.addEventListener('blur', clear);
  window.addEventListener('orientationchange', clear);

  window.addEventListener('pagehide', () => {
    running = false;

    clearTimeout(retry);
    clear();
    socket?.close();
  });

  let ticks = 0;

  setInterval(() => {
    if (!joined) return;

    if (Date.now() - lastReply > 5000) {
      clear();
      socket?.close();
      return;
    }

    sendState();

    if (++ticks % 10 === 0) {
      send({ type: 'ping' });
    }
  }, 100);

  render('segaMD');

  codeInput.value =
    new URLSearchParams(location.search).get('code') || '';

  if (/^\d{6}$/.test(codeInput.value)) {
    connect();
  } else {
    setStatus('Entrez le code affiché sur le PC.');
  }
})();