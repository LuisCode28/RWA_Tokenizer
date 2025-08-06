import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Coins, User } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Coins className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">RWA Tokenizer</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`hover:text-blue-600 ${isActive('/') ? 'text-blue-600' : 'text-gray-500'}`}
            >
              Dashboard
            </Link>
            <Link
              to="/my-tokens"
              className={`hover:text-blue-600 ${isActive('/my-tokens') ? 'text-blue-600' : 'text-gray-500'}`}
            >
              My Tokens
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-full">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">Hedera Network</p>
                <p className="text-xs text-gray-500">Mainnet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;