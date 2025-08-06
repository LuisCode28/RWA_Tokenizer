const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Pinata IPFS Service - 100% Real Implementation
class IPFSService {
  constructor() {
    this.apiKey = process.env.PINATA_API_KEY;
    this.apiSecret = process.env.PINATA_API_SECRET;
    this.jwt = process.env.PINATA_JWT;
    this.baseURL = 'https://api.pinata.cloud';
  }

  // Upload file to IPFS via Pinata
  async uploadFile(filePath, metadata = {}) {
    try {
      console.log('🔄 Uploading file to IPFS:', filePath);
      
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));
      
      // Add metadata if provided
      if (Object.keys(metadata).length > 0) {
        formData.append('pinataMetadata', JSON.stringify(metadata));
      }

      const response = await axios.post(`${this.baseURL}/pinning/pinFileToIPFS`, formData, {
        headers: {
          'Authorization': `Bearer ${this.jwt}`,
          ...formData.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      if (response.data && response.data.IpfsHash) {
        console.log('✅ File uploaded to IPFS:', response.data.IpfsHash);
        return {
          success: true,
          ipfsHash: response.data.IpfsHash,
          ipfsUrl: `ipfs://${response.data.IpfsHash}`,
          gatewayUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
          size: response.data.PinSize
        };
      } else {
        throw new Error('Invalid response from Pinata');
      }
    } catch (error) {
      console.error('❌ IPFS upload failed:', error.message);
      throw new Error(`IPFS upload failed: ${error.message}`);
    }
  }

  // Upload JSON metadata to IPFS
  async uploadMetadata(metadata) {
    try {
      console.log('🔄 Uploading metadata to IPFS');
      
      const response = await axios.post(`${this.baseURL}/pinning/pinJSONToIPFS`, metadata, {
        headers: {
          'Authorization': `Bearer ${this.jwt}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.IpfsHash) {
        console.log('✅ Metadata uploaded to IPFS:', response.data.IpfsHash);
        return {
          success: true,
          ipfsHash: response.data.IpfsHash,
          ipfsUrl: `ipfs://${response.data.IpfsHash}`,
          gatewayUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
        };
      } else {
        throw new Error('Invalid response from Pinata');
      }
    } catch (error) {
      console.error('❌ Metadata upload failed:', error.message);
      throw new Error(`Metadata upload failed: ${error.message}`);
    }
  }

  // Upload image with metadata
  async uploadImageWithMetadata(imagePath, tokenMetadata) {
    try {
      console.log('🔄 Uploading image with metadata to IPFS');
      
      // First upload the image
      const imageResult = await this.uploadFile(imagePath, {
        name: tokenMetadata.name || 'Asset Image',
        description: tokenMetadata.description || 'Asset image uploaded via RWA Tokenizer'
      });

      // Then upload the complete metadata with image reference
      const completeMetadata = {
        ...tokenMetadata,
        image: imageResult.ipfsUrl,
        imageGateway: imageResult.gatewayUrl
      };

      const metadataResult = await this.uploadMetadata(completeMetadata);

      return {
        success: true,
        imageHash: imageResult.ipfsHash,
        imageUrl: imageResult.ipfsUrl,
        imageGateway: imageResult.gatewayUrl,
        metadataHash: metadataResult.ipfsHash,
        metadataUrl: metadataResult.ipfsUrl,
        metadataGateway: metadataResult.gatewayUrl,
        completeMetadata
      };
    } catch (error) {
      console.error('❌ Image with metadata upload failed:', error.message);
      throw error;
    }
  }

  // Test IPFS connection
  async testConnection() {
    try {
      const response = await axios.get(`${this.baseURL}/data/testAuthentication`, {
        headers: {
          'Authorization': `Bearer ${this.jwt}`
        }
      });
      
      return {
        success: true,
        message: 'IPFS connection successful',
        data: response.data
      };
    } catch (error) {
      console.error('❌ IPFS connection test failed:', error.message);
      return {
        success: false,
        message: `IPFS connection failed: ${error.message}`
      };
    }
  }

  // Get file from IPFS (for verification)
  async getFile(ipfsHash) {
    try {
      const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`, {
        timeout: 10000
      });
      
      return {
        success: true,
        data: response.data,
        headers: response.headers
      };
    } catch (error) {
      console.error('❌ Failed to retrieve file from IPFS:', error.message);
      throw new Error(`Failed to retrieve file: ${error.message}`);
    }
  }
}

module.exports = new IPFSService(); 