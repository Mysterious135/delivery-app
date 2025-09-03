// client/src/components/ItemsList.js
import React, { useState, useEffect } from 'react';

// Accept a new function prop: onAddToCart
function ItemsList({ vendorId, onAddToCart }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!vendorId) return;

    fetch(`http://localhost:3001/api/vendors/${vendorId}/items`)
      .then(response => response.json())
      .then(data => setItems(data))
      .catch(error => console.error('Error fetching items:', error));
  }, [vendorId]);

  return (
    <div>
      <h3>Menu 📜</h3>
        <ul>
        {items.map(item => (
            <li key={item.id} className="item-li">
            <img src={item.image_url} alt={item.name} />
            <div className="item-info">
                <p><strong>{item.name}</strong></p>
                <p>${item.price} (Stock: {item.stock_quantity})</p>
            </div>
            <button onClick={() => onAddToCart(item)}>
                Add to Cart
            </button>
            </li>
        ))}
        </ul>
    </div>
  );
}

export default ItemsList;