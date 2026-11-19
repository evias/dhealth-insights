#!/usr/bin/env node

/**
 * Database Migration Script
 * 
 * Applies pending migrations from the repository.
 * Migrations are tracked via DBHEAD file which contains the count of applied migrations.
 * Usage: npm run db:migrate
 */

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, '..', 'insights.db');
const dbheadPath = path.join(__dirname, '..', 'DBHEAD');

// Check if database exists
if (!fs.existsSync(dbPath)) {
  console.error(`❌ Database not found at: ${dbPath}`);
  console.error(`   Run: npm run db:init && npm run db:seed`);
  process.exit(1);
}

// Check if DBHEAD exists
if (!fs.existsSync(dbheadPath)) {
  console.error(`❌ DBHEAD file not found at: ${dbheadPath}`);
  console.error(`   This file tracks which migrations have been applied.`);
  process.exit(1);
}

console.log('🔄 Checking for pending migrations...');

try {
  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');

  // Read current migration count from DBHEAD
  const currentMigrationCount = parseInt(fs.readFileSync(dbheadPath, 'utf-8').trim(), 10);

  console.log(`   Current migration level: ${currentMigrationCount}`);

  // Define all migrations (indexed by migration number)
  const migrations = [
    // Migration 1: Add subscribers table
    {
      name: 'Add subscribers table',
      up: (db) => {
        try {
          db.exec(`
            CREATE TABLE IF NOT EXISTS subscribers (
              id TEXT PRIMARY KEY,
              email TEXT NOT NULL,
              name TEXT NOT NULL,
              subscribed_at   INTEGER NOT NULL DEFAULT (unixepoch()),
              unsubscribed_at INTEGER
            ) WITHOUT ROWID;
          `);

          return true;
        } catch (error) {
          throw error;
        }
      }
    },
  ];

  console.log(`   Total migrations defined: ${migrations.length}`);

  // Run pending migrations
  let appliedCount = 0;

  for (let i = 0; i < migrations.length; i++) {
    const migrationNumber = i + 1;

    if (migrationNumber > currentMigrationCount) {
      const migration = migrations[i];
      console.log(`\n  Running migration ${migrationNumber}: ${migration.name}`);

      try {
        const applied = migration.up(db);
        if (applied) {
          console.log(`    ✓ Migration ${migrationNumber} applied`);
          appliedCount++;
        } else {
          console.log(`    ⓘ Migration ${migrationNumber} already applied or skipped`);
        }
      } catch (error) {
        console.error(`    ✗ Migration ${migrationNumber} failed:`, error.message);
        process.exit(1);
      }
    }
  }

  db.close();

  if (appliedCount > 0) {
    console.log(`\n✅ Applied ${appliedCount} pending migration(s)`);
  } else {
    console.log(`\nℹ️  Database is up to date`);
  }

} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
