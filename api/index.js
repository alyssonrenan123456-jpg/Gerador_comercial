const express = require('express');
const path = require('path');
const ipaddr = require('ipaddr.js');

const app = express();

// Configurações do Turso
const TURSO_URL = 'https://logscomercial-alyssonrenan123456-jpg.aws-us-east-1.turso.io';
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODQ3MjUwMzAsImlkIjoiMDE5Zjg5YzMtYzIwMS03ZmFmLWI1YjItZTU1ZjUzNGZjZTAzIiwia2lkIjoicDRjeVRXTlZ5YWUtMXRUSkh6S2w0ZU54bUZVRm8ySXhTaDdTRHJkRWJxQSIsInJpZCI6IjdlNmU4MzYyLTg1YzUtNDIyOC04NTAxLTE4YThlMTQzNzU4MCJ9.aImecEtcqGR-mNyMWcKdm8Wft7hLcej2umoDoiVXejtv_XDBF7EUAOdpBlpS17ufbW66kiA1S6O2AKasNNElBA';

// Função para executar SQL direto na API HTTP do Turso
async function queryTurso(sql, args = []) {
  const response = await fetch(`${TURSO_URL}/v2/pipeline`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TURSO_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          type: 'execute',
          stmt: {
            sql: sql,
            args: args.map(arg => ({ type: 'text', value: String(arg) }))
          }
        },
        { type: 'close' }
      ]
    })
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Erro ao conectar ao Turso');
  }

  const result = data.results[0];
  if (result.type === 'error') {
    throw new Error(result.error.message);
  }

  return result.response.result;
}

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

// Força o fuso horário oficial de Brasília
const data = agora.toLocaleDateString('pt-BR', { 
  timeZone: 'America/Sao_Paulo' 
});

const horario = agora.toLocaleTimeString('pt-BR', { 
  timeZone: 'America/Sao_Paulo',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
});

    await queryTurso(
      'INSERT INTO logs (atendente, login_criado, senha_criada, data, horario, ip_origem) VALUES (?, ?, ?, ?, ?, ?)',
      [atendente, login_criado, senha_criada, data, horario, ipOrigem || '']
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Erro no POST /api/logs:', err);
    res.status(500).json({ error: 'Erro ao salvar o registro no Turso.', details: err.message });
  }
});

// Rota de Buscar Logs
app.get('/api/admin/logs', verificarIpAdmin, async (req, res) => {
  try {
    const resTurso = await queryTurso('SELECT id, atendente, login_criado, senha_criada, data, horario, ip_origem FROM logs ORDER BY id DESC');
    
    const cols = resTurso.cols.map(c => c.name);
    const rows = resTurso.rows.map(row => {
      const obj = {};
      row.forEach((cell, idx) => {
        obj[cols[idx]] = cell.value;
      });
      return obj;
    });

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
