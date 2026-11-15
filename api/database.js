const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Use test database in test environment, production database otherwise
const dbFileName = process.env.NODE_ENV === 'test' ? 'insights.test.db' : 'insights.db';
const dbPath = path.join(__dirname, '..', dbFileName);

// For test database, create it if it doesn't exist (copy from production)
if (process.env.NODE_ENV === 'test') {
  const productionDbPath = path.join(__dirname, '..', 'insights.db');
  if (!fs.existsSync(dbPath) && fs.existsSync(productionDbPath)) {
    fs.copyFileSync(productionDbPath, dbPath);
  }
} else {
  // Check if production database exists
  if (!fs.existsSync(dbPath)) {
    throw new Error(
      `Database not found at ${dbPath}\n` +
      `Please run: npm run db:init\n` +
      `Then run: npm run db:seed\n` +
      `Then run: npm run db:migrate`
    );
  }
}

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Database helpers
const insightsDb = {
  // Create new bulletins entry
  createBulletin({
    id,
    title,
    slug,
    excerpt,
    content,
    sources, // JSON: ['https://...', ...]
    model, // "gemini-3.8-flash", etc.
    tags, // "AI, research, insights"
  }) {
    const tagsArr = tags.split(", ");
    const now = Math.floor(Date.now() / 1000); // unixepoch()

    // save bulletin details
    const stmt = db.prepare(`
      INSERT INTO bulletins (
        id, title, slug, excerpt, content, model, sources, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id, title, slug, excerpt, content, model, sources,
      now, now
    );
  
    // cleanup tags for bulletin
    const stmtTags_1 = db.prepare(`
      DELETE FROM bulletin_tags WHERE bulletin_id = ?
    `)
    stmtTags_1.run(id);

    // upsert tags
    for (let i = 0; i < tagsArr.length; i++) {
      const stmtTags_2 = db.prepare(`
        INSERT INTO tags (name) VALUES (?)
        ON CONFLICT(name) DO NOTHING;
      `);
      stmtTags_2.run(tagsArr[i]);

      // save relationship
      const stmtTags_3 = db.prepare(`
        INSERT INTO bulletin_tags (bulletin_id, tag_id)
          SELECT ?, id FROM tags WHERE name = ?
      `);
      stmtTags_3.run(id, tagsArr[i]);
    }

    return insightsDb.getBulletinByID(id);
  },

  // Create new votes entry
  registerVote({
    bulletinID,
    userID,
    voteValue, // -1 or 1
  }) {
    const stmt_ins = db.prepare(`
      INSERT INTO votes (bulletin_id, user_id, value)
      VALUES (?, ?, ?)
      ON CONFLICT(bulletin_id, user_id)
        DO UPDATE SET value = excluded.value, created_at = unixepoch()
    `);

    const stmt_bul = db.prepare(`
      UPDATE bulletins
      SET upvotes   = upvotes + ?,
          downvotes = downvotes + ?
      WHERE id = ?
    `);

    stmt_ins.run(
      bulletinID, userID, voteValue,
    );
    stmt_bul.run(
      (voteValue == 1 ? 1 : 0),
      (voteValue == -1 ? 1 : 0),
      bulletinID);

    return insightsDb.getBulletinByID(bulletinID);
  },

  // Get bulletins by ID
  getBulletinByID(id) {
    const stmt = db.prepare('SELECT * FROM bulletins WHERE id = ?');
    const row = stmt.get(id);
    return row;
  },

  // Get bulletins by slug
  getBulletinBySlug(slug) {
    const stmt = db.prepare('SELECT * FROM bulletins WHERE slug = ?');
    const row = stmt.get(slug);
    return row;
  },

  // Get all bulletins with pagination
  getAllBulletins(limit = 10, offset = 0) {
    const stmt = db.prepare(`
      SELECT
        bulletins.*,
        COALESCE(GROUP_CONCAT(t.name, ','), '') AS tags
      FROM bulletins
      LEFT JOIN bulletin_tags bt_rel ON (
        bt_rel.bulletin_id = bulletins.id
      )
      LEFT JOIN tags t ON (
        t.id = bt_rel.tag_id
      )
      GROUP BY bulletins.id
      ORDER BY created_at DESC
      LIMIT ?
      OFFSET ?
    `);
    const rows = stmt.all(limit, offset);

    for (let i = 0; i < rows.length; i++)

    return rows;
  },

  // Get total bulletins count
  getBulletinsCount() {
    let stmt = db.prepare('SELECT COUNT(*) as count FROM bulletins');
    return stmt.get().count ?? 0;
  },

  // Get total bulletins with tag
  getBulletinsCountByTag(tag) {
    let stmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM bulletin_tags
      WHERE tag_id = (
        SELECT id
        FROM tags
        WHERE name = ?
      )
    `);
    return stmt.get(tag).count ?? 0;
  },

  // Get the tags associated to a bulletins entry
  getBulletinTags(id) {
    let stmt = db.prepare(`
      SELECT * FROM bulletin_tags where bulletin_id = ?
    `)
    return stmt.all(id)
  }
};

// Export only insightsDb helpers
module.exports = { insightsDb };
