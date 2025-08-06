import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Shield, Zap, Globe } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="ml-2 text-lg font-bold text-gray-900">RWA Tokenizer</span>
            </div>
            <p className="text-gray-600 mb-4 max-w-md">
              Professional tokenization platform for real-world assets on Hedera blockchain. 
              Secure, compliant, and enterprise-ready.
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-500">
                <Zap className="h-4 w-4 mr-1 text-green-500" />
                99.9% Uptime
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Shield className="h-4 w-4 mr-1 text-blue-500" />
                SOC 2 Compliant
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Platform
            </h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-600 hover:text-blue-600">Dashboard</Link></li>
              <li><Link to="/my-tokens" className="text-gray-600 hover:text-blue-600">My Tokens</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="https://hedera.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 flex items-center">
                  Hedera Network
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
              <li>
                <a href="https://hashscan.io" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 flex items-center">
                  HashScan Explorer
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <span>© 2025 RWA Tokenizer. All rights reserved.</span>
            <div className="flex items-center">
              <Globe className="h-4 w-4 mr-1" />
              <span>Powered by Hedera</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;