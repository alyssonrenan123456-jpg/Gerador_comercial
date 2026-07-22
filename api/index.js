const express = require('express');
const { createClient } = require('@libsql/client');
const path = require('path');
const ipaddr = require('ipaddr.js');

const app = express();

// Conexão direta com o Turso usando protocolo libsql://
const db = createClient({
  url: 'https://logscomercial-alyssonrenan123456-jpg.aws-us-east-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODQ3MjI4NTgsImlkIjoiMDE5Zjg5YzMtYzIwMS03ZmFmLWI1YjItZTU1ZjUzNGZjZTAzIiwia2lkIjoicDRjeVRXTlZ5YWUtMXRUSkh6S2w0ZU54bUZVRm8ySXhTaDdTRHJkRWJxQSIsInJpZCI6IjdlNmU4MzYyLTg1YzUtNDIyOC04NTAxLTE4YThlMTQzNzU4MCJ9.zje1JEqAcrMc1b-md3gVOH9L6eV1vrnAYNakSVpcoAYqH8nV43L48JzHkq843jYnRCZfZELPPeeUTyokkFt5CA',       // Cole o Token do Turso aqui
});

const FAIXA_ADMIN_AUTORIZADA = '177.37.73.0/24';

app.use(express.json());

// Validação de IP
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

// Rota de Salvar Log
app.post('/api/logs', async (req, res) => {
  try {
    const { atendente, login_criado, senha_criada } = req.body;
    let ipOrigem = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (ipOrigem && ipOrigem.includes(',')) ipOrigem = ipOrigem.split(',')[0].trim();

    const agora = new Date();
    const data = agora.toLocaleDateString('pt-BR');
    const horario = agora.toLocaleTimeString('pt-BR');

    await db.execute({
      sql: 'INSERT INTO logs (atendente, login_criado, senha_criada, data, horario, ip_origem) VALUES (?, ?, ?, ?, ?, ?)',
      args: [atendente, login_criado, senha_criada, data, horario, ipOrigem]
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Erro no POST /api/logs:', err);
    res.status(500).json({ error: 'Erro ao salvar o registro no Turso.', details: err.message });
  }
});

// Rota de Buscar Logs
app.get('/api/admin/logs', verificarIpAdmin, async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM logs ORDER BY id DESC');
    const rows = result.rows;

    const logsAgrupados = rows.reduce((acc, item) => {
      if (!acc[item.data]) acc[item.data] = [];
      acc[item.data].push(item);
      return acc;
    }, {});

    res.json(logsAgrupados);
  } catch (err) {
    console.error('Erro no GET /api/admin/logs:', err);
    res.status(500).json({ error: 'Erro ao consultar os logs.', details: err.message });
  }
});

// Página de Admin
app.get('/admin/logs', verificarIpAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '../admin_logs.html'));
});

module.exports = app;
