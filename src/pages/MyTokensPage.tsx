import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, ExternalLink, Coins, TrendingUp, Calendar, MapPin, Loader2, AlertCircle } from 'lucide-react';
import WalletConnect from '../components/WalletConnect';

interface Token {
  id: number;
  tokenId: string;
  assetName: string;
  assetCategory: string;
  estimatedValue: number;
  tokenType: string;
  description: string;
  location: string;
  imagePath: string;
  metadata: any;
  status: string;
  userAccountId: string;
  transactionHash: string;
  createdAt: string;
  updatedAt: string;
  hashscanUrl: string;
}

interface WalletInfo {
  accountId: string;
  evmAddress: string;
  isConnected: boolean;
}

const MyTokensPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({
    accountId: '',
    evmAddress: '',
    isConnected: false
  });

  // Fetch tokens when wallet connects
  useEffect(() => {
    if (walletInfo.isConnected) {
      fetchTokens();
    } else {
      setTokens([]);
      setIsLoading(false);
    }
  }, [walletInfo.isConnected, walletInfo.accountId]);

  const handleWalletConnect = (walletInfo: WalletInfo) => {
    setWalletInfo(walletInfo);
  };

  const fetchTokens = async () => {
    if (!walletInfo.isConnected) return;

    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:3001/api/tokens?userAccountId=${walletInfo.accountId}`);
      if (response.ok) {
        const data = await response.json();
        setTokens(data);
      } else {
        setError('Failed to fetch tokens');
      }
    } catch (error) {
      console.error('Error fetching tokens:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTokens = tokens.filter(token => {
    const matchesSearch = token.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         token.assetCategory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'All' || token.tokenType === filterType;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Minted': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Minted': return '✅';
      case 'Pending': return '⏳';
      case 'Failed': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Tokens</h1>
        <p className="text-gray-600 mt-2">Manage and track your tokenized assets on Hedera blockchain</p>
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

      {/* Content based on wallet connection */}
      {!walletInfo.isConnected ? (
        <div className="text-center py-12">
          <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md mx-auto">
            <div className="mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coins className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
              <p className="text-gray-600 text-sm">
                Please connect your HashPack wallet above to view your tokens
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Coins className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Tokens</p>
                  <p className="text-2xl font-bold text-gray-900">{tokens.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${tokens.reduce((sum, token) => sum + token.estimatedValue, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Tokens</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tokens.filter(t => t.status === 'Minted').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <MapPin className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Categories</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(tokens.map(t => t.assetCategory)).size}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tokens by name or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="All">All Types</option>
                    <option value="NFT">NFT</option>
                    <option value="Fungible">Fungible</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading your tokens...</span>
            </div>
          )}

          {/* Tokens Grid */}
          {!isLoading && filteredTokens.length === 0 && (
            <div className="text-center py-12">
              <Coins className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tokens found</h3>
              <p className="text-gray-500">
                {tokens.length === 0 
                  ? "You haven't created any tokens yet. Start by creating your first tokenized asset."
                  : "No tokens match your search criteria."
                }
              </p>
            </div>
          )}

          {!isLoading && filteredTokens.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTokens.map((token) => (
                <div key={token.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    {/* Token Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">{token.assetName}</h3>
                        <p className="text-sm text-gray-500">{token.assetCategory}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(token.status)}`}>
                        {getStatusIcon(token.status)} {token.status}
                      </span>
                    </div>

                    {/* Token Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Type:</span>
                        <span className="text-sm font-medium text-gray-900">{token.tokenType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Value:</span>
                        <span className="text-sm font-medium text-gray-900">${token.estimatedValue.toLocaleString()}</span>
                      </div>
                      {token.location && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Location:</span>
                          <span className="text-sm text-gray-900">{token.location}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Created:</span>
                        <span className="text-sm text-gray-900">
                          {new Date(token.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Token ID */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Token ID</p>
                      <p className="font-mono text-xs bg-gray-100 px-2 py-1 rounded border break-all">
                        {token.tokenId || 'Pending...'}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      {token.hashscanUrl && (
                        <a
                          href={token.hashscanUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View on HashScan
                        </a>
                      )}
                      <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyTokensPage;