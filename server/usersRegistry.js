// server/usersRegistry.js
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const REGISTRY_FILE = path.join(__dirname, 'users_registry.json');

function saveUserToRegistry(user) {
  if (!user || !user.email) return;
  try {
    let registry = [];
    if (fs.existsSync(REGISTRY_FILE)) {
      try {
        registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
      } catch (e) { registry = []; }
    }
    const cleanEmail = user.email.trim().toLowerCase();
    const idx = registry.findIndex(u => (u.email || '').toLowerCase() === cleanEmail);

    const userData = {
      name: user.name || cleanEmail.split('@')[0],
      email: cleanEmail,
      avatar: user.avatar || null,
      xp: user.xp || 50,
      level: user.level || 'Concurseiro Iniciante 🎯',
      streak_current: user.streak_current || 1,
      streak_max: user.streak_max || 1,
      daily_goal: user.daily_goal || 10,
      target_exam: user.target_exam || null,
      study_goal: user.study_goal || null,
      theme_preference: user.theme_preference || 'dark',
      updated_at: new Date().toISOString()
    };

    if (idx >= 0) {
      registry[idx] = { ...registry[idx], ...userData };
    } else {
      registry.push(userData);
    }

    fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2), 'utf8');
    console.log(`[UsersRegistry] Usuário salvo permanentemente: ${cleanEmail}`);
  } catch (err) {
    console.warn('[UsersRegistry] Erro ao salvar no registro permanente:', err);
  }
}

function restoreUsersToDb(db) {
  try {
    if (!fs.existsSync(REGISTRY_FILE)) return;
    const content = fs.readFileSync(REGISTRY_FILE, 'utf8');
    if (!content.trim()) return;
    const registry = JSON.parse(content);
    if (!Array.isArray(registry) || registry.length === 0) return;

    const insertStmt = db.prepare(`
      INSERT INTO users (name, email, password_hash, avatar, xp, level, streak_current, streak_max, daily_goal, target_exam, study_goal, theme_preference)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        target_exam = COALESCE(excluded.target_exam, users.target_exam),
        study_goal = COALESCE(excluded.study_goal, users.study_goal),
        theme_preference = COALESCE(excluded.theme_preference, users.theme_preference),
        xp = MAX(excluded.xp, users.xp),
        avatar = COALESCE(excluded.avatar, users.avatar)
    `);

    for (const u of registry) {
      const dummyPass = bcrypt.hashSync(Math.random().toString(36), 10);
      insertStmt.run(
        u.name,
        u.email.toLowerCase(),
        dummyPass,
        u.avatar || null,
        u.xp || 50,
        u.level || 'Concurseiro Iniciante 🎯',
        u.streak_current || 1,
        u.streak_max || 1,
        u.daily_goal || 10,
        u.target_exam || null,
        u.study_goal || null,
        u.theme_preference || 'dark'
      );
    }
    console.log(`[UsersRegistry] Restaurados ${registry.length} usuários cadastrados com sucesso.`);
  } catch (err) {
    console.warn('[UsersRegistry] Erro ao restaurar registro de usuários:', err);
  }
}

module.exports = {
  saveUserToRegistry,
  restoreUsersToDb
};
