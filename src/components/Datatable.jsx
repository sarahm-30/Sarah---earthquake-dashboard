import React, { useState, useContext } from 'react';


import { EarthquakeContext } from '../App';



// Custom hook to use Earthquake Context
const useEarthquakeContext = () => {
  const context = useContext(EarthquakeContext);
  if (!context) {
    throw new Error('useEarthquakeContext must be used within EarthquakeProvider');
  }
  return context;
};

// Earthquake Table Component
const EarthquakeTable = ({ data, onRowClick }) => {
  const [sortField, setSortField] = useState('magnitude');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;
  const { selectedEarthquake } = useEarthquakeContext();

  // Filter and sort data
  const filteredData = data.filter(earthquake =>
    earthquake.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });

  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="table-container">
      <div className="table-header">
        <h2 className="table-title">Earthquake Data</h2>
        <input
          type="text"
          placeholder="Search by location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="table-search"
        />
      </div>
      
      <div className="table-wrapper">
        <table className="earthquake-table">
          <thead className="table-head">
            <tr>
              {[
                { key: 'magnitude', label: 'Magnitude' },
                { key: 'location', label: 'Location' },
                { key: 'depth', label: 'Depth (km)' },
                { key: 'time', label: 'Time' },
              ].map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="table-header-cell"
                >
                  {col.label} {sortField === col.key && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((earthquake, index) => {
              const isSelected = selectedEarthquake?.id === earthquake.id;
              return (
                <tr
                  key={earthquake.id}
                  onClick={() => onRowClick(earthquake)}
                  className={`table-row ${isSelected ? 'selected' : ''} ${index % 2 === 0 ? 'even' : 'odd'}`}
                >
                  <td className="table-cell">
                    <span className={`magnitude-badge ${earthquake.magnitude >= 5 ? 'high' : earthquake.magnitude >= 3 ? 'medium' : 'low'}`}>
                      {earthquake.magnitude}
                    </span>
                  </td>
                  <td className="table-cell">{earthquake.location}</td>
                  <td className="table-cell">{earthquake.depth}</td>
                  <td className="table-cell">
                    {new Date(earthquake.time).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="table-pagination">
        <span className="pagination-info">
          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length} entries
        </span>
        <div className="pagination-controls">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            Previous
          </button>
          <span className="pagination-current">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default EarthquakeTable;