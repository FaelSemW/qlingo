const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

// Tenta localizar o banco em D:\questions (local) ou na pasta do server (nuvem/Render)
const localDb = 'D:/questions/database/provas_index.sqlite';
const serverDb = path.join(__dirname, '../provas_index.sqlite');

let db = null;
try {
  if (fs.existsSync(localDb)) {
    db = new DatabaseSync(localDb, { readOnly: true });
  } else if (fs.existsSync(serverDb)) {
    db = new DatabaseSync(serverDb, { readOnly: true });
  }
} catch (e) {
  console.warn('[Catalog API] Banco provas_index.sqlite não disponível de imediato:', e.message);
}

// GET /api/concursos/catalogo - Busca avançada de provas
router.get('/', (req, res) => {
  if (!db) {
    if (fs.existsSync(localDb)) {
      try { db = new DatabaseSync(localDb, { readOnly: true }); } catch (e) {}
    } else if (fs.existsSync(serverDb)) {
      try { db = new DatabaseSync(serverDb, { readOnly: true }); } catch (e) {}
    }
  }

  if (!db) {
    return res.json({
      total: 0,
      page: 1,
      results: [],
      message: "Catálogo de provas sendo indexado. Execute D:\\questions\\INDEXAR_CATALOGO_PCI.bat para sincronizar."
    });
  }

  try {
    const { q, cargo, orgao, organizadora, ano, area, page = 1, limit = 20 } = req.query;
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    
    let whereClauses = [];
    let params = [];

    if (q) {
      whereClauses.push('(cargo LIKE ? OR orgao LIKE ? OR organizadora LIKE ?)');
      const term = `%${q}%`;
      params.push(term, term, term);
    }
    if (cargo) {
      whereClauses.push('cargo LIKE ?');
      params.push(`%${cargo}%`);
    }
    if (orgao) {
      whereClauses.push('orgao LIKE ?');
      params.push(`%${orgao}%`);
    }
    if (organizadora) {
      whereClauses.push('organizadora LIKE ?');
      params.push(`%${organizadora}%`);
    }
    if (ano) {
      whereClauses.push('ano = ?');
      params.push(ano);
    }
    if (area) {
      whereClauses.push('area = ?');
      params.push(area);
    }

    const where = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    
    const countRow = db.prepare(`SELECT count(*) as total FROM provas ${where}`).get(...params);
    const rows = db.prepare(`SELECT * FROM provas ${where} ORDER BY ano DESC, orgao ASC LIMIT ? OFFSET ?`).all(...params, parseInt(limit), offset);

    res.json({
      total: countRow.total,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(countRow.total / parseInt(limit)),
      results: rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/concursos/catalogo/stats - Estatísticas do índice
router.get('/stats', (req, res) => {
  if (!db) {
    return res.json({ total: 0, areas: [] });
  }
  try {
    const total = db.prepare('SELECT count(*) as count FROM provas').get();
    const areas = db.prepare('SELECT area, count(*) as count FROM provas GROUP BY area ORDER BY count DESC').all();
    const anos = db.prepare('SELECT ano, count(*) as count FROM provas GROUP BY ano ORDER BY ano DESC LIMIT 15').all();
    res.json({
      total: total.count,
      areas,
      anos
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
