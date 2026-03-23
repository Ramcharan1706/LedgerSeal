import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function initDB() {
  const db = await open({
    filename: './chainproof.db',
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS evidence (
      id TEXT PRIMARY KEY,
      file_hash TEXT UNIQUE,
      secondary_hash TEXT,
      metadata_hash TEXT,
      metadata TEXT,
      owner TEXT,
      txn_id TEXT,
      timestamp INTEGER
    );

    CREATE TABLE IF NOT EXISTS custody (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      evidence_id TEXT,
      from_owner TEXT,
      to_owner TEXT,
      txn_id TEXT,
      timestamp INTEGER,
      FOREIGN KEY(evidence_id) REFERENCES evidence(id)
    );

    CREATE TABLE IF NOT EXISTS verifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      evidence_id TEXT,
      trust_score INTEGER,
      result TEXT,
      timestamp INTEGER
    );
  `);

  return db;
}
