import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AreaChartComponent = ({ data = [] }) => {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip 
            formatter={(value, name) => {
              const labels = {
                'completed': 'Completed Tasks',
                'created': 'Created Tasks',
                'inProgress': 'In Progress Tasks'
              };
              return [value, labels[name] || name];
            }}
          />
          <Area 
            type="monotone" 
            dataKey="completed" 
            stackId="1"
            stroke="#3B82F6" 
            fill="#3B82F6" 
            fillOpacity={0.7} 
          />
          <Area 
            type="monotone" 
            dataKey="created" 
            stackId="2"
            stroke="#10B981" 
            fill="#10B981" 
            fillOpacity={0.6} 
          />
          <Area 
            type="monotone" 
            dataKey="inProgress" 
            stackId="3"
            stroke="#F59E0B" 
            fill="#F59E0B" 
            fillOpacity={0.5} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AreaChartComponent;
export { AreaChartComponent as AreaChart };
