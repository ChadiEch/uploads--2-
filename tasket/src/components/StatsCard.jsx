import React from 'react';

const StatsCard = ({ title, value, description, icon, color }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center">
        <div className={`${color} rounded-full p-3 mr-4`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 text-2xl">{value}</h3>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-xs text-gray-400 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
