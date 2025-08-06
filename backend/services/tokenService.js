const {
  Client,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  PrivateKey,
  AccountId,
  Hbar,
  TokenId,
  TokenUpdateTransaction
} = require('@hashgraph/sdk');
const { getDatabase } = require('../database/init');
const ipfsService = require('./ipfsService');
const fs = require('fs');

// Initialize Hedera client with real credentials
function getHederaClient() {
  try {
    const accountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
    const privateKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
    
    const network = process.env.HEDERA_NETWORK || 'testnet';
    const client = network === 'mainnet' 
      ? Client.forMainnet() 
      : Client.forTestnet();
    
    client.setOperator(accountId, privateKey);
    
    console.log(`✅ Hedera client initialized for ${network}`);
    return client;
  } catch (error) {
    console.error('❌ Failed to initialize Hedera client:', error.message);
    throw new Error(`Hedera client initialization failed: ${error.message}`);
  }
}

// Create token on Hedera blockchain - 100% Real Implementation
async function createTokenOnHedera(tokenData, ipfsMetadata) {
  const client = getHederaClient();
  
  try {
    console.log('🔄 Creating token on Hedera blockchain...');
    
    const {
      assetName,
      assetCategory,
      estimatedValue,
      tokenType,
      description,
      location
    } = tokenData;

    // Create token transaction with real parameters
    const tokenCreateTransaction = new TokenCreateTransaction()
      .setTokenName(assetName)
      .setTokenSymbol(`${assetCategory?.substring(0, 3).toUpperCase() || 'RWA'}`)
      .setTokenType(tokenType === 'NFT' ? TokenType.NonFungibleUnique : TokenType.FungibleCommon)
      .setDecimals(tokenType === 'NFT' ? 0 : 0) // NFTs have 0 decimals
      .setInitialSupply(tokenType === 'NFT' ? 0 : Math.floor(estimatedValue)) // NFTs start with 0 supply
      .setSupplyType(TokenSupplyType.Finite)
      .setMaxSupply(tokenType === 'NFT' ? 1 : Math.floor(estimatedValue))
      .setTreasuryAccountId(AccountId.fromString(process.env.HEDERA_ACCOUNT_ID))
      .setTokenMemo(JSON.stringify({
        ...ipfsMetadata,
        category: assetCategory,
        estimatedValue: estimatedValue,
        tokenType: tokenType,
        location: location,
        createdAt: new Date().toISOString(),
        blockchain: 'Hedera',
        network: process.env.HEDERA_NETWORK || 'testnet'
      }))
      .setMaxTransactionFee(new Hbar(2));

    // Sign and execute the transaction
    console.log('📝 Signing and executing token creation transaction...');
    const tokenCreateResponse = await tokenCreateTransaction.execute(client);
    const tokenCreateReceipt = await tokenCreateResponse.getReceipt(client);
    const tokenId = tokenCreateReceipt.tokenId;

    console.log(`✅ Token created successfully! Token ID: ${tokenId}`);

    // If it's an NFT, mint the token with metadata
    if (tokenType === 'NFT') {
      console.log('🔄 Minting NFT with metadata...');
      
      const tokenMintTransaction = new TokenMintTransaction()
        .setTokenId(tokenId)
        .setMetadata([Buffer.from(JSON.stringify(ipfsMetadata))]);

      const mintResponse = await tokenMintTransaction.execute(client);
      const mintReceipt = await mintResponse.getReceipt(client);
      
      console.log(`✅ NFT minted successfully. Token ID: ${tokenId}, Serial Number: ${mintReceipt.serials[0]}`);
    }

    // Get transaction hash for verification
    const transactionHash = tokenCreateResponse.transactionHash;
    const hashscanUrl = `https://hashscan.io/${process.env.HEDERA_NETWORK || 'testnet'}/transaction/${transactionHash}`;
    const tokenUrl = `https://hashscan.io/${process.env.HEDERA_NETWORK || 'testnet'}/token/${tokenId}`;

    return {
      tokenId: tokenId.toString(),
      transactionHash: transactionHash,
      metadata: ipfsMetadata,
      status: 'Minted',
      hashscanUrl: hashscanUrl,
      tokenUrl: tokenUrl,
      network: process.env.HEDERA_NETWORK || 'testnet'
    };

  } catch (error) {
    console.error('❌ Error creating token on Hedera:', error);
    throw new Error(`Token creation failed: ${error.message}`);
  } finally {
    client.close();
  }
}

// Main tokenization function - 100% Real Implementation
async function tokenizeAsset(tokenData) {
  const db = getDatabase();
  
  try {
    console.log('🚀 Starting real tokenization process...');
    
    // Step 1: Upload to IPFS if image is provided
    let ipfsResult = null;
    if (tokenData.imagePath && fs.existsSync(tokenData.imagePath)) {
      console.log('📤 Uploading image to IPFS...');
      
      const tokenMetadata = {
        name: tokenData.assetName,
        symbol: `${tokenData.assetCategory?.substring(0, 3).toUpperCase() || 'RWA'}`,
        description: tokenData.description,
        category: tokenData.assetCategory,
        value: tokenData.estimatedValue,
        type: tokenData.tokenType,
        location: tokenData.location,
        attributes: {
          category: tokenData.assetCategory,
          estimatedValue: tokenData.estimatedValue,
          tokenType: tokenData.tokenType,
          location: tokenData.location,
          createdAt: new Date().toISOString(),
          blockchain: 'Hedera',
          network: process.env.HEDERA_NETWORK || 'testnet'
        }
      };

      ipfsResult = await ipfsService.uploadImageWithMetadata(tokenData.imagePath, tokenMetadata);
      console.log('✅ IPFS upload completed');
    } else {
      // Create metadata without image
      const tokenMetadata = {
        name: tokenData.assetName,
        symbol: `${tokenData.assetCategory?.substring(0, 3).toUpperCase() || 'RWA'}`,
        description: tokenData.description,
        category: tokenData.assetCategory,
        value: tokenData.estimatedValue,
        type: tokenData.tokenType,
        location: tokenData.location,
        attributes: {
          category: tokenData.assetCategory,
          estimatedValue: tokenData.estimatedValue,
          tokenType: tokenData.tokenType,
          location: tokenData.location,
          createdAt: new Date().toISOString(),
          blockchain: 'Hedera',
          network: process.env.HEDERA_NETWORK || 'testnet'
        }
      };

      ipfsResult = await ipfsService.uploadMetadata(tokenMetadata);
      console.log('✅ Metadata uploaded to IPFS');
    }

    // Step 2: Create token on Hedera blockchain
    console.log('⛓️ Creating token on Hedera blockchain...');
    const hederaResult = await createTokenOnHedera(tokenData, ipfsResult.completeMetadata || ipfsResult);
    
    // Step 3: Store in database
    return new Promise((resolve, reject) => {
      const {
        assetName,
        assetCategory,
        estimatedValue,
        tokenType,
        description,
        location,
        imagePath,
        userAccountId
      } = tokenData;

      const insertQuery = `
        INSERT INTO tokens (
          token_id, asset_name, asset_category, estimated_value, token_type,
          description, location, image_path, metadata, status, user_account_id,
          transaction_hash, ipfs_hash, ipfs_url, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;

      const metadata = {
        ...hederaResult.metadata,
        ipfsResult: ipfsResult,
        hederaResult: hederaResult
      };
      
      db.run(insertQuery, [
        hederaResult.tokenId,
        assetName,
        assetCategory,
        estimatedValue,
        tokenType,
        description,
        location,
        imagePath,
        JSON.stringify(metadata),
        hederaResult.status,
        userAccountId,
        hederaResult.transactionHash,
        ipfsResult?.metadataHash || null,
        ipfsResult?.metadataGateway || null
      ], function(err) {
        if (err) {
          console.error('❌ Error storing token in database:', err);
          reject(err);
          return;
        }

        // Store transaction record
        const transactionQuery = `
          INSERT INTO transactions (
            token_id, transaction_hash, transaction_type, status, user_account_id,
            amount, fee, ipfs_hash, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `;

        db.run(transactionQuery, [
          hederaResult.tokenId,
          hederaResult.transactionHash,
          'TOKEN_CREATE',
          'Completed',
          userAccountId,
          estimatedValue,
          0.001, // Estimated fee
          ipfsResult?.metadataHash || null
        ], function(err) {
          if (err) {
            console.error('❌ Error storing transaction:', err);
          }

          const result = {
            success: true,
            tokenId: hederaResult.tokenId,
            transactionHash: hederaResult.transactionHash,
            status: hederaResult.status,
            metadata: metadata,
            hashscanUrl: hederaResult.hashscanUrl,
            tokenUrl: hederaResult.tokenUrl,
            ipfsResult: ipfsResult,
            network: hederaResult.network,
            message: `Token created successfully on Hedera ${hederaResult.network}`
          };

          console.log('✅ Tokenization completed successfully!');
          console.log(`📊 Token ID: ${hederaResult.tokenId}`);
          console.log(`🔗 HashScan: ${hederaResult.hashscanUrl}`);
          console.log(`🌐 IPFS: ${ipfsResult?.metadataGateway || 'No IPFS'}`);
          
          resolve(result);
        });
      });
    });

  } catch (error) {
    console.error('❌ Tokenization failed:', error);
    
    // Store failed attempt in database
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      const insertQuery = `
        INSERT INTO tokens (
          token_id, asset_name, asset_category, estimated_value, token_type,
          description, location, image_path, metadata, status, user_account_id,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;

      const metadata = {
        name: tokenData.assetName,
        description: tokenData.description,
        category: tokenData.assetCategory,
        value: tokenData.estimatedValue,
        type: tokenData.tokenType,
        location: tokenData.location,
        error: error.message,
        timestamp: new Date().toISOString()
      };

      db.run(insertQuery, [
        null, // No token ID for failed attempts
        tokenData.assetName,
        tokenData.assetCategory,
        tokenData.estimatedValue,
        tokenData.tokenType,
        tokenData.description,
        tokenData.location,
        tokenData.imagePath,
        JSON.stringify(metadata),
        'Failed',
        tokenData.userAccountId
      ], function(err) {
        if (err) {
          console.error('❌ Error storing failed token:', err);
        }

        resolve({
          success: false,
          error: error.message,
          status: 'Failed'
        });
      });
    });
  }
}

// Test Hedera connection
async function testHederaConnection() {
  try {
    const client = getHederaClient();
    const accountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
    
    // Get account info to test connection
    const accountInfo = await client.getAccountInfo(accountId);
    
    return {
      success: true,
      message: 'Hedera connection successful',
      accountId: accountId.toString(),
      balance: accountInfo.balance.toString(),
      network: process.env.HEDERA_NETWORK || 'testnet'
    };
  } catch (error) {
    console.error('❌ Hedera connection test failed:', error.message);
    return {
      success: false,
      message: `Hedera connection failed: ${error.message}`
    };
  }
}

module.exports = {
  tokenizeAsset,
  createTokenOnHedera,
  getHederaClient,
  testHederaConnection
}; 