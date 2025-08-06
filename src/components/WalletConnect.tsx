import React, { useState, useEffect } from 'react';
import { Wallet, User, LogOut, AlertCircle, CheckCircle } from 'lucide-react';

interface WalletInfo {
  accountId: string;
  evmAddress: string;
  isConnected: boolean;
  network?: string;
  balance?: string;
}

interface WalletConnectProps {
  onWalletConnect: (walletInfo: WalletInfo) => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onWalletConnect }) => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({
    accountId: '',
    evmAddress: '',
    isConnected: false
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'failed'>('idle');
  const [hashPackAvailable, setHashPackAvailable] = useState(false);
  const [isCheckingHashPack, setIsCheckingHashPack] = useState(true);

  // Debug function to log all window objects
  const debugWindowObjects = () => {
    console.log('🔍 Debugging window objects...');
    console.log('window.hashconnect:', window.hashconnect);
    console.log('window.HashConnect:', window.HashConnect);
    console.log('window.HashPack:', window.HashPack);
    console.log('window.hashpack:', window.hashpack);
    console.log('window.__HASHPACK__:', (window as any).__HASHPACK__);
    
    // Check for HashConnect library
    console.log('window.HashConnectApp:', (window as any).HashConnectApp);
    console.log('window.hashconnectApp:', (window as any).hashconnectApp);
    
    // Check for common HashPack patterns
    console.log('window.hashpackWallet:', (window as any).hashpackWallet);
    console.log('window.HashPackWallet:', (window as any).HashPackWallet);
    
    // Log all window properties that might be HashPack related
    const hashPackKeys = Object.keys(window).filter(key => 
      key.toLowerCase().includes('hash') || 
      key.toLowerCase().includes('pack') ||
      key.toLowerCase().includes('connect') ||
      key.toLowerCase().includes('wallet')
    );
    console.log('HashPack related window keys:', hashPackKeys);
    
    // Log the actual objects
    hashPackKeys.forEach(key => {
      console.log(`window.${key}:`, (window as any)[key]);
    });
    
    // Check if any global object has HashPack methods
    const globalObjects = ['window', 'document', 'navigator'];
    globalObjects.forEach(objName => {
      const obj = (window as any)[objName];
      if (obj && typeof obj === 'object') {
        const hashPackMethods = Object.keys(obj).filter(key => 
          key.toLowerCase().includes('hash') || 
          key.toLowerCase().includes('pack') ||
          key.toLowerCase().includes('connect')
        );
        if (hashPackMethods.length > 0) {
          console.log(`${objName} HashPack methods:`, hashPackMethods);
        }
      }
    });
  };

  // Check if HashPack is installed - comprehensive detection
  const checkHashPackAvailability = () => {
    if (typeof window === 'undefined') return false;
    
    // Debug logging
    debugWindowObjects();
    
    // Comprehensive HashPack detection
    const hashPackObjects = [
      window.hashconnect,
      (window as any).hashconnect,
      window.HashConnect,
      (window as any).HashConnect,
      window.HashPack,
      (window as any).HashPack,
      window.hashpack,
      (window as any).hashpack,
      (window as any).__HASHPACK__,
      (window as any).HashConnectApp,
      (window as any).hashconnectApp,
      (window as any).hashpackWallet,
      (window as any).HashPackWallet
    ];
    
    // Check if any of these objects exist and have connect method
    const hasHashPack = hashPackObjects.some(obj => {
      return obj && typeof obj === 'object' && (
        typeof obj.connect === 'function' ||
        typeof obj.init === 'function' ||
        typeof obj.connectToExtension === 'function'
      );
    });
    
    console.log('HashPack detection result:', hasHashPack);
    return hasHashPack;
  };

  // Poll for HashPack availability
  useEffect(() => {
    console.log('🔍 Checking for HashPack extension...');
    
    // Initial check
    if (checkHashPackAvailability()) {
      console.log('✅ HashPack found immediately');
      setHashPackAvailable(true);
      setIsCheckingHashPack(false);
      return;
    }

    // Poll for HashPack if not found immediately
    const interval = setInterval(() => {
      console.log('🔄 Polling for HashPack...');
      if (checkHashPackAvailability()) {
        console.log('✅ HashPack found via polling');
        setHashPackAvailable(true);
        setIsCheckingHashPack(false);
        clearInterval(interval);
      }
    }, 1000); // Check every second

    // Stop polling after 10 seconds
    const timeout = setTimeout(() => {
      console.log('⏰ HashPack polling timeout');
      setIsCheckingHashPack(false);
      clearInterval(interval);
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Get HashPack instance - using HashConnect
  const getHashPack = () => {
    // Try HashConnect first (this is how HashPack actually works)
    if (window.hashconnect) return window.hashconnect;
    if ((window as any).hashconnect) return (window as any).hashconnect;
    if (window.HashConnect) return window.HashConnect;
    if ((window as any).HashConnect) return (window as any).HashConnect;
    
    // Fallback to direct HashPack objects
    if (window.HashPack) return window.HashPack;
    if ((window as any).HashPack) return (window as any).HashPack;
    if (window.hashpack) return window.hashpack;
    if ((window as any).hashpack) return (window as any).hashpack;
    
    // Check for any HashPack related object
    if ((window as any).__HASHPACK__) return (window as any).__HASHPACK__;
    
    return null;
  };

  // Connect to HashPack wallet - using HashConnect API
  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);
    setConnectionStatus('connecting');

    try {
      console.log('🔄 Connecting to HashPack wallet...');
      
      const hashconnect = getHashPack();
      
      // If HashPack is not detected, throw real error
      if (!hashconnect) {
        throw new Error('HashPack wallet is not installed. Please install HashPack extension first.');
      }

      console.log('✅ HashPack object found:', hashconnect);

      // Test connection to backend first, but don't fail if it's down
      let backendReady = false;
      try {
        const backendTest = await fetch('http://localhost:3001/api/test/connections');
        const backendResult = await backendTest.json();
        backendReady = backendResult.success;
      } catch (backendError) {
        console.log('⚠️ Backend not available, proceeding without backend check');
      }

      console.log('✅ Proceeding with wallet connection...');

      // Use HashConnect API to connect
      let connection;
      
      try {
        // Try HashConnect approach first
        if (hashconnect.connect) {
          console.log('Using hashconnect.connect()...');
          connection = await hashconnect.connect({
            network: 'testnet',
            topic: 'rwa-tokenizer',
            metadata: {
              name: 'RWA Tokenizer',
              description: 'Real World Asset Tokenization Platform',
              icon: `${window.location.origin}/icon.png`,
              url: window.location.origin
            }
          });
        } else if (hashconnect.init) {
          console.log('Using hashconnect.init() then connect()...');
          // Alternative HashConnect initialization
          await hashconnect.init();
          connection = await hashconnect.connect();
        } else {
          console.log('Using direct connection...');
          // Fallback to direct connection
          connection = await hashconnect.connect();
        }
      } catch (connectError) {
        console.log('HashConnect approach failed, trying direct connection...', connectError);
        // Try direct connection without parameters
        connection = await hashconnect.connect();
      }

      if (!connection || !connection.success) {
        throw new Error('Failed to connect to HashPack wallet. Please try again.');
      }

      // Extract account information
      const accountId = connection.accountId || connection.accountIds?.[0];
      const evmAddress = connection.evmAddress || connection.evmAddresses?.[0];
      const network = connection.network || 'testnet';
      
      if (!accountId || !evmAddress) {
        throw new Error('Failed to get account information from HashPack');
      }

      console.log('✅ Wallet connected successfully:', { accountId, evmAddress, network });

      // Get account balance from Hedera, but don't fail if backend is down
      let balance = 'Unknown';
      try {
        const balanceResponse = await fetch(`http://localhost:3001/api/test/hedera`);
        if (balanceResponse.ok) {
          const balanceResult = await balanceResponse.json();
          balance = balanceResult.success ? balanceResult.balance : 'Unknown';
        }
      } catch (balanceError) {
        console.log('⚠️ Backend not available, balance will be shown as Unknown');
      }
      
      const newWalletInfo: WalletInfo = {
        accountId,
        evmAddress,
        isConnected: true,
        network,
        balance: balance
      };
      
      setWalletInfo(newWalletInfo);
      onWalletConnect(newWalletInfo);
      setConnectionStatus('connected');
      
      console.log('🎉 Wallet connection completed successfully!');

    } catch (error) {
      console.error('❌ Wallet connection error:', error);
      setError(error instanceof Error ? error.message : 'Error connecting to wallet. Please try again.');
      setConnectionStatus('failed');
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setWalletInfo({
      accountId: '',
      evmAddress: '',
      isConnected: false
    });
    onWalletConnect({
      accountId: '',
      evmAddress: '',
      isConnected: false
    });
    setConnectionStatus('idle');
    setError(null);
  };

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/test/connections');
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}

      {!walletInfo.isConnected ? (
        <div className="text-center">
          <div className="mb-4">
            <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
            <p className="text-gray-600 text-sm mb-4">
              Connect your HashPack wallet to start tokenizing assets
            </p>
          </div>
          
          {/* Show loading while checking for HashPack */}
          {isCheckingHashPack && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <p className="text-blue-700 text-sm">Checking for HashPack extension...</p>
              </div>
            </div>
          )}
          
          {/* Show warning if HashPack not found */}
          {!isCheckingHashPack && !hashPackAvailable && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700 text-sm">
                HashPack extension not detected. Please install HashPack wallet extension first.
              </p>
              <a 
                href="https://www.hashpack.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm underline"
              >
                Install HashPack →
              </a>
            </div>
          )}
          
          <button
            onClick={connectWallet}
            disabled={isConnecting || isCheckingHashPack || !hashPackAvailable}
            className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Connecting...
              </>
            ) : isCheckingHashPack ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
                Checking Extension...
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4 mr-2" />
                Connect HashPack Wallet
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Connected</p>
                <p className="text-xs text-gray-500">HashPack Wallet - {walletInfo.network || 'testnet'}</p>
              </div>
            </div>
            <button
              onClick={disconnectWallet}
              className="text-gray-400 hover:text-gray-600"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div>
              <p className="text-xs text-gray-500">Account ID</p>
              <p className="text-sm font-mono text-gray-900">{walletInfo.accountId}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">EVM Address</p>
              <p className="text-sm font-mono text-gray-900 break-all">{walletInfo.evmAddress}</p>
            </div>
            {walletInfo.balance && (
              <div>
                <p className="text-xs text-gray-500">Balance</p>
                <p className="text-sm font-mono text-gray-900">{walletInfo.balance} HBAR</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Add HashConnect types to window object
declare global {
  interface Window {
    hashconnect?: {
      connect: (params?: {
        network?: string;
        topic?: string;
        metadata?: {
          name: string;
          description: string;
          icon: string;
          url: string;
        };
      }) => Promise<{
        success: boolean;
        accountId?: string;
        evmAddress?: string;
        accountIds?: string[];
        evmAddresses?: string[];
        network?: string;
      }>;
      init?: () => Promise<void>;
    };
    HashConnect?: {
      connect: (params?: any) => Promise<{
        success: boolean;
        accountId?: string;
        evmAddress?: string;
        accountIds?: string[];
        evmAddresses?: string[];
        network?: string;
      }>;
      init?: () => Promise<void>;
    };
    HashPack?: {
      connect: (params?: any) => Promise<{
        success: boolean;
        accountId?: string;
        evmAddress?: string;
        accountIds?: string[];
        evmAddresses?: string[];
        network?: string;
      }>;
    };
    hashpack?: {
      connect: (params?: any) => Promise<{
        success: boolean;
        accountId?: string;
        evmAddress?: string;
        accountIds?: string[];
        evmAddresses?: string[];
        network?: string;
      }>;
    };
  }
}

export default WalletConnect; 