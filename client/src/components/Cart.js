// client/src/components/Cart.js
import React from 'react';

// Accept new props for handling form state
function Cart({ cartItems, onPlaceOrder, customerDetails, onDetailChange }) {
  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div>
      <h3>Shopping Cart 🛒</h3>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <ul>
          {cartItems.map(item => (
            <li key={item.id}>
              {item.name} - {item.quantity} x ${item.price}
            </li>
          ))}
        </ul>
      )}
      <h4>Total: ${totalPrice.toFixed(2)}</h4>
      
      <hr/>
      
      {/* New Customer Details Form */}
      <div className="checkout-form">
        <h3>Checkout Details 📝</h3>
        <input
          type="text"
          name="customerName"
          placeholder="Your Name"
          value={customerDetails.customerName}
          onChange={onDetailChange}
        />
        <input
          type="text"
          name="deliveryAddress"
          placeholder="Delivery Address"
          value={customerDetails.deliveryAddress}
          onChange={onDetailChange}
        />
        <div>
          <h4>Payment Method 💳</h4>
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="Cash on Delivery"
              checked={customerDetails.paymentMethod === 'Cash on Delivery'}
              onChange={onDetailChange}
            />
            Cash on Delivery
          </label>
          <label style={{ marginLeft: '10px' }}>
            <input
              type="radio"
              name="paymentMethod"
              value="Credit Card"
              checked={customerDetails.paymentMethod === 'Credit Card'}
              onChange={onDetailChange}
            />
            Credit Card (Mock)
          </label>
        </div>
      </div>

      <button onClick={onPlaceOrder} disabled={cartItems.length === 0}>
        Place Order 🚚
      </button>
    </div>
  );
}

export default Cart;