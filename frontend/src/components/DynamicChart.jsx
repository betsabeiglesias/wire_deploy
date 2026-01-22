// frontend/src/components/DynamicChart.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTagHistory } from '../hooks/useTagHistory';

export default function DynamicChart({ 
  equipmentId, 
  variable, 
  title,
  height = 300,
  color = '#8884d8',
  refreshInterval = 10000
}) {
  const { data, loading, error } = useTagHistory(equipmentId, variable, {
    start: '-12h',
    window: '30s',
    refreshInterval
  });

  if (loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Cargando datos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">{title || variable}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
            minTickGap={30}
          />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            name={variable}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}