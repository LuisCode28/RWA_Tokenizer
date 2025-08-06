const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.dirname(process.env.DB_PATH || './database/tokens.db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || './database/tokens.db';
const db = new sqlite3.Database(dbPath);

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create tokens table with IPFS support
      db.run(`
        CREATE TABLE IF NOT EXISTS tokens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          token_id TEXT UNIQUE,
          asset_name TEXT NOT NULL,
          asset_category TEXT NOT NULL,
          estimated_value REAL NOT NULL,
          token_type TEXT NOT NULL,
          description TEXT,
          location TEXT,
          image_path TEXT,
          metadata TEXT,
          status TEXT DEFAULT 'Pending',
          user_account_id TEXT NOT NULL,
          transaction_hash TEXT,
          ipfs_hash TEXT,
          ipfs_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating tokens table:', err);
          reject(err);
          return;
        }
        console.log('✅ Tokens table created successfully');
      });

      // Create transactions table for tracking with IPFS
      db.run(`
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          token_id TEXT,
          transaction_hash TEXT UNIQUE,
          transaction_type TEXT NOT NULL,
          status TEXT DEFAULT 'Pending',
          user_account_id TEXT NOT NULL,
          amount REAL,
          fee REAL,
          ipfs_hash TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (token_id) REFERENCES tokens (token_id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating transactions table:', err);
          reject(err);
          return;
        }
        console.log('✅ Transactions table created successfully');
      });

      // Create metrics table for dashboard
      db.run(`
        CREATE TABLE IF NOT EXISTS metrics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          total_tokens INTEGER DEFAULT 0,
          total_value REAL DEFAULT 0,
          active_users INTEGER DEFAULT 0,
          average_processing_time REAL DEFAULT 0,
          last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating metrics table:', err);
          reject(err);
          return;
        }
        console.log('✅ Metrics table created successfully');
        
        // Insert initial metrics record
        db.run(`
          INSERT OR IGNORE INTO metrics (id, total_tokens, total_value, active_users, average_processing_time)
          VALUES (1, 0, 0, 0, 0)
        `, (err) => {
          if (err) {
            console.error('Error inserting initial metrics:', err);
          } else {
            console.log('✅ Initial metrics record created');
          }
          resolve();
        });
      });
    });
  });
}

function getDatabase() {
  return db;
}

module.exports = {
  initializeDatabase,
  getDatabase
}; 