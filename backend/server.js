const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const { initializeDatabase } = require('./database/init');
const { tokenizeAsset, testHederaConnection } = require('./services/tokenService');
const { getTokensByUser, getTokenById } = require('./services/tokenQuery');
const { getMetrics } = require('./services/metricsService');
const ipfsService = require('./services/ipfsService');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Initialize database
initializeDatabase();

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    network: process.env.HEDERA_NETWORK || 'testnet'
  });
});

// Test Hedera connection
app.get('/api/test/hedera', async (req, res) => {
  try {
    const result = await testHederaConnection();
    res.json(result);
  } catch (error) {
    console.error('Hedera test error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Hedera connection test failed', 
      message: error.message 
    });
  }
});

// Test IPFS connection
app.get('/api/test/ipfs', async (req, res) => {
  try {
    const result = await ipfsService.testConnection();
    res.json(result);
  } catch (error) {
    console.error('IPFS test error:', error);
    res.status(500).json({ 
      success: false,
      error: 'IPFS connection test failed', 
      message: error.message 
    });
  }
});

// Test both connections
app.get('/api/test/connections', async (req, res) => {
  try {
    const hederaTest = await testHederaConnection();
    const ipfsTest = await ipfsService.testConnection();
    
    res.json({
      success: hederaTest.success && ipfsTest.success,
      hedera: hederaTest,
      ipfs: ipfsTest,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Connection test error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Connection test failed', 
      message: error.message 
    });
  }
});

// Tokenize asset
app.post('/api/tokenize', upload.single('image'), async (req, res) => {
  try {
    const {
      assetCategory,
      estimatedValue,
      tokenType,
      assetName,
      description,
      location,
      userAccountId
    } = req.body;

    const imagePath = req.file ? req.file.path : null;

    const tokenData = {
      assetCategory,
      estimatedValue: parseFloat(estimatedValue),
      tokenType,
      assetName,
      description,
      location,
      imagePath,
      userAccountId: userAccountId || process.env.HEDERA_ACCOUNT_ID
    };

    const result = await tokenizeAsset(tokenData);
    res.json(result);
  } catch (error) {
    console.error('Tokenization error:', error);
    res.status(500).json({ 
      error: 'Tokenization failed', 
      message: error.message 
    });
  }
});

// Get all tokens for a user
app.get('/api/tokens', async (req, res) => {
  try {
    const { userAccountId } = req.query;
    const accountId = userAccountId || process.env.HEDERA_ACCOUNT_ID;
    const tokens = await getTokensByUser(accountId);
    res.json(tokens);
  } catch (error) {
    console.error('Error fetching tokens:', error);
    res.status(500).json({ 
      error: 'Failed to fetch tokens', 
      message: error.message 
    });
  }
});

// Get specific token by ID
app.get('/api/token/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const token = await getTokenById(id);
    if (!token) {
      return res.status(404).json({ error: 'Token not found' });
    }
    res.json(token);
  } catch (error) {
    console.error('Error fetching token:', error);
    res.status(500).json({ 
      error: 'Failed to fetch token', 
      message: error.message 
    });
  }
});

// Get metrics for dashboard
app.get('/api/metrics', async (req, res) => {
  try {
    const metrics = await getMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch metrics', 
      message: error.message 
    });
  }
});

// Get metadata preview
app.post('/api/metadata-preview', (req, res) => {
  try {
    const {
      assetCategory,
      estimatedValue,
      tokenType,
      assetName,
      description,
      location
    } = req.body;

    const metadata = {
      name: assetName,
      symbol: `${assetCategory?.substring(0, 3).toUpperCase() || 'RWA'}`,
      description: description,
      category: assetCategory,
      value: estimatedValue,
      type: tokenType,
      location: location,
      attributes: {
        category: assetCategory,
        estimatedValue: parseFloat(estimatedValue),
        tokenType: tokenType,
        location: location,
        createdAt: new Date().toISOString(),
        blockchain: 'Hedera',
        network: process.env.HEDERA_NETWORK || 'testnet'
      },
      external_url: `https://hashscan.io/${process.env.HEDERA_NETWORK || 'testnet'}/token/`,
      image: null
    };

    res.json(metadata);
  } catch (error) {
    console.error('Error generating metadata preview:', error);
    res.status(500).json({ 
      error: 'Failed to generate metadata preview', 
      message: error.message 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: error.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 RWA Tokenizer Backend running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`🌐 Network: ${process.env.HEDERA_NETWORK || 'testnet'}`);
  console.log(`🔗 Test connections: http://localhost:${PORT}/api/test/connections`);
});

module.exports = app; 