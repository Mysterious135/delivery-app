import React, { useState, useEffect } from 'react';
import ItemsList from './ItemsList';
import './ComponentStyles.css';

// This component now only needs the onAddToCart function from its parent
function RestaurantsPage({ onAddToCart }) {
  const [vendors, setVendors] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState(null);

  useEffect(() => {
    // We'll use an environment variable for the API URL
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    fetch(`${apiUrl}/api/vendors`)
      .then(response => response.json())
      .then(data => setVendors(data))
      .catch(error => console.error('Error fetching vendors:', error));
  }, []);

  return (
    <div className="vendors-section">
      <h2>Select a Restaurant 🍽️</h2>
      <div className="vendor-grid">
        {vendors.map(vendor => (
          <div key={vendor.id} className="vendor-card" onClick={() => setSelectedVendorId(vendor.id)}>
            <img src={vendor.image_url} alt={vendor.name} />
            <h4>{vendor.name}</h4>
          </div>
        ))}
      </div>
      <hr />
      {selectedVendorId && <ItemsList vendorId={selectedVendorId} onAddToCart={onAddToCart} />}
    </div>
  );
}

export default RestaurantsPage;
