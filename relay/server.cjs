'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { randomInt, randomBytes } = require('node:crypto');
const { WebSocketServer } = require('ws');

// Chaque téléphone possède une place attribuée par le serveur, jamais par un paquet d'entrée.
function createRelay(options = {}) {
  const env = options.env || process.env;
  const allowed = new Set((env.ALLOWED_ORIGINS || 'https://retrotest.vercel.app')
    .split(',').filter(s => s.trim()).map(s => new URL(s.trim()).origin));
  const iceServers = JSON.parse(env.RTC_ICE_SERVERS || '[{"urls":"stun:stun.l.google.com:19302"}]');
  if (!Array.isArray(iceServers)) throw new Error('RTC_ICE_SERVERS doit être un tableau JSON');
  const rooms = new Map(), limits = new Map();
  const codeTtl = options.codeTtl || 15 * 60 * 1000;
  const sessionTtl = options.sessionTtl || 4 * 60 * 60 * 1000;
  const inputTtl = options.inputTtl || 1200;
  const assets = {
    '/online': ['online.html', 'text/html; charset=utf-8'],
    '/online.js': ['online.js', 'text/javascript; charset=utf-8'],
    '/': ['index.html', 'text/html; charset=utf-8'],
    '/controller.js': ['controller.js', 'text/javascript; charset=utf-8'],
    '/controller.css': ['controller.css', 'text/css; charset=utf-8']
  };
  function send(ws, value) {
    if (!ws || ws.readyState !== 1) return;
    if (ws.bufferedAmount > 16384) return ws.terminate();
    ws.send(JSON.stringify(value));
  }
  function reject(ws, message) { send(ws, { type: 'error', message }); ws.close(1008); }
  function quota(ip, action, max) {
    const key = ip + ':' + action;
    let item = limits.get(key);
    if (!item || Date.now() > item.until) {
      item = { count: 0, until: Date.now() + 60000 }; limits.set(key, item);
    }
    return ++item.count <= max;
  }
  function roster(room) {
    return { type: 'roster', players: [...room.phones.keys()], maxPlayers: room.maxPlayers };
  }
  function broadcastRoster(room) {
    const data = roster(room); send(room.host, data);
    for (const phone of room.phones.values()) send(phone, data);
  }
  function expire(room) {
    rooms.delete(room.code);
    for (const phone of room.phones.values()) {
      send(phone, { type: 'error', message: 'Session fermée. Demandez un nouveau code sur le PC.' });
      phone.close(1000);
    }
    room.host.close(1000);
  }
  const server = http.createServer((req, res) => {
    const pathname = String(req.url || '/').split('?')[0];
    if (pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ status: 'ok', protocol: 3 }));
    }
    const asset = Object.hasOwn(assets, pathname) && assets[pathname];
    if (!asset) { res.writeHead(404); return res.end('Introuvable'); }
    fs.readFile(path.join(__dirname, 'public', asset[0]), (error, bytes) => {
      if (error) { res.writeHead(500); return res.end('Fichier manquant'); }
      res.writeHead(200, {
        'Content-Type': asset[1], 'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer'
      });
      res.end(bytes);
    });
  });
  const wss = new WebSocketServer({ noServer: true, maxPayload: 32768, perMessageDeflate: false });
  server.on('upgrade', (req, socket, head) => {
    let accepted = false;
    try {
      const origin = new URL(req.headers.origin);
      accepted = allowed.has(origin.origin) || origin.host === req.headers.host;
    } catch (_) {}
    if (req.url !== '/ws' || !accepted || wss.clients.size >= 500) {
      socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n'); return;
    }
    wss.handleUpgrade(req, socket, head, ws => wss.emit('connection', ws, req));
  });
  wss.on('connection', (ws, req) => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = env.TRUST_PROXY === '1' && forwarded
      ? String(forwarded).split(',')[0].trim() : req.socket.remoteAddress;
    ws.alive = true;
    ws.on('pong', () => { ws.alive = true; });
    ws.on('error', () => {});
    const pending = setTimeout(() => { if (!ws.role) ws.close(1008); }, 10000);
    let count = 0, windowStart = Date.now();
    ws.on('message', (raw, binary) => {
      if (binary) return reject(ws, 'Message invalide.');
      if (Date.now() - windowStart >= 1000) { count = 0; windowStart = Date.now(); }
      if (++count > 80) return reject(ws, 'Trop de messages.');
      let data;
      try { data = JSON.parse(raw.toString()); } catch (_) { return; }
      if (!data || typeof data !== 'object') return;
      if (data.type !== 'online_signal' && raw.length > 2048) return reject(ws, 'Message trop long.');
      if (!ws.role) {
        if (data.type === 'create') {
          if (!quota(ip, 'create', 10) || rooms.size >= 200) return reject(ws, 'Réessayez dans une minute.');
          let code;
          do { code = String(randomInt(100000, 1000000)); } while (rooms.has(code));
          const now = Date.now();
          const room = {
            code, host: ws, phones: new Map(), lastInput: new Map(), info: null,
            created: now, expires: now + codeTtl,
            maxPlayers: data.protocol === 3 && data.maxPlayers === 2 ? 2 : 1,
            protocol: data.protocol === 3 ? 3 : 1, invite: null
          };
          ws.role = 'host'; ws.code = code; rooms.set(code, room); clearTimeout(pending);
          send(ws, { type: 'created', protocol: 3, online: true, code, expires: room.expires, maxPlayers: room.maxPlayers });
          broadcastRoster(room);
        } else if (data.type === 'join' || data.type === 'join_online') {
          if (!quota(ip, 'join', 20)) return reject(ws, 'Trop d’essais. Attendez une minute.');
          const room = rooms.get(String(data.code || ''));
          if (!room || Date.now() > room.expires) return reject(ws, 'Code incorrect ou expiré. Créez un nouveau code sur le PC.');
          const online = data.type === 'join_online';
          if (online && (!room.invite || room.invite !== data.token || room.maxPlayers !== 2)) {
            return reject(ws, 'Invitation invalide. Demandez un nouveau lien.');
          }
          const requested = online ? 2 : data.player == null ? 0 : data.player;
          if (![0, 1, 2].includes(requested)) return reject(ws, 'Joueur invalide.');
          const player = requested || [1, 2].find(i => i <= room.maxPlayers && !room.phones.has(i));
          if (!player) return reject(ws, 'Les places disponibles sont déjà occupées.');
          if (player > room.maxPlayers) return reject(ws, 'Activez le mode deux joueurs sur le PC pour connecter J2.');
          if (player === 2 && room.invite && !online) return reject(ws, 'J2 est réservé à une invitation en ligne.');
          if (room.phones.has(player)) return reject(ws, 'Cette manette est déjà occupée. Choisissez une place libre.');
          ws.role = 'phone'; ws.code = room.code; ws.player = player; ws.online = online;
          room.phones.set(player, ws); room.lastInput.set(player, Date.now()); clearTimeout(pending);
          send(ws, { type: 'joined', protocol: 3, player, maxPlayers: room.maxPlayers });
          if (online) send(ws, { type: 'online_ready', iceServers });
          if (room.info) send(ws, room.info);
          send(room.host, { type: 'phone_connected', player, online });
          broadcastRoster(room);
        } else reject(ws, 'Connexion invalide.');
        return;
      }
      const room = rooms.get(ws.code);
      if (!room) return ws.close(1000);
      if (data.type === 'ping') return send(ws, { type: 'pong' });
      if (ws === room.host && data.type === 'online_start' && room.protocol === 3) {
        if (Date.now() > room.expires || room.phones.has(2)) {
          return send(ws, { type: 'online_error', message: 'J2 est occupé ou le code a expiré. Libérez J2 ou créez un nouveau code.' });
        }
        room.invite = randomBytes(24).toString('base64url');
        room.maxPlayers = 2;
        send(ws, { type: 'online_invite', token: room.invite, iceServers });
        broadcastRoster(room);
      }
      if (ws === room.host && data.type === 'online_stop') {
        room.invite = null;
        const guest = room.phones.get(2);
        if (guest?.online) {
          send(guest, { type: 'error', message: 'Le partage du jeu est terminé.' });
          guest.close(1000);
        }
      }
      if (data.type === 'online_signal' && room.invite && typeof data.sdp === 'string' && data.sdp.length <= 30000) {
        const guest = room.phones.get(2);
        if (guest?.online && ws === room.host && data.kind === 'offer') send(guest, data);
        if (guest?.online && ws === guest && data.kind === 'answer') send(room.host, data);
      }
      if (ws === room.host && data.type === 'set_players' && room.protocol === 3 && [1, 2].includes(data.maxPlayers)) {
        room.maxPlayers = data.maxPlayers;
        if (room.maxPlayers === 1) room.invite = null;
        if (room.maxPlayers === 1 && room.phones.has(2)) {
          const second = room.phones.get(2);
          room.phones.delete(2); room.lastInput.delete(2);
          send(room.host, { type: 'input', player: 2, buttons: [] });
          send(second, { type: 'error', message: 'Le mode deux joueurs a été désactivé sur le PC.' });
          second.close(1000);
        }
        broadcastRoster(room);
      }
      if (ws === room.host && data.type === 'info') {
        room.info = {
          type: 'info', core: String(data.core || 'segaMD').slice(0, 40),
          title: String(data.title || 'Jeu rétro').slice(0, 160), ready: data.ready === true
        };
        for (const phone of room.phones.values()) send(phone, room.info);
      }
      if (ws.role === 'phone' && room.phones.get(ws.player) === ws && data.type === 'state') {
        if (ws.online && !room.invite) return;
        if (!Array.isArray(data.buttons) || data.buttons.length > 24 ||
            !data.buttons.every(i => Number.isInteger(i) && i >= 0 && i <= 23)) return;
        room.lastInput.set(ws.player, Date.now());
        send(room.host, { type: 'input', player: ws.player, buttons: [...new Set(data.buttons)] });
      }
    });
    ws.on('close', () => {
      clearTimeout(pending);
      const room = rooms.get(ws.code);
      if (!room) return;
      if (room.host === ws) expire(room);
      else if (room.phones.get(ws.player) === ws) {
        room.phones.delete(ws.player); room.lastInput.delete(ws.player);
        send(room.host, { type: 'input', player: ws.player, buttons: [] });
        send(room.host, { type: 'phone_disconnected', player: ws.player });
        broadcastRoster(room);
      }
    });
  });
  const watchdog = setInterval(() => {
    const now = Date.now();
    for (const room of rooms.values()) {
      if (now - room.created > sessionTtl) { expire(room); continue; }
      for (const player of room.phones.keys()) {
        if (now - room.lastInput.get(player) > inputTtl) send(room.host, { type: 'input', player, buttons: [] });
      }
    }
  }, options.watchdogMs || 400);
  const heartbeat = setInterval(() => {
    for (const ws of wss.clients) {
      if (!ws.alive) { ws.terminate(); continue; }
      ws.alive = false; ws.ping();
    }
    for (const [key, value] of limits) if (Date.now() > value.until) limits.delete(key);
  }, 15000);
  function close() {
    clearInterval(watchdog); clearInterval(heartbeat);
    for (const ws of wss.clients) ws.terminate();
    return new Promise(resolve => { wss.close(() => server.close(resolve)); });
  }
  return { server, close };
}
module.exports = { createRelay };
if (require.main === module) {
  const relay = createRelay();
  relay.server.listen(Number(process.env.PORT || 3000), '0.0.0.0', () => console.log('Relais manettes prêt · protocole 3'));
  process.once('SIGTERM', () => relay.close());
  process.once('SIGINT', () => relay.close());
}

