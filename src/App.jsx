import React, { useState, useEffect, createContext, useContext } from 'react';
import Papa from 'papaparse';
import EarthquakeChart from './components/scatter-data.jsx';
import EarthquakeTable from './components/Datatable.jsx';

// Context for managing selected earthquake state
export const EarthquakeContext = createContext();

// Context Provider Component
const EarthquakeProvider = ({ children }) => {
  const [selectedEarthquake, setSelectedEarthquake] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  
  return (
    <EarthquakeContext.Provider value={{ 
      selectedEarthquake, 
      setSelectedEarthquake,
      filteredData,
      setFilteredData
    }}>
      {children}
    </EarthquakeContext.Provider>
  );
};

// Custom hook to use Earthquake Context
const useEarthquakeContext = () => {
  const context = useContext(EarthquakeContext);
  if (!context) {
    throw new Error('useEarthquakeContext must be used within EarthquakeProvider');
  }
  return context;
};

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p className="loading-text">Loading earthquake data...</p>
  </div>
);

// Statistics Panel Component
const StatisticsPanel = ({ data }) => {
  const avgMagnitude = data.length > 0 ? (data.reduce((sum, eq) => sum + eq.magnitude, 0) / data.length).toFixed(2) : 0;
  const maxMagnitude = data.length > 0 ? Math.max(...data.map(eq => eq.magnitude)) : 0;
  const avgDepth = data.length > 0 ? (data.reduce((sum, eq) => sum + eq.depth, 0) / data.length).toFixed(2) : 0;

  return (
    <div className="stats-panel">
      <h3 className="stats-title">Statistics Overview</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{data.length}</div>
          <div className="stat-label">Total Earthquakes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value red">{maxMagnitude}</div>
          <div className="stat-label">Max Magnitude</div>
        </div>
        <div className="stat-card">
          <div className="stat-value orange">{avgMagnitude}</div>
          <div className="stat-label">Avg Magnitude</div>
        </div>
        <div className="stat-card">
          <div className="stat-value green">{avgDepth} km</div>
          <div className="stat-label">Avg Depth</div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [earthquakeData, setEarthquakeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { selectedEarthquake, setSelectedEarthquake } = useEarthquakeContext();

  // Fetch and parse CSV data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/all_month.csv');
        if (!response.ok) throw new Error('Failed to fetch CSV data');
        const text = await response.text();
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        
        const data = parsed.data
          .filter(quake => {
            const mag = parseFloat(quake.mag);
            const depth = parseFloat(quake.depth);
            const lat = parseFloat(quake.latitude);
            const lon = parseFloat(quake.longitude);
            return !isNaN(mag) && !isNaN(depth) && !isNaN(lat) && !isNaN(lon) && quake.place && quake.time;
          })
          .map(quake => ({
            id: quake.id,
            magnitude: parseFloat(quake.mag),
            depth: parseFloat(quake.depth),
            latitude: parseFloat(quake.latitude),
            longitude: parseFloat(quake.longitude),
            location: quake.place,
            time: quake.time,
            gap: parseFloat(quake.gap) || 0,
            rms: parseFloat(quake.rms) || 0,
          }));

        setEarthquakeData(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load earthquake data');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle chart point and table row clicks
  const handleRowClick = (earthquake) => {
    setSelectedEarthquake(earthquake);
  };

  const handleChartPointClick = (data) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const earthquake = data.activePayload[0].payload;
      setSelectedEarthquake(earthquake);
    }
  };

  // Render loading, error, or main content
  if (loading) {
    return (
      <div className="app-container">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container error-container">
        <h2 className="error-title">Error Loading Data</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Earthquake Data Dashboard</h1>
        
      </header>

      <StatisticsPanel data={earthquakeData} />

      <div className="main-grid">
        <EarthquakeChart 
          data={earthquakeData} 
          onPointClick={handleChartPointClick}
        />
        
        <EarthquakeTable 
          data={earthquakeData} 
          onRowClick={handleRowClick}
        />
      </div>

      {selectedEarthquake && (
        <div className="details-panel">
          <h3 className="details-title">Selected Earthquake Details</h3>
          <div className="details-grid">
            <p><strong>Location:</strong> {selectedEarthquake.location}</p>
            <p><strong>Magnitude:</strong> {selectedEarthquake.magnitude}</p>
            <p><strong>Depth:</strong> {selectedEarthquake.depth} km</p>
            <p><strong>Time:</strong> {new Date(selectedEarthquake.time).toLocaleString()}</p>
            <p><strong>Coordinates:</strong> {selectedEarthquake.latitude}, {selectedEarthquake.longitude}</p>
          </div>
        </div>
      )}

      <style jsx>{`
  .app-container {
    padding: 1rem;
    max-width: 1400px;
    margin: 0 auto;
    font-family: 'Times New Roman', Tahoma, Geneva, Verdana, sans-serif;
    background: #121212; 
    color: #e0e0e0;
  }
  .app-header {
    text-align: center;
    margin-bottom: 2rem;
    padding: 2rem;
    
    border-radius: 20px;
    
  }
  .app-title {
    margin: 0;
    font-size: 2.8rem;
    font-weight: 900;
    color: #ffffff;
    
  }
  .app-subtitle {
    margin-top: 10px;
    font-size: 1.2rem;
    color: #b0f7f9;
  }

  .stats-panel {
    padding: 1.8rem;
   
    border-radius: 20px;
    
    margin-bottom: 2rem;
  }
  .stats-title {
    margin-bottom: 1rem;
    color: #fff;
    font-size: 1.6rem;
    font-weight: 700;
   
  }
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }
  .stat-card {
    
    padding: 1.5rem;
    border-radius: 20px;
    text-align: center;
    border: 0.2px solid #00c7c8;
    box-shadow: -3px 6px 6px #00c7c8;
    transition: all 0.3s ease;
    cursor: default;
  }
  .stat-card:hover {
     box-shadow: -4px 8px 10px #00c7c8;
    transform: translateY(-10px);
  }
  .stat-value {
    font-size: 2.3rem;
    font-weight: 900;
    color: #ffffff;
    
  }
  .stat-value.red {
    color: #ff6b6b;
    
  }
  .stat-value.orange {
    color: #ffa94d;
    
  }
  .stat-value.green {
    color: #5ce66b;
    
  }
  .stat-label {
    font-size: 1rem;
    color: #fff;
    margin-top: 0.5rem;
  }

  .main-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
  }
  
  .chart-container, .table-container {
   
    border-radius: 20px;
    border:0.5px solid #00c7c8;
    height: 600px;
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
  }
    .table-pagination {
    display: flex;
    justify-content: flex-end;  
    align-items: center;
    gap: 1rem;                 
    flex-wrap: wrap;
    margin-top: 1rem;
    padding: 0.75rem 0;
    }


  .table-header, .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .table-title, .chart-title {
    margin: 0;
    color: #fff;
    font-size: 1.6rem;
    font-weight: 700;
    
  }

  .chart-select, .table-search, .pagination-button {
    background: #1c1c1c;
    border: none;
    border-radius: 15px;
    box-shadow: inset 6px 6px 10px #141414,
                inset -6px -6px 10px #242424;
    padding: 0.6rem 1rem;
    font-size: 1rem;
    color: #e0e0e0;
    transition: all 0.3s ease;
    cursor: pointer;
  }
  .chart-select:hover, .table-search:hover, .pagination-button:hover:not(:disabled) {
   
    color: #fff;
  }
  .chart-select:focus, .table-search:focus, .pagination-button:focus {
    outline: none;
    box-shadow: 0 0 12px #00fff7;
  }

  .table-wrapper {
    overflow: auto;
    flex: 1;
    border-radius: 20px;
    background: #1c1c1c;
    box-shadow: inset 6px 6px 10px #141414,
                inset -6px -6px 10px #242424;
    border: none;
  }
    .chart-wrapper {
  flex: 1;         
  min-height: 0;   
}

  .earthquake-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 10px;
    min-width: 600px;
  }
  .table-head {
    background: transparent;
    position: sticky;
    top: 0;
    z-index: 1;
  }
  .table-header-cell {
    padding: 1rem;
    text-align: left;
    cursor: pointer;
    font-weight: 700;
    color: #00fff7;
    white-space: nowrap;
    user-select: none;
    background:#242424;
  }
  .table-header-cell:hover {
    color: #5ce66b;
    text-shadow: 0 0 6px #5ce66b;
  }
  .table-row {
    cursor: pointer;
    transition: all 0.3s ease;
    background: #1c1c1c;
    border-radius: 10px;
    box-shadow: 8px 8px 12px #141414,
                -8px -8px 12px #242424;
  }
  .table-row.even {
    background: #232323;
  }
  .table-row.odd {
    background: #1c1c1c;
  }
  .table-row.selected {
    background: #00c7c8 !important;
    color: #000 !important;
    
  }
  .table-row:hover:not(.selected) {
    background:#00c7c8 !important;
    color: #000 !important;
    
    transform: translateY(-3px);
  }
  .table-cell {
    padding: 1rem;
    color: #e0e0e0;
  }
    .table-cell:hover.selected {
     color:#00000;
    }

  .magnitude-badge {
    padding: 0.4rem 0.8rem;
    border-radius: 50px;
    font-weight: 700;
    font-size: 0.8rem;
    text-align: center;
    color: #fff;
    user-select: none;
  }
  .magnitude-badge.high {
    background: #ff6b6b;
    box-shadow: 0 0 8px #ff6b6b;
  }
  .magnitude-badge.medium {
    background: #ffa94d;
    box-shadow: 0 0 8px #ffa94d;
  }
  .magnitude-badge.low {
    background: #5ce66b;
    box-shadow: 0 0 8px #5ce66b;
  }

  .pagination-info {
    color: #8e8e8e;
    font-size: 0.9rem;
  }
  .pagination-controls {
    display: flex;
    gap: 0.8rem;
    align-items: center;
  }
  .pagination-button {
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .details-panel {
    padding: 1.8rem;
   
    border-radius: 20px;
   
    margin-top: 2rem;
  }
  .details-title {
    margin-bottom: 1rem;
    color: #fff;
    font-size: 1.4rem;
    font-weight: 700;
    
  }
  .details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }
  .details-grid p {
    margin: 0;
    padding: 1rem;
    background: #232323;
    border-radius: 15px;
    color: #e0e0e0;
    
  }

  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    flex-direction: column;
  }
  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #141414;
    border-top: 5px solid #00fff7;
    border-radius: 50%;
    animation: spin 1.2s linear infinite;
  }
  .loading-text {
    margin-top: 15px;
    color: #00fff7;
    font-weight: 600;
    letter-spacing: 1.5px;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .error-container {
    text-align: center;
    color: #ff6b6b;
  }
  .error-title {
    color: #ff6b6b;
  }

  @media (max-width: 1200px) {
    .main-grid {
      grid-template-columns: 1fr;
    }
  }
`}</style>

    </div>
  );
};

// Root App with Context Provider
const AppWithProviders = () => {
  return (
    <EarthquakeProvider>
      <App />
    </EarthquakeProvider>
  );
};

export default AppWithProviders;