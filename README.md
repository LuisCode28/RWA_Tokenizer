# 🏗️ RWA Tokenizer - Hedera Mainnet Integration

A complete real-world asset tokenization platform built on Hedera blockchain with full frontend and backend integration.

## 🚀 Features

### Frontend (React + TypeScript)
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Real-time Dashboard**: Live metrics and statistics
- **Token Creation Form**: Complete asset tokenization workflow
- **My Tokens Management**: View and manage created tokens
- **HashScan Integration**: Direct links to blockchain explorers
- **Error Handling**: Comprehensive error states and loading indicators

### Backend (Node.js + Express)
- **Hedera Integration**: Direct connection to Hedera Mainnet
- **Token Service**: Create NFTs and fungible tokens
- **Database Storage**: SQLite for token and transaction tracking
- **File Upload**: Image upload support for assets
- **RESTful API**: Complete API for frontend integration
- **Metrics & Analytics**: Real-time dashboard statistics

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Router** for navigation

### Backend
- **Node.js** with Express.js
- **Hedera JavaScript SDK** for blockchain integration
- **SQLite** for data persistence
- **Multer** for file uploads
- **CORS** for cross-origin requests

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Hedera Mainnet account with HBAR for transaction fees

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd project
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
HEDERA_NETWORK=mainnet
HEDERA_ACCOUNT_ID=
HEDERA_PRIVATE_KEY=
HEDERA_EVM_ADDRESS=
PORT=
NODE_ENV=development
DB_PATH=./database/tokens.db
```

Start the backend server:
```bash
npm run dev
```

The backend will be available on your local development server

### 3. Frontend Setup
```bash
# From the project root
npm install
npm run dev
```

The frontend will be available on your local development server

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

1. **Form Submission**: User fills out tokenization form
2. **Image Upload**: Optional image upload to IPFS via Pinata
3. **Hedera Integration**: Token creation on Hedera Testnet/Mainnet
4. **Database Storage**: Token and transaction records stored
5. **Success Response**: Real token ID and HashScan links

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

## 🌐 Network Integration

- **Hedera Testnet/Mainnet**: Real blockchain integration
- **HashScan Links**: Direct links to transaction explorers
- **IPFS Support**: Real file storage on Pinata IPFS network

## 🔐 Security Features

- **Environment Variables**: Sensitive data stored in `.env`
- **Input Validation**: Form data validation
- **File Upload Security**: Image type and size restrictions
- **Error Handling**: Comprehensive error handling and logging

## 📈 Monitoring & Analytics

- **Real-time Metrics**: Dashboard statistics
- **Transaction Tracking**: Complete transaction history
- **User Analytics**: Per-user token statistics
- **Network Stats**: Hedera network statistics

## 🚀 Deployment

### Backend Deployment
The backend is ready for deployment with:
- Environment variable configuration
- Database initialization
- Error handling and logging
- CORS configuration for frontend integration

### Frontend Deployment
The frontend can be built and deployed:
```bash
npm run build
```

## 🎯 Key Features Demonstrated

### Hedera Integration
- ✅ Real token creation on Hedera Mainnet
- ✅ NFT and fungible token support
- ✅ Transaction hash tracking
- ✅ HashScan explorer integration

### User Experience
- ✅ Real-time form validation
- ✅ Loading states and error handling
- ✅ Success confirmations with transaction details
- ✅ Responsive design for all devices

### Data Management
- ✅ SQLite database for persistence
- ✅ Real-time metrics calculation
- ✅ Token status tracking
- ✅ User-specific token management

## 🔗 Links

- **Frontend**: Available on your local development server
- **Backend API**: Available on your local development server
- **API Health Check**: Available on your local development server
- **Hedera Network**: Testnet/Mainnet
- **Account ID**: Configured in environment variables

## 📝 License

This project is part of the RWA Tokenizer application for Hedera hackathon.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For questions or issues, please refer to the project documentation or create an issue in the repository. 