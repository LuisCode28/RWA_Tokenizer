import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
  change?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend = 'neutral',
  change 
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className="flex items-center mt-1">
              {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500 mr-1" />}
              {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500 mr-1" />}
              <span className={`text-xs ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                {change}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;