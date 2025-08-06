const { getDatabase } = require('../database/init');

// Get all tokens for a specific user
async function getTokensByUser(userAccountId) {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        id,
        token_id,
        asset_name,
        asset_category,
        estimated_value,
        token_type,
        description,
        location,
        image_path,
        metadata,
        status,
        user_account_id,
        transaction_hash,
        created_at,
        updated_at
      FROM tokens 
      WHERE user_account_id = ? 
      ORDER BY created_at DESC
    `;

    db.all(query, [userAccountId], (err, rows) => {
      if (err) {
        console.error('Error fetching tokens:', err);
        reject(err);
        return;
      }

      const tokens = rows.map(row => ({
        id: row.id,
        tokenId: row.token_id,
        assetName: row.asset_name,
        assetCategory: row.asset_category,
        estimatedValue: row.estimated_value,
        tokenType: row.token_type,
        description: row.description,
        location: row.location,
        imagePath: row.image_path,
        metadata: row.metadata ? JSON.parse(row.metadata) : null,
        status: row.status,
        userAccountId: row.user_account_id,
        transactionHash: row.transaction_hash,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        hashscanUrl: row.token_id ? `https://hashscan.io/mainnet/token/${row.token_id}` : null
      }));

      resolve(tokens);
    });
  });
}

// Get a specific token by ID
async function getTokenById(tokenId) {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        id,
        token_id,
        asset_name,
        asset_category,
        estimated_value,
        token_type,
        description,
        location,
        image_path,
        metadata,
        status,
        user_account_id,
        transaction_hash,
        created_at,
        updated_at
      FROM tokens 
      WHERE token_id = ?
    `;

    db.get(query, [tokenId], (err, row) => {
      if (err) {
        console.error('Error fetching token:', err);
        reject(err);
        return;
      }

      if (!row) {
        resolve(null);
        return;
      }

      const token = {
        id: row.id,
        tokenId: row.token_id,
        assetName: row.asset_name,
        assetCategory: row.asset_category,
        estimatedValue: row.estimated_value,
        tokenType: row.token_type,
        description: row.description,
        location: row.location,
        imagePath: row.image_path,
        metadata: row.metadata ? JSON.parse(row.metadata) : null,
        status: row.status,
        userAccountId: row.user_account_id,
        transactionHash: row.transaction_hash,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        hashscanUrl: row.token_id ? `https://hashscan.io/mainnet/token/${row.token_id}` : null
      };

      resolve(token);
    });
  });
}

// Get token statistics
async function getTokenStats(userAccountId) {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        COUNT(*) as totalTokens,
        SUM(estimated_value) as totalValue,
        COUNT(CASE WHEN status = 'Minted' THEN 1 END) as activeTokens,
        COUNT(CASE WHEN status = 'Failed' THEN 1 END) as failedTokens,
        AVG(estimated_value) as averageValue
      FROM tokens 
      WHERE user_account_id = ?
    `;

    db.get(query, [userAccountId], (err, row) => {
      if (err) {
        console.error('Error fetching token stats:', err);
        reject(err);
        return;
      }

      resolve({
        totalTokens: row.totalTokens || 0,
        totalValue: row.totalValue || 0,
        activeTokens: row.activeTokens || 0,
        failedTokens: row.failedTokens || 0,
        averageValue: row.averageValue || 0
      });
    });
  });
}

// Get recent transactions for a user
async function getRecentTransactions(userAccountId, limit = 10) {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        t.id,
        t.token_id,
        t.asset_name,
        t.asset_category,
        t.estimated_value,
        t.token_type,
        t.status,
        t.transaction_hash,
        t.created_at,
        tr.transaction_type,
        tr.amount,
        tr.fee
      FROM tokens t
      LEFT JOIN transactions tr ON t.token_id = tr.token_id
      WHERE t.user_account_id = ?
      ORDER BY t.created_at DESC
      LIMIT ?
    `;

    db.all(query, [userAccountId, limit], (err, rows) => {
      if (err) {
        console.error('Error fetching recent transactions:', err);
        reject(err);
        return;
      }

      const transactions = rows.map(row => ({
        id: row.id,
        tokenId: row.token_id,
        assetName: row.asset_name,
        assetCategory: row.asset_category,
        estimatedValue: row.estimated_value,
        tokenType: row.token_type,
        status: row.status,
        transactionHash: row.transaction_hash,
        transactionType: row.transaction_type,
        amount: row.amount,
        fee: row.fee,
        createdAt: row.created_at,
        hashscanUrl: row.transaction_hash ? `https://hashscan.io/mainnet/transaction/${row.transaction_hash}` : null
      }));

      resolve(transactions);
    });
  });
}

module.exports = {
  getTokensByUser,
  getTokenById,
  getTokenStats,
  getRecentTransactions
}; 