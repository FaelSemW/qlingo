const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const localHdDir = 'D:/questions';
const localDb = path.join(localHdDir, 'database/provas_index.sqlite');
const serverDb = path.join(__dirname, '../provas_index.sqlite');

let db = null;
function getDb() {
  if (db) return db;
  try {
    if (fs.existsSync(localDb)) {
      db = new DatabaseSync(localDb, { readOnly: true });
    } else if (fs.existsSync(serverDb)) {
      db = new DatabaseSync(serverDb, { readOnly: true });
    }
  } catch (e) {
    console.warn('[Catalog API] Erro ao abrir SQLite:', e.message);
  }
  return db;
}

// Escanear todas as provas que já foram baixadas em D:\questions\concursos
function getDownloadedProvasMap() {
  const downloadedMap = new Map();
  const concursosDir = path.join(localHdDir, 'concursos');
  if (!fs.existsSync(concursosDir)) return downloadedMap;

  function scan(dir) {
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
      return;
    }

    const hasInfo = entries.some(e => e.isFile() && e.name === 'info.json');
    if (hasInfo) {
      try {
        const info = JSON.parse(fs.readFileSync(path.join(dir, 'info.json'), 'utf8'));
        const pdfs = entries
          .filter(e => e.isFile() && e.name.toLowerCase().endsWith('.pdf'))
          .map(e => {
            const relPath = path.relative(localHdDir, path.join(dir, e.name)).replace(/\\/g, '/');
            return {
              name: e.name,
              url: `/arquivos_locais/${relPath}`,
              size_bytes: fs.statSync(path.join(dir, e.name)).size
            };
          });

        if (info.slug) {
          downloadedMap.set(info.slug, {
            ...info,
            pdfs,
            folder: path.relative(localHdDir, dir).replace(/\\/g, '/')
          });
        }
      } catch (err) {}
    }

    for (const e of entries) {
      if (e.isDirectory()) {
        scan(path.join(dir, e.name));
      }
    }
  }

  scan(concursosDir);
  return downloadedMap;
}

// GET /api/concursos/catalogo/baixadas - Retorna somente provas que estão salvas no HD
router.get('/baixadas', (req, res) => {
  const downloadedMap = getDownloadedProvasMap();
  const list = Array.from(downloadedMap.values());
  res.json({
    total: list.length,
    hd_path: localHdDir,
    results: list
  });
});

// GET /api/concursos/catalogo - Busca avançada com status do HD
router.get('/', (req, res) => {
  const sqlite = getDb();
  const downloadedMap = getDownloadedProvasMap();

  const { q, cargo, orgao, organizadora, ano, area, baixadas_apenas, page = 1, limit = 20 } = req.query;
  const isOnlyDownloaded = baixadas_apenas === 'true' || baixadas_apenas === '1';

  if (isOnlyDownloaded) {
    let list = Array.from(downloadedMap.values());
    if (q) {
      const term = q.toLowerCase();
      list = list.filter(p => 
        (p.cargo || '').toLowerCase().includes(term) ||
        (p.orgao || '').toLowerCase().includes(term) ||
        (p.banca || '').toLowerCase().includes(term)
      );
    }
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const paginated = list.slice(offset, offset + parseInt(limit));
    return res.json({
      total: list.length,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(list.length / parseInt(limit)),
      results: paginated.map(p => ({
        ...p,
        is_downloaded: true,
        downloaded_files: p.pdfs
      }))
    });
  }

  if (!sqlite) {
    const list = Array.from(downloadedMap.values());
    return res.json({
      total: list.length,
      page: 1,
      limit: parseInt(limit),
      results: list.map(p => ({ ...p, is_downloaded: true, downloaded_files: p.pdfs })),
      message: "Índice SQLite em processamento. Mostrando provas baixadas no HD."
    });
  }

  try {
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
    const countRow = sqlite.prepare(`SELECT count(*) as total FROM provas ${where}`).get(...params);
    const rows = sqlite.prepare(`SELECT * FROM provas ${where} ORDER BY ano DESC, orgao ASC LIMIT ? OFFSET ?`).all(...params, parseInt(limit), offset);

    // Enriquecer cada resultado com status de download no HD
    const enriched = rows.map(r => {
      const down = downloadedMap.get(r.slug);
      return {
        ...r,
        is_downloaded: !!down,
        downloaded_files: down ? down.pdfs : []
      };
    });

    res.json({
      total: countRow.total,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(countRow.total / parseInt(limit)),
      total_baixadas_hd: downloadedMap.size,
      results: enriched
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/concursos/catalogo/stats - Estatísticas consolidadas
router.get('/stats', (req, res) => {
  const sqlite = getDb();
  const downloadedMap = getDownloadedProvasMap();
  
  if (!sqlite) {
    return res.json({ 
      total: downloadedMap.size,
      total_baixadas_hd: downloadedMap.size,
      hd_connected: fs.existsSync(localHdDir),
      areas: [] 
    });
  }

  try {
    const total = sqlite.prepare('SELECT count(*) as count FROM provas').get();
    const areas = sqlite.prepare('SELECT area, count(*) as count FROM provas GROUP BY area ORDER BY count DESC').all();
    const anos = sqlite.prepare('SELECT ano, count(*) as count FROM provas GROUP BY ano ORDER BY ano DESC LIMIT 15').all();
    res.json({
      total: total.count,
      total_baixadas_hd: downloadedMap.size,
      hd_connected: fs.existsSync(localHdDir),
      hd_path: localHdDir,
      areas,
      anos
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;