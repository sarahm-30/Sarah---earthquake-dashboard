import React, { useState, useContext, useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { EarthquakeContext } from '../App';

const useEarthquakeContext = () => {
  const context = useContext(EarthquakeContext);
  if (!context) {
    throw new Error('useEarthquakeContext must be used within EarthquakeProvider');
  }
  return context;
};

const EarthquakeChart = ({ data, onPointClick }) => {
  const [xAxis, setXAxis] = useState('magnitude');
  const [yAxis, setYAxis] = useState('depth');
  const { selectedEarthquake } = useEarthquakeContext();

  const numericFields = [
    { key: 'magnitude', label: 'Magnitude' },
    { key: 'depth', label: 'Depth (km)' },
    { key: 'latitude', label: 'Latitude' },
    { key: 'longitude', label: 'Longitude' },
    { key: 'gap', label: 'Gap' },
    { key: 'rms', label: 'RMS' }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="chart-tooltip">
          <p><strong>Location:</strong> {data.location}</p>
          <p><strong>Magnitude:</strong> {data.magnitude}</p>
          <p><strong>Depth:</strong> {data.depth} km</p>
          <p><strong>Time:</strong> {new Date(data.time).toLocaleDateString()}</p>
        </div>
      );
    }
    return null;
  };

  // Memoize the cell elements
  const scatterCells = useMemo(() => {
    return data.map((entry, index) => {
      const isSelected = selectedEarthquake?.id === entry.id;
      return (
        <Cell
          key={`cell-${index}`}
         fill={isSelected ? '#FF0000' : '#ADD8E6'}

          r={isSelected ? 8 : 5}
        />
      );
    });
  }, [data, selectedEarthquake]);

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h2 className="chart-title">Earthquake Visualization</h2>
        <div className="chart-controls">
          <select
            value={xAxis}
            onChange={(e) => setXAxis(e.target.value)}
            className="chart-select"
          >
            {numericFields.map(field => (
              <option key={field.key} value={field.key}>{field.label}</option>
            ))}
          </select>
          <select
            value={yAxis}
            onChange={(e) => setYAxis(e.target.value)}
            className="chart-select"
          >
            {numericFields.map(field => (
              <option key={field.key} value={field.key}>{field.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="chart-wrapper">
        {data && data.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
              <XAxis
                type="number"
                dataKey={xAxis}
                name={numericFields.find(f => f.key === xAxis)?.label}
                stroke="#FFFFFF"
              />
              <YAxis
                type="number"
                dataKey={yAxis}
                name={numericFields.find(f => f.key === yAxis)?.label}
                stroke="#FFFFFF"
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter
                data={data}
                fill="#FF0000"
                onClick={onPointClick}
                style={{ cursor: 'pointer' }}
              >
                {scatterCells}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default React.memo(EarthquakeChart);
