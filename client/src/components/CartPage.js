import React from 'react';
import Cart from './Cart'; // We can reuse the Cart component
import './ComponentStyles.css';

// This component receives everything it needs to display and manage the checkout
function CartPage({ cartItems, onPlaceOrder, customerDetails, onDetailChange }) {
  return (
    <div className="cart-page-layout">
      <Cart 
        cartItems={cartItems} 
        onPlaceOrder={onPlaceOrder} 
        customerDetails={customerDetails} 
        onDetailChange={onDetailChange} 
      />
    </div>
  );
}

export default CartPage;
