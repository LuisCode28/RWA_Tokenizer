# RWA Tokenizer Backend

A complete backend implementation for the RWA Tokenizer application that integrates with Hedera Mainnet for real-world asset tokenization.

## 🚀 Features

- **Hedera Token Service Integration**: Create NFTs and fungible tokens on Hedera Mainnet
- **Wallet Integration**: Support for Hedera-compatible wallets (HashPack, Blade)
- **Real-time Token Creation**: Direct integration with Hedera network
- **Database Storage**: SQLite database for token and transaction tracking
- **File Upload**: Image upload support for asset documentation
- **Metrics & Analytics**: Dashboard statistics and user analytics
- **HashScan Integration**: Direct links to transaction and token explorers

## 🛠️ Tech Stack

- **Node.js** with Express.js
- **Hedera JavaScript SDK** for blockchain integration
- **SQLite** for data persistence
- **Multer** for file uploads
- **CORS** for cross-origin requests

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Hedera Mainnet account with HBAR for transaction fees

## 🔧 Installation

1. **Clone and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file with the following variables:
   ```env
   HEDERA_NETWORK=mainnet
   HEDERA_ACCOUNT_ID=0.0.6446634
   HEDERA_PRIVATE_KEY=0xde10c18a218104ed131c3c9677eb350b1bd34eb6a34e136ff7866e89b538b97c
   HEDERA_EVM_ADDRESS=0x0a6b8655a08c1a39a5c49729ad672e3f99487f82
   PORT=3001
   NODE_ENV=development
   DB_PATH=./database/tokens.db
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3001`

## 📊 API Endpoints

### Health Check
- `GET /api/health` - Server health and network status

### Token Management
- `POST /api/tokenize` - Create a new token on Hedera
- `GET /api/tokens` - Get all tokens for a user
- `GET /api/token/:id` - Get specific token details

### Analytics & Metrics
- `GET /api/metrics` - Get platform-wide metrics for dashboard
- `POST /api/metadata-preview` - Generate metadata preview for token

## 🔗 Token Creation Process

1. **Form Submission**: Frontend sends token data via `POST /api/tokenize`
2. **Image Upload**: Optional image upload to IPFS via Pinata
3. **Hedera Integration**: Token creation on Hedera Testnet/Mainnet
4. **Database Storage**: Token and transaction records stored
5. **Response**: Success/failure with transaction details

## 🗄️ Database Schema

### Tokens Table
- `id` - Primary key
- `token_id` - Hedera token ID
- `asset_name` - Token name
- `asset_category` - Asset category (Art, Real Estate, etc.)
- `estimated_value` - Asset value in USD
- `token_type` - NFT or Fungible
- `description` - Asset description
- `location` - Asset location
- `image_path` - Local image path
- `metadata` - JSON metadata
- `status` - Pending, Minted, or Failed
- `user_account_id` - User's Hedera account
- `transaction_hash` - Hedera transaction hash
- `ipfs_hash` - IPFS hash for uploaded files
- `ipfs_url` - IPFS gateway URL
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Transactions Table
- `id` - Primary key
- `token_id` - Associated token ID
- `transaction_hash` - Hedera transaction hash
- `transaction_type` - Type of transaction
- `status` - Transaction status
- `user_account_id` - User account
- `amount` - Transaction amount
- `fee` - Transaction fee
- `ipfs_hash` - IPFS hash for transaction metadata
- `created_at` - Transaction timestamp

### Metrics Table
- `id` - Primary key
- `total_tokens` - Total tokens created
- `total_value` - Total value tokenized
- `active_users` - Number of active users
- `average_processing_time` - Average processing time
- `last_updated` - Last metrics update

## 🔐 Security Features

- **Environment Variables**: Sensitive data stored in `.env`
- **Input Validation**: Form data validation
- **File Upload Security**: Image type and size restrictions
- **Error Handling**: Comprehensive error handling and logging

## 🌐 Network Integration

- **Hedera Testnet/Mainnet**: Real blockchain integration
- **HashScan Links**: Direct links to transaction explorers
- **IPFS Support**: Real file storage on Pinata IPFS network

## 📈 Monitoring & Analytics

- **Real-time Metrics**: Dashboard statistics
- **Transaction Tracking**: Complete transaction history
- **User Analytics**: Per-user token statistics
- **Network Stats**: Hedera network statistics

## 🚀 Deployment

The backend is ready for deployment with:
- Environment variable configuration
- Database initialization
- Error handling and logging
- CORS configuration for frontend integration

## 🔗 Frontend Integration

The backend is designed to work seamlessly with the React frontend:
- CORS enabled for cross-origin requests
- RESTful API design
- JSON response format
- File upload support

## 📝 License

This project is part of the RWA Tokenizer application for Hedera hackathon. 