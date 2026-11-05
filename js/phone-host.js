(() => {
  'use strict';

  const RELAY_HTTP = 'https://retro-manette.onrender.com/';

  const frame = document.getElementById('emu-frame');
  const bar = document.getElementById('emu-bar');

  if (!frame || !bar) return;

  const style = document.createElement('style');

  style.textContent = [
    '#remote-button{padding:5px 10px;border:1px solid #347daa;border-radius:10px;background:#103349;color:#b9eeff;font:600 11px system-ui;cursor:pointer;white-space:nowrap}',
    '#remote-dialog{position:fixed;inset:0;margin:auto;box-sizing:border-box;width:min(440px,94vw);max-height:94dvh;overflow:auto;padding:25px;border:1px solid #347daa;border-radius:18px;background:#101526;color:#d9ecff;font:14px/1.5 system-ui;text-align:center}',
    '#remote-dialog::backdrop{background:#000b}',
    '#remote-dialog h2{font-size:20px;color:#8cdeff}',
    '#remote-dialog button{padding:9px 13px;border:1px solid #347daa;border-radius:9px;background:#123650;color:#d9ecff;cursor:pointer}',
    '#remote-close{position:absolute;right:10px;top:10px}',
    '#remote-code{font-size:42px;letter-spacing:8px;font-weight:800;margin:14px 0}',
    '#remote-dialog a{color:#8cdeff;overflow-wrap:anywhere}',
    '#remote-dialog small{display:block;color:#99b4c8;margin:12px 0}',
    '#remote-qr{max-width:240px;background:white;margin:16px auto}',
    '#remote-qr svg{display:block;width:100%;height:auto}'
  ].join('');

  document.head.appendChild(style);

  const button = document.createElement('button');
  button.id = 'remote-button';
  button.type = 'button';
  button.textContent = '📱 Jouer avec mon téléphone';

  bar.insertBefore(button, document.getElementById('perf-badge'));

  const dialog = document.createElement('dialog');
  dialog.id = 'remote-dialog';

  dialog.innerHTML = [
    '<button id="remote-close" type="button" aria-label="Fermer">×</button>',
    '<h2>Connecter votre téléphone</h2>',
    '<p>Ouvrez cette adresse sur le téléphone :</p>',
    '<a id="remote-address" target="_blank" rel="noopener"></a>',
    '<p>Puis saisissez ce code :</p>',
    '<div id="remote-code">······</div>',
    '<small id="remote-expiry"></small>',
    '<div id="remote-qr"></div>',
    '<p id="remote-status" role="status"></p>',
    '<button id="remote-new" type="button">Nouveau code / Reconnecter</button>',
    '<small>Un nouveau code déconnecte la manette précédente.</small>'
  ].join('');

  document.body.appendChild(dialog);

  const find = id => dialog.querySelector('#' + id);
  const status = text => {
    find('remote-status').textContent = text;
  };

  find('remote-address').href = RELAY_HTTP;
  find('remote-address').textContent = RELAY_HTTP;

  let socket;
  let active = false;
  let timer;
  let attempts = 0;
  let manager;
  let pressed = new Set();
  let lastInput = 0;
  let lastReply = 0;
  let expires = 0;
  let phoneConnected = false;
  let ticks = 0;

  function release() {
    for (const id of pressed) {
      try {
        manager?.simulateInput(0, id, 0);
      } catch (_) {}
    }

    pressed.clear();
  }

  function send(value) {
    if (
      socket?.readyState === WebSocket.OPEN &&
      socket.bufferedAmount < 4096
    ) {
      socket.send(JSON.stringify(value));
    }
  }

  function stop() {
    active = false;
    clearTimeout(timer);
    timer = null;

    release();

    const previous = socket;
    socket = null;
    previous?.close();

    phoneConnected = false;
    button.textContent = '📱 Jouer avec mon téléphone';
  }

  function connect(fresh = true) {
    stop();
    active = true;

    if (fresh) attempts = 0;

    if (RELAY_HTTP.includes('TON-RELAIS')) {
      status('Renseignez d’abord RELAY_HTTP dans js/phone-host.js.');
      return;
    }

    find('remote-code').textContent = '······';
    find('remote-qr').replaceChildren();

    status('Connexion au relais… Le premier démarrage peut prendre un moment.');

    const url = new URL('/ws', RELAY_HTTP);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';

    const current = new WebSocket(url);
    socket = current;
    lastReply = Date.now();

    current.onopen = () => {
      if (socket !== current) return;

      lastReply = Date.now();
      send({ type: 'create' });
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

      if (data.type === 'created') {
        attempts = 0;
        expires = data.expires;

        find('remote-code').textContent = data.code;

        const controller = new URL('/', RELAY_HTTP);
        controller.searchParams.set('code', data.code);

        if (window.qrcode) {
          const qr = window.qrcode(0, 'M');

          qr.addData(controller.href);
          qr.make();

          find('remote-qr').innerHTML = qr.createSvgTag({
            cellSize: 4,
            margin: 16,
            scalable: true
          });
        }

        status('Code prêt. Connectez votre téléphone.');
      } else if (data.type === 'phone_connected') {
        phoneConnected = true;

        button.textContent = '📱 Téléphone connecté';
        status('Téléphone connecté ! Fermez cette fenêtre pour jouer.');
      } else if (data.type === 'phone_disconnected') {
        phoneConnected = false;
        release();

        button.textContent = '📱 Reconnecter le téléphone';

        status(
          'Téléphone déconnecté. Reconnectez-le avec le même code s’il est encore valide.'
        );
      } else if (
        data.type === 'input' &&
        Array.isArray(data.buttons)
      ) {
        if (
          !data.buttons.every(
            i => Number.isInteger(i) && i >= 0 && i <= 23
          )
        ) {
          return;
        }

        const nextManager =
          frame.contentWindow?.EJS_emulator?.gameManager;

        if (manager !== nextManager) {
          release();
          manager = nextManager;
        }

        lastInput = Date.now();

        if (!manager) return;

        const next = new Set(data.buttons);

        for (const id of new Set([...pressed, ...next])) {
          if (pressed.has(id) === next.has(id)) continue;

          try {
            manager.simulateInput(
              0,
              id,
              next.has(id) ? (id >= 16 ? 32767 : 1) : 0
            );
          } catch (_) {}
        }

        pressed = next;
      } else if (data.type === 'error') {
        active = false;
        status(data.message);
      }
    };

    current.onerror = () => {};

    current.onclose = () => {
      if (socket !== current) return;

      socket = null;
      release();
      phoneConnected = false;

      button.textContent = '📱 Connexion perdue';
      find('remote-code').textContent = '······';
      find('remote-qr').replaceChildren();

      if (!active) return;

      if (attempts++ < 5) {
        status('Relais indisponible. Nouvelle tentative en cours…');

        timer = setTimeout(
          () => connect(false),
          Math.min(15000, 1500 * 2 ** attempts)
        );
      } else {
        status(
          'Relais indisponible. Vérifiez son déploiement puis cliquez sur Reconnecter.'
        );
      }
    };
  }

  setInterval(() => {
    if (Date.now() - lastInput > 1000) release();

    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    if (Date.now() - lastReply > 6000) {
      socket.close();
      return;
    }

    if (++ticks % 5 !== 0) return;

    const emu = frame.contentWindow?.EJS_emulator;
    const nextManager = emu?.gameManager;

    if (manager !== nextManager) {
      release();
      manager = nextManager;
    }

    send({
      type: 'info',
      core:
        emu?.getControlScheme?.() ||
        frame.contentWindow?.EJS_core ||
        'segaMD',
      title:
        document.getElementById('emu-title')?.textContent ||
        'Jeu rétro',
      ready: !!manager
    });

    send({ type: 'ping' });

    find('remote-expiry').textContent =
      expires > Date.now()
        ? 'Code valable pour une connexion pendant 15 minutes.'
        : phoneConnected
          ? 'Manette connectée.'
          : 'Code expiré : cliquez sur Nouveau code.';
  }, 100);

  button.onclick = () => {
    if (!dialog.open) dialog.showModal();
    if (!socket && !timer) connect();
  };

  find('remote-close').onclick = () => dialog.close();
  find('remote-new').onclick = () => connect();

  document.getElementById('emu-back')?.addEventListener('click', () => {
    stop();
    dialog.close();
  });

  frame.addEventListener('load', () => {
    release();
    manager = null;
  });

  window.addEventListener('pagehide', stop);
})();