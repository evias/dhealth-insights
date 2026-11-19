const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { encrypt, sha256 } = require('./crypto');

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

  // ----------------------------------------------------------------------------
  // Bulletins/Feed and Votes Tables:
  // - `bulletins`
  // - `tags`
  // - `bulletin_tags`
  // - `votes`

  // Create new bulletins entry
  createBulletin({
    id,
    title,
    slug,
    excerpt,
    content,
    trending, // 1|0
    sources, // JSON: ['https://...', ...]
    model, // "gemini-3.8-flash", etc.
    tags, // "AI, research, insights"
  }) {
    const tagsArr = tags.split(", ");
    const now = Math.floor(Date.now() / 1000); // unixepoch()

    // save bulletin details
    const stmt = db.prepare(`
      INSERT INTO bulletins (
        id, title, slug, excerpt, content, model, sources, trending, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id, title, slug, excerpt, content, model, sources, trending,
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
    const get_vote = db.prepare(`SELECT value FROM votes WHERE bulletin_id = ? AND user_id = ?`);
    const vote_row = get_vote.get(bulletinID, userID);

    const stmt_ins = db.prepare(`
      INSERT INTO votes (bulletin_id, user_id, value)
      VALUES (?, ?, ?)
      ON CONFLICT(bulletin_id, user_id)
        DO UPDATE SET value = excluded.value, created_at = unixepoch()
    `);

    stmt_ins.run(
      bulletinID, userID, voteValue,
    );

    const stmt_bul = db.prepare(`
      UPDATE bulletins
      SET upvotes   = upvotes + ?,
          downvotes = downvotes + ?
      WHERE id = ?
    `);

    let addUpvotes = voteValue == 1 ? 1 : (vote_row && 'value' in vote_row && vote_row['value'] === 1 ? -1 : 0);
    let addDownvotes = voteValue == -1 ? 1 : (vote_row && 'value' in vote_row && vote_row['value'] === -1 ? -1 : 0);

    stmt_bul.run(
      addUpvotes,
      addDownvotes,
      bulletinID);

    return insightsDb.getBulletinByID(bulletinID);
  },

  // Update trending flag
  updateTrending({ id, trending }) {
    const b = insightsDb.getBulletinByID(id);
    if (!b || ![1, 0].includes(trending)) {
      return null;
    }

    const stmt = db.prepare(`
      UPDATE bulletins
      SET trending = ?
      WHERE id = ?
    `);

    stmt.run(trending, id);
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
  getAllBulletins(sortBy, limit = 10, offset = 0) {
    let sort;
    switch(sortBy) {
    case 'new':
      sort = `created_at DESC`;
      break;
    case 'top':
      sort = `score DESC`;
      break;
    default:
    case 'hot':
      sort = `trending DESC, score DESC`;
    }

    const stmt = db.prepare(`
      SELECT
        bulletins.*,
        (bulletins.upvotes - bulletins.downvotes) AS score,
        COALESCE(GROUP_CONCAT(t.name, ','), '') AS tags
      FROM bulletins
      LEFT JOIN bulletin_tags bt_rel ON (
        bt_rel.bulletin_id = bulletins.id
      )
      LEFT JOIN tags t ON (
        t.id = bt_rel.tag_id
      )
      GROUP BY bulletins.id
      ORDER BY ${sort}
      LIMIT ?
      OFFSET ?
    `);
    const rows = stmt.all(limit, offset);
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
  },

  // ----------------------------------------------------------------------------
  // Ads/CTA Tables:
  // - `cta_entries`

  // Create new cta_entries
  createCTAEntry({
    id,
    title,
    content,
    cta_text,
    cta_url,
    num_clicks,
  }) {
    // save cta_entries details
    const stmt = db.prepare(`
      INSERT INTO cta_entries (
        id, title, content, cta_text, cta_url, num_clicks
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id, title, content, cta_text, cta_url, num_clicks
    );

    return insightsDb.getCTAEntryByID(id);
  },

  // Update cta_entries.num_clicks
  addClick({ id }) {
    const ad = insightsDb.getCTAEntryByID(id);
    if (!ad) {
      return null;
    }

    const stmt = db.prepare(`
      UPDATE cta_entries
      SET num_clicks = num_clicks + 1
      WHERE id = ?
    `);

    stmt.run(id);
    return insightsDb.getCTAEntryByID(id);
  },

  // Get cta_entries by ID
  getCTAEntryByID(id) {
    const stmt = db.prepare('SELECT * FROM cta_entries WHERE id = ?');
    const row = stmt.get(id);
    return row;
  },

  // Get all cta_entries rows
  getAllCTAEntries(limit, offset) {
    const stmt = db.prepare(`
      SELECT cta_entries.*
      FROM cta_entries
      ORDER BY id ASC
      LIMIT ?
      OFFSET ?
    `);
    const rows = stmt.all(limit, offset);
    return rows;
  },

  // Get total cta_entries count
  getCTAEntriesCount() {
    let stmt = db.prepare('SELECT COUNT(*) as count FROM cta_entries');
    return stmt.get().count ?? 0;
  },

  // ----------------------------------------------------------------------------
  // Subscribers Tables:
  // - `subscribers`

  // Create new subscribers
  createSubscriber({
    email,
    name,
  }) {
    const shaEmail = sha256(email); // id
    const exists = insightsDb.getSubscriberByID(shaEmail);
    if (!!exists) {
      return exists;
    }

    const encEmail = encrypt(email); // email is encrypted

    // save subscribers details
    const stmt = db.prepare(`
      INSERT INTO subscribers (
        id, email, name
      ) VALUES (?, ?, ?)
    `);

    stmt.run(
      shaEmail, encEmail, name
    );

    return insightsDb.getSubscriberByID(shaEmail);
  },

  unsubscribeSubscriber(id) {
    const exists = insightsDb.getSubscriberByID(id);
    if (!exists) {
      return false;
    }

    const stmt = db.prepare(`
      UPDATE subscribers
      SET unsubscribed_at = unixepoch()
      WHERE id = ?
    `);

    stmt.run(id);
    return true;
  },

  getSubscriberByID(id) {
    const stmt = db.prepare('SELECT * FROM subscribers WHERE id = ?');
    const row = stmt.get(id);
    return row;
  },

  getSubscriberByMail(mail) {
    const shaEmail = sha256(mail); // id
    const stmt = db.prepare('SELECT * FROM subscribers WHERE id = ?');
    const row = stmt.get(shaEmail);
    return row;
  },

  getAllSubscribers(limit, offset) {
    const stmt = db.prepare(`
      SELECT subscribers.*
      FROM subscribers
      WHERE unsubscribed_at IS NULL
      ORDER BY subscribed_at ASC
      LIMIT ?
      OFFSET ?
    `);
    const rows = stmt.all(limit, offset);
    return rows;
  },

  getSubscribersCount() {
    let stmt = db.prepare('SELECT COUNT(*) as count FROM subscribers WHERE unsubscribed_at IS NULL');
    return stmt.get().count ?? 0;
  }

};

// Export only insightsDb helpers
module.exports = { insightsDb };
