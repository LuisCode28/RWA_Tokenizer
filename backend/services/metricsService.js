const { getDatabase } = require('../database/init');

// Get overall platform metrics
async function getMetrics() {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    // Get total tokens and value
    const tokensQuery = `
      SELECT 
        COUNT(*) as totalTokens,
        SUM(estimated_value) as totalValue,
        COUNT(CASE WHEN status = 'Minted' THEN 1 END) as activeTokens,
        COUNT(CASE WHEN status = 'Failed' THEN 1 END) as failedTokens,
        COUNT(DISTINCT user_account_id) as uniqueUsers
      FROM tokens
    `;

    db.get(tokensQuery, [], (err, tokenStats) => {
      if (err) {
        console.error('Error fetching token metrics:', err);
        reject(err);
        return;
      }

      // Get average processing time (real calculation from database)
      const processingTimeQuery = `
        SELECT 
          AVG(
            CAST(
              (julianday(updated_at) - julianday(created_at)) * 24 * 60 * 60 
            AS REAL)
          ) as avgProcessingTime
        FROM tokens 
        WHERE status = 'Minted'
      `;

      db.get(processingTimeQuery, [], (err, timeStats) => {
        if (err) {
          console.error('Error fetching processing time:', err);
          reject(err);
          return;
        }

        // Get recent activity (last 24 hours)
        const recentActivityQuery = `
          SELECT COUNT(*) as recentTokens
          FROM tokens 
          WHERE created_at >= datetime('now', '-1 day')
        `;

        db.get(recentActivityQuery, [], (err, activityStats) => {
          if (err) {
            console.error('Error fetching recent activity:', err);
            reject(err);
            return;
          }

          // Get category distribution
          const categoryQuery = `
            SELECT 
              asset_category,
              COUNT(*) as count,
              SUM(estimated_value) as totalValue
            FROM tokens 
            WHERE status = 'Minted'
            GROUP BY asset_category
            ORDER BY count DESC
          `;

          db.all(categoryQuery, [], (err, categoryStats) => {
            if (err) {
              console.error('Error fetching category stats:', err);
              reject(err);
              return;
            }

            const metrics = {
              totalTokens: tokenStats.totalTokens || 0,
              totalValue: tokenStats.totalValue || 0,
              activeTokens: tokenStats.activeTokens || 0,
              failedTokens: tokenStats.failedTokens || 0,
              uniqueUsers: tokenStats.uniqueUsers || 0,
              averageProcessingTime: timeStats.avgProcessingTime || 0,
              recentTokens: activityStats.recentTokens || 0,
              categoryDistribution: categoryStats || [],
              successRate: tokenStats.totalTokens > 0 
                ? ((tokenStats.activeTokens / tokenStats.totalTokens) * 100).toFixed(2)
                : 0,
              averageValue: tokenStats.totalTokens > 0 
                ? (tokenStats.totalValue / tokenStats.totalTokens).toFixed(2)
                : 0
            };

            // Update metrics table
            updateMetricsTable(metrics);

            resolve(metrics);
          });
        });
      });
    });
  });
}

// Update metrics table
async function updateMetricsTable(metrics) {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    const updateQuery = `
      UPDATE metrics 
      SET 
        total_tokens = ?,
        total_value = ?,
        active_users = ?,
        average_processing_time = ?,
        last_updated = CURRENT_TIMESTAMP
      WHERE id = 1
    `;

    db.run(updateQuery, [
      metrics.totalTokens,
      metrics.totalValue,
      metrics.uniqueUsers,
      metrics.averageProcessingTime
    ], (err) => {
      if (err) {
        console.error('Error updating metrics table:', err);
        reject(err);
        return;
      }
      resolve();
    });
  });
}

// Get user-specific metrics
async function getUserMetrics(userAccountId) {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        COUNT(*) as totalTokens,
        SUM(estimated_value) as totalValue,
        COUNT(CASE WHEN status = 'Minted' THEN 1 END) as activeTokens,
        COUNT(CASE WHEN status = 'Failed' THEN 1 END) as failedTokens,
        AVG(estimated_value) as averageValue,
        MAX(created_at) as lastActivity
      FROM tokens 
      WHERE user_account_id = ?
    `;

    db.get(query, [userAccountId], (err, row) => {
      if (err) {
        console.error('Error fetching user metrics:', err);
        reject(err);
        return;
      }

      const userMetrics = {
        totalTokens: row.totalTokens || 0,
        totalValue: row.totalValue || 0,
        activeTokens: row.activeTokens || 0,
        failedTokens: row.failedTokens || 0,
        averageValue: row.averageValue || 0,
        lastActivity: row.lastActivity,
        successRate: row.totalTokens > 0 
          ? ((row.activeTokens / row.totalTokens) * 100).toFixed(2)
          : 0
      };

      resolve(userMetrics);
    });
  });
}

// Get trending assets (most valuable tokens)
async function getTrendingAssets(limit = 5) {
  const db = getDatabase();
  
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        token_id,
        asset_name,
        asset_category,
        estimated_value,
        token_type,
        status,
        created_at,
        user_account_id
      FROM tokens 
      WHERE status = 'Minted'
      ORDER BY estimated_value DESC
      LIMIT ?
    `;

    db.all(query, [limit], (err, rows) => {
      if (err) {
        console.error('Error fetching trending assets:', err);
        reject(err);
        return;
      }

      const trendingAssets = rows.map(row => ({
        tokenId: row.token_id,
        assetName: row.asset_name,
        assetCategory: row.asset_category,
        estimatedValue: row.estimated_value,
        tokenType: row.token_type,
        status: row.status,
        createdAt: row.created_at,
        userAccountId: row.user_account_id,
        hashscanUrl: row.token_id ? `https://hashscan.io/mainnet/token/${row.token_id}` : null
      }));

      resolve(trendingAssets);
    });
  });
}

// Get network statistics from Hedera API
async function getNetworkStats() {
  try {
    // Fetch real Hedera network statistics
    const response = await fetch('https://mainnet-public.mirrornode.hedera.com/api/v1/network/stats');
    const networkData = await response.json();
    
    return {
      networkName: process.env.HEDERA_NETWORK || 'mainnet',
      totalTransactions: networkData.total_transactions || 0,
      averageTransactionFee: 0.0001, // Standard Hedera fee
      networkUptime: 99.9, // Hedera's typical uptime
      consensusNodes: 39, // Hedera's consensus nodes
      lastUpdated: new Date().toISOString(),
      networkData: networkData
    };
  } catch (error) {
    console.error('Error fetching Hedera network stats:', error);
    // Fallback to basic stats if API fails
    return {
      networkName: process.env.HEDERA_NETWORK || 'mainnet',
      totalTransactions: 0,
      averageTransactionFee: 0.0001,
      networkUptime: 99.9,
      consensusNodes: 39,
      lastUpdated: new Date().toISOString(),
      error: 'Failed to fetch network stats'
    };
  }
}

module.exports = {
  getMetrics,
  getUserMetrics,
  getTrendingAssets,
  getNetworkStats,
  updateMetricsTable
}; 