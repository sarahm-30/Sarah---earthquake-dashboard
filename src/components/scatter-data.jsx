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

// Custom hook to safely access EarthquakeContext

const useEarthquakeContext = () => {
  const context = useContext(EarthquakeContext);
  if (!context) {
    throw new Error('useEarthquakeContext must be used within EarthquakeProvider');
  }
  return context;
};


const MAX_POINTS = 500;

// Main component for rendering earthquake data as a scatter chart
const EarthquakeChart = ({ data, onPointClick }) => {
  // State to keep track of selected X and Y axis fields for the scatter plot
  const [xAxis, setXAxis] = useState('magnitude');
  const [yAxis, setYAxis] = useState('depth');

 
  const { selectedEarthquake } = useEarthquakeContext();

  // Define numeric fields available for axes selection with labels
  // Memoized to avoid re-creating the array on each render
  const numericFields = useMemo(() => [
    { key: 'magnitude', label: 'Magnitude' },
    { key: 'depth', label: 'Depth (km)' },
    { key: 'latitude', label: 'Latitude' },
    { key: 'longitude', label: 'Longitude' },
    { key: 'gap', label: 'Gap' },
    { key: 'rms', label: 'RMS' }
  ], []);

  // Limit the number of data points to MAX_POINTS to optimize rendering performance
  const limitedData = useMemo(() => {
    if (data.length > MAX_POINTS) {
      return data.slice(0, MAX_POINTS);
    }
    return data;
  }, [data]);

  // Custom tooltip component for displaying earthquake details on hover
  
  const CustomTooltip = useMemo(() => {
    return ({ active, payload }) => {
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
  }, []);

  // Created an array of <Cell> components to customize scatter plot point appearance
  const scatterCells = useMemo(() => {
    return limitedData.map((entry) => {
      const isSelected = selectedEarthquake && selectedEarthquake.id === entry.id;
      return (
        <Cell
          key={`cell-${entry.id}`}
          fill={isSelected ? '#FF0000' : '#ADD8E6'} // Red if selected, light blue otherwise
          r={isSelected ? 8 : 5} // Larger radius if selected
        />
      );
    });
  }, [limitedData, selectedEarthquake]);

  // Extract the selected earthquake data from the full dataset for special rendering
  const selectedData = useMemo(() => {
    if (selectedEarthquake) {
      const found = data.find((entry) => entry.id === selectedEarthquake.id);
      return found ? [found] : [];
    }
    return [];
  }, [selectedEarthquake, data]);

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

      {/* Chart rendering container */}
      <div className="chart-wrapper">
       
        {limitedData && limitedData.length > 0 && (
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
              {/* Scatter plot of earthquake points */}
              <Scatter
                data={limitedData}
                onClick={onPointClick} // Handles clicks on points
                style={{ cursor: 'pointer' }}
              >
                {scatterCells}
              </Scatter>
             {selectedData.length > 0 && (
                <Scatter
                  data={selectedData}
                  fill="#FF0000"
                  shape="circle"
                  legendType="circle"
                />
              )}
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};


export default React.memo(EarthquakeChart);
