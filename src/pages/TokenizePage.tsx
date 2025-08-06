import React, { useState, useEffect } from 'react';
import { Upload, Eye, TrendingUp, Coins, CheckCircle, BarChart3, Users, Clock, DollarSign, Loader2, AlertCircle } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import WalletConnect from '../components/WalletConnect';

interface TokenForm {
  assetCategory: string;
  tokenType: string;
  assetName: string;
  description: string;
  estimatedValue: string;
  location: string;
  imageFile: File | null;
}

interface WalletInfo {
  accountId: string;
  evmAddress: string;
  isConnected: boolean;
}

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAnother: () => void;
  tokenData?: {
    tokenId: string;
    transactionHash: string;
    hashscanUrl: string;
    status: string;
  };
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, onCreateAnother, tokenData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl border border-gray-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Token Created Successfully
          </h2>
          
          <p className="text-gray-600 mb-6">
            Your asset has been tokenized on Hedera blockchain
          </p>
          
          {tokenData && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left border">
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700">Token ID</p>
                <p className="font-mono text-sm text-gray-900 bg-white px-2 py-1 rounded border">{tokenData.tokenId}</p>
              </div>
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700">Transaction Hash</p>
                <p className="font-mono text-sm text-gray-900 bg-white px-2 py-1 rounded border break-all">{tokenData.transactionHash}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">HashScan Explorer</p>
                <a 
                  href={tokenData.hashscanUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 break-all"
                >
                  View on HashScan →
                </a>
              </div>
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={onCreateAnother}
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Another
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TokenizePage: React.FC = () => {
  const [form, setForm] = useState<TokenForm>({
    assetCategory: 'Art',
    tokenType: 'NFT',
    assetName: '',
    description: '',
    estimatedValue: '',
    location: '',
    imageFile: null
  });

  const [showPreview, setShowPreview] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [tokenData, setTokenData] = useState<any>(null);
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({
    accountId: '',
    evmAddress: '',
    isConnected: false
  });

  // Fetch metrics on component mount
  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      } else {
        console.log('⚠️ Backend metrics not available, using default metrics');
        setMetrics({
          totalTokens: 0,
          totalValue: 0,
          uniqueUsers: 0,
          averageProcessingTime: 0
        });
      }
    } catch (error) {
      console.log('⚠️ Backend not available, using default metrics');
      setMetrics({
        totalTokens: 0,
        totalValue: 0,
        uniqueUsers: 0,
        averageProcessingTime: 0
      });
    }
  };

  const handleWalletConnect = (walletInfo: WalletInfo) => {
    setWalletInfo(walletInfo);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm({
      ...form,
      imageFile: file
    });
  };

  const handleCreateToken = async () => {
    if (!walletInfo.isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!form.assetName || !form.estimatedValue) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Real token creation - requires backend
      const formData = new FormData();
      formData.append('assetCategory', form.assetCategory);
      formData.append('estimatedValue', form.estimatedValue);
      formData.append('tokenType', form.tokenType);
      formData.append('assetName', form.assetName);
      formData.append('description', form.description);
      formData.append('location', form.location);
      formData.append('userAccountId', walletInfo.accountId);

      if (form.imageFile) {
        formData.append('image', form.imageFile);
      }

      const response = await fetch('http://localhost:3001/api/tokenize', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Token creation failed. Please ensure the backend server is running.');
      }

      if (result.success) {
        setTokenData({
          tokenId: result.tokenId,
          transactionHash: result.transactionHash,
          hashscanUrl: result.hashscanUrl,
          status: result.status
        });
        setShowSuccessModal(true);
        fetchMetrics(); // Refresh metrics after successful token creation
      } else {
        setError(result.error || 'Token creation failed');
      }
    } catch (error) {
      console.error('Error creating token:', error);
      setError(error instanceof Error ? error.message : 'Token creation failed. Please ensure the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAnother = () => {
    setShowSuccessModal(false);
    setForm({
      assetCategory: 'Art',
      tokenType: 'NFT',
      assetName: '',
      description: '',
      estimatedValue: '',
      location: '',
      imageFile: null
    });
    setShowPreview(false);
    setError(null);
  };

  const generateMetadata = () => {
    const metadata = {
      name: form.assetName || "Untitled Asset",
      description: form.description || "No description provided",
      image: form.imageFile ? `ipfs://${form.imageFile.name}` : null,
      attributes: [
        {
          trait_type: "Asset Category",
          value: form.assetCategory
        },
        {
          trait_type: "Token Type", 
          value: form.tokenType === 'NFT' ? 'Non-Fungible Token (1/1)' : 'Fungible Token (Divisible)'
        },
        {
          trait_type: "Estimated Value",
          value: form.estimatedValue ? `$${Number(form.estimatedValue).toLocaleString()}` : "Not specified"
        },
        ...(form.location ? [{
          trait_type: "Location",
          value: form.location
        }] : []),
        {
          trait_type: "Created On",
          value: new Date().toISOString().split('T')[0]
        },
        {
          trait_type: "Blockchain",
          value: "Hedera"
        }
      ],
      external_url: window.location.origin,
      creator: walletInfo.accountId || "Unknown"
    };

    return metadata;
  };

  const shouldShowImageUpload = form.assetCategory === 'Art' || form.assetCategory === 'Vehicle';

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Asset Tokenization Dashboard</h1>
              <p className="text-gray-600 mt-2">Create and manage your tokenized real-world assets on Hedera blockchain</p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Network Status</p>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-gray-900">Hedera Mainnet</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Tokens Created"
            value={metrics?.totalTokens?.toString() || "0"}
            icon={Coins}
          />
          <StatsCard
            title="Total Value Tokenized"
            value={metrics?.totalValue ? `$${Number(metrics.totalValue).toLocaleString()}` : "$0"}
            icon={DollarSign}
          />
          <StatsCard
            title="Active Users"
            value={metrics?.uniqueUsers?.toString() || "0"}
            icon={Users}
          />
          <StatsCard
            title="Avg Processing Time"
            value={metrics?.averageProcessingTime ? `${Math.round(metrics.averageProcessingTime)}s` : "0s"}
            icon={Clock}
          />
        </div>

        {/* Wallet Connection */}
        <div className="mb-8">
          <WalletConnect onWalletConnect={handleWalletConnect} />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Tokenization Form - Only show if wallet is connected */}
        {walletInfo.isConnected ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Tokenization Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Token</h2>
              
              <div className="space-y-6">
                {/* Asset Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asset Category
                  </label>
                  <select
                    name="assetCategory"
                    value={form.assetCategory}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Art">Art</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Vehicle">Vehicle</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Estimated Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Value (USD)
                  </label>
                  <input
                    type="number"
                    name="estimatedValue"
                    value={form.estimatedValue}
                    onChange={handleInputChange}
                    placeholder="Enter estimated value"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Token Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Token Type
                  </label>
                  <select
                    name="tokenType"
                    value={form.tokenType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="NFT">NFT (Non-Fungible)</option>
                    <option value="Fungible">Fungible (Divisible)</option>
                  </select>
                </div>

                {/* Asset Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asset Name
                  </label>
                  <input
                    type="text"
                    name="assetName"
                    value={form.assetName}
                    onChange={handleInputChange}
                    placeholder="Enter asset name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    placeholder="Enter asset description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleInputChange}
                    placeholder="Enter asset location"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Image Upload */}
                {shouldShowImageUpload && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Asset Image (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {form.imageFile ? form.imageFile.name : "Click to upload image"}
                        </p>
                      </label>
                    </div>
                  </div>
                )}

                {/* Create Token Button */}
                <button
                  onClick={handleCreateToken}
                  disabled={isLoading || !form.assetName || !form.estimatedValue}
                  className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Creating Token...
                    </>
                  ) : (
                    'Create Token on Hedera'
                  )}
                </button>
              </div>
            </div>

            {/* Metadata Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Metadata Preview</h2>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {showPreview ? 'Hide' : 'Show'} Preview
                </button>
              </div>

              {showPreview && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-800 overflow-auto">
                    {JSON.stringify(generateMetadata(), null, 2)}
                  </pre>
                </div>
              )}

              {!showPreview && (
                <div className="text-center py-8">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Click "Show Preview" to see the metadata</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md mx-auto">
              <div className="mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coins className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
                <p className="text-gray-600 text-sm">
                  Please connect your HashPack wallet above to start tokenizing assets
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onCreateAnother={handleCreateAnother}
        tokenData={tokenData}
      />
    </>
  );
};

export default TokenizePage;