'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { randomInt } = require('node:crypto');
const { WebSocketServer } = require('ws');

const PORT = Number(process.env.PORT || 3000);

const allowed = new Set(
  (process.env.ALLOWED_ORIGINS || 'https://retrogaming-phi.vercel.app')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
);

const rooms = new Map();
const limits = new Map();

const CODE_TTL = 15 * 60 * 1000;
const SESSION_TTL = 4 * 60 * 60 * 1000;

const assets = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/controller.js': ['controller.js', 'text/javascript; charset=utf-8'],
  '/controller.css': ['controller.css', 'text/css; charset=utf-8']
};

function send(ws, value) {
  if (!ws || ws.readyState !== 1) return;

  if (ws.bufferedAmount > 16384) {
    ws.terminate();
    return;
  }

  ws.send(JSON.stringify(value));
}

function reject(ws, message) {
  send(ws, { type: 'error', message });
  ws.close(1008);
}

function quota(ip, action, max) {
  const key = ip + ':' + action;
  let item = limits.get(key);

  if (!item || Date.now() > item.until) {
    item = {
      count: 0,
      until: Date.now() + 60000
    };

    limits.set(key, item);
  }

  return ++item.count <= max;
}

function expire(room) {
  rooms.delete(room.code);

  send(room.phone, {
    type: 'error',
    message: 'Session fermée. Demandez un nouveau code sur le PC.'
  });

  room.phone?.close(1000);
  room.host.close(1000);
}

const server = http.createServer((req, res) => {
  const pathname = String(req.url || '/').split('?')[0];

  if (pathname === '/health') {
    res.writeHead(200, {
      'Content-Type': 'text/plain'
    });

    return res.end('ok');
  }

  const asset = assets[pathname];

  if (!asset) {
    res.writeHead(404);
    return res.end('Introuvable');
  }

  fs.readFile(
    path.join(__dirname, 'public', asset[0]),
    (error, bytes) => {
      if (error) {
        res.writeHead(500);
        return res.end('Fichier manquant');
      }

      res.writeHead(200, {
        'Content-Type': asset[1],
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer'
      });

      res.end(bytes);
    }
  );
});

const wss = new WebSocketServer({
  noServer: true,
  maxPayload: 2048,
  perMessageDeflate: false
});

server.on('upgrade', (req, socket, head) => {
  let accepted = false;

  try {
    const origin = new URL(req.headers.origin);

    accepted =
      allowed.has(origin.origin) ||
      origin.host === req.headers.host;
  } catch (_) {}

  if (
    req.url !== '/ws' ||
    !accepted ||
    wss.clients.size >= 500
  ) {
    socket.end(
      'HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n'
    );

    return;
  }

  wss.handleUpgrade(req, socket, head, ws => {
    wss.emit('connection', ws, req);
  });
});

wss.on('connection', (ws, req) => {
  const forwarded = req.headers['x-forwarded-for'];

  const ip =
    process.env.TRUST_PROXY === '1' && forwarded
      ? String(forwarded).split(',')[0].trim()
      : req.socket.remoteAddress;

  ws.alive = true;

  ws.on('pong', () => {
    ws.alive = true;
  });

  ws.on('error', () => {});

  const pending = setTimeout(() => {
    if (!ws.role) ws.close(1008);
  }, 10000);

  let count = 0;
  let windowStart = Date.now();

  ws.on('message', (raw, binary) => {
    if (binary) return reject(ws, 'Message invalide.');

    if (Date.now() - windowStart >= 1000) {
      count = 0;
      windowStart = Date.now();
    }

    if (++count > 80) {
      return reject(ws, 'Trop de messages.');
    }

    let data;

    try {
      data = JSON.parse(raw.toString());
    } catch (_) {
      return;
    }

    if (!data || typeof data !== 'object') return;

    if (!ws.role) {
      if (data.type === 'create') {
        if (
          !quota(ip, 'create', 10) ||
          rooms.size >= 200
        ) {
          return reject(ws, 'Réessayez dans une minute.');
        }

        let code;

        do {
          code = String(randomInt(100000, 1000000));
        } while (rooms.has(code));

        const now = Date.now();

        const room = {
          code,
          host: ws,
          phone: null,
          info: null,
          created: now,
          expires: now + CODE_TTL,
          lastInput: now
        };

        ws.role = 'host';
        ws.code = code;

        rooms.set(code, room);
        clearTimeout(pending);

        send(ws, {
          type: 'created',
          code,
          expires: room.expires
        });
      } else if (data.type === 'join') {
        if (!quota(ip, 'join', 20)) {
          return reject(
            ws,
            'Trop d’essais. Attendez une minute.'
          );
        }

        const room = rooms.get(String(data.code || ''));

        if (!room || Date.now() > room.expires) {
          return reject(
            ws,
            'Code incorrect ou expiré. Créez un nouveau code sur le PC.'
          );
        }

        if (room.phone) {
          return reject(
            ws,
            'Une manette est déjà connectée à cette partie.'
          );
        }

        ws.role = 'phone';
        ws.code = room.code;
        room.phone = ws;
        room.lastInput = Date.now();

        clearTimeout(pending);

        send(ws, { type: 'joined' });

        if (room.info) send(ws, room.info);

        send(room.host, { type: 'phone_connected' });
      } else {
        reject(ws, 'Connexion invalide.');
      }

      return;
    }

    const room = rooms.get(ws.code);

    if (!room) return ws.close(1000);

    if (data.type === 'ping') {
      return send(ws, { type: 'pong' });
    }

    if (ws === room.host && data.type === 'info') {
      room.info = {
        type: 'info',
        core: String(data.core || 'segaMD').slice(0, 40),
        title: String(data.title || 'Jeu rétro').slice(0, 160),
        ready: data.ready === true
      };

      send(room.phone, room.info);
    }

    if (ws === room.phone && data.type === 'state') {
      if (
        !Array.isArray(data.buttons) ||
        data.buttons.length > 24 ||
        !data.buttons.every(
          i => Number.isInteger(i) && i >= 0 && i <= 23
        )
      ) {
        return;
      }

      room.lastInput = Date.now();

      send(room.host, {
        type: 'input',
        buttons: [...new Set(data.buttons)]
      });
    }
  });

  ws.on('close', () => {
    clearTimeout(pending);

    const room = rooms.get(ws.code);

    if (!room) return;

    if (room.host === ws) {
      expire(room);
    } else if (room.phone === ws) {
      room.phone = null;

      send(room.host, {
        type: 'input',
        buttons: []
      });

      send(room.host, {
        type: 'phone_disconnected'
      });
    }
  });
});

setInterval(() => {
  const now = Date.now();

  for (const room of rooms.values()) {
    if (now - room.created > SESSION_TTL) {
      expire(room);
      continue;
    }

    if (room.phone && now - room.lastInput > 1000) {
      send(room.host, {
        type: 'input',
        buttons: []
      });
    }
  }
}, 400);

setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.alive) {
      ws.terminate();
      continue;
    }

    ws.alive = false;
    ws.ping();
  }

  for (const [key, value] of limits) {
    if (Date.now() > value.until) limits.delete(key);
  }
}, 15000);

server.listen(PORT, '0.0.0.0', () => {
  console.log('Relais prêt sur le port ' + PORT);
});