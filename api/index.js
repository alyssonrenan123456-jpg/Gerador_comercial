const express = require('express');
const { createClient } = require('@libsql/client');
const path = require('path');
const ipaddr = require('ipaddr.js');

const app = express();

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const FAIXA_ADMIN_AUTORIZADA = '177.37.73.0/24';

app.use(express.json());

function ipEstaNaFaixa(ipCliente, faixaCidr) {
  try {
    if (!ipCliente) return false;
    if (ipCliente === '127.0.0.1' || ipCliente === '::1' || ipCliente === '::ffff:127.0.0.1') return true;

    if (ipCliente.startsWith('::ffff:')) {
      ipCliente = ipCliente.replace('::ffff:', '');
    }

    const ipParsed = ipaddr.parse(ipCliente);
    const cidrParsed = ipaddr.parseCIDR(faixaCidr);

    return ipParsed.match(cidrParsed);
  } catch (err) {
    return false;
  }
}

function verificarIpAdmin(req, res, next) {
  let ipCliente = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (ipCliente && ipCliente.includes(',')) {
    ipCliente = ipCliente.split(',')[0].trim();
  }

  if (ipEstaNaFaixa(ipCliente, FAIXA_ADMIN_AUTORIZADA)) {
    return next();
  }

  return res.status(403).send(`
    <div style="font-family: sans-serif; text-align: center; padding: 60px; background: #0a192f; color: white; min-height: 100vh;">
      <h1 style="color: #ef4444; font-size: 32px;">403 - Acesso Restrito</h1>
      <p style="color: #94a3b8; font-size: 16px; margin-top: 10px;">
        Esta área é exclusiva para a administração. Seu IP (${ipCliente}) não está autorizado.
      </p>
    </div>
  `);
}

// Salvar log (Usado pelos atendentes)
app.post('/api/logs', async (req, res) => {
  try {
    const { atendente, login_criado, senha_criada } = req.body;
    let ipOrigem = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (ipOrigem && ipOrigem.includes(',')) ipOrigem = ipOrigem.split(',')[0].trim();

    const agora = new Date();
    const data = agora.toLocaleDateString('pt-BR');
    const horario = agora.toLocaleTimeString('pt-BR');

    await db.execute({
      sql: `INSERT INTO logs (atendente, login_criado, senha_criada, data, horario, ip_origem) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [atendente, login_criado, senha_criada, data, horario, ipOrigem]
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar o registro no Turso.' });
  }
});

// Buscar logs (Protegido por IP)
app.get('/api/admin/logs', verificarIpAdmin, async (req, res) => {
  try {
    const result = await db.execute(`SELECT * FROM logs ORDER BY id DESC`);
    const rows = result.rows;

    const logsAgrupados = rows.reduce((acc, item) => {
      if (!acc[item.data]) acc[item.data] = [];
      acc[item.data].push(item);
      return acc;
    }, {});

    res.json(logsAgrupados);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao consultar os logs.' });
  }
});

// Tela do Admin (Protegida por IP)
app.get('/admin/logs', verificarIpAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '../admin_logs.html'));
});

module.exports = app;