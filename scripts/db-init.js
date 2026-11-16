#!/usr/bin/env node

/**
 * Database Initialization Script
 * 
 * Creates a fresh database with schema but no data.
 * Usage: npm run db:init
 */

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, '..', 'insights.db');

// Check if database already exists
if (fs.existsSync(dbPath)) {
  console.error(`❌ Database already exists at: ${dbPath}`);
  console.error(`   To reset: rm ${dbPath}`);
  process.exit(1);
}

console.log('🔧 Initializing database...');

try {
  // Create fresh database
  const db = new Database(dbPath);

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Create bulletins table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bulletins (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      model TEXT NOT NULL,
      upvotes   INTEGER NOT NULL DEFAULT 0,
      downvotes INTEGER NOT NULL DEFAULT 0,
      sources TEXT NOT NULL DEFAULT '[]',
      trending INTEGER NOT NULL CHECK (trending IN (0, 1)),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_slug ON bulletins(slug);
  `);

  // Create votes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS votes (
      bulletin_id TEXT NOT NULL REFERENCES bulletins(id) ON DELETE CASCADE,
      user_id     TEXT NOT NULL,
      value       INTEGER NOT NULL CHECK (value IN (-1, 1)),
      created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
      PRIMARY KEY (bulletin_id, user_id)
    ) WITHOUT ROWID;
  `);

  // Create tags table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id   INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE COLLATE NOCASE
    );
  `);

  // Create bulletin_tags relationship table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bulletin_tags (
      bulletin_id INTEGER NOT NULL REFERENCES bulletins(id) ON DELETE CASCADE,
      tag_id      INTEGER NOT NULL REFERENCES tags(id)      ON DELETE CASCADE,
      PRIMARY KEY (bulletin_id, tag_id)
    ) WITHOUT ROWID;

    CREATE INDEX idx_bulletin_tags_tag ON bulletin_tags(tag_id, bulletin_id);
  `);

  console.log('  ✓ Database schema created at:', { value: dbPath });

  db.close();

  console.log(`\n✅ Database initialized successfully at:\n   ${dbPath}`);
  console.log('\nNext steps:');
  console.log('  1. npm run db:seed      # Add sample data');
  console.log('  2. npm run db:migrate   # Apply migrations');

} catch (error) {
  console.error('❌ Initialization failed:', error.message);
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
  process.exit(1);
}
