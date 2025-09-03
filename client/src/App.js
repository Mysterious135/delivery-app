import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import RestaurantsPage from './components/RestaurantsPage'; // New Page
import CartPage from './components/CartPage';             // New Page
import Register from './components/Register';
import Login from './components/Login';
import './layout-styles.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  // --- State Lifted Up from HomePage ---
  const [cart, setCart] = useState([]);
  const [customerDetails, setCustomerDetails] = useState({
    // We can remove name and address as they will be tied to the user account
    paymentMethod: 'Cash on Delivery',
  });

  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCart([]); // Clear cart on logout
    navigate('/login');
  };

  // --- Handlers Lifted Up from HomePage ---
  const handleAddToCart = (item) => {
    setCart(prevCart => {
      const itemInCart = prevCart.find(cartItem => cartItem.id === item.id);
      if (itemInCart) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
    // Optional: Navigate to cart after adding an item for better UX
    // navigate('/cart');
  };

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails(prevDetails => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    const orderData = {
      paymentMethod: customerDetails.paymentMethod,
      items: cart.map(item => ({ itemId: item.id, quantity: item.quantity })),
    };
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You must be logged in to place an order.');
        return;
    }
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Order placement failed');
      }
      const result = await response.json();
      alert(`Order placed successfully! Order ID: ${result.orderId}`);
      setCart([]); // Clear the cart
      navigate('/restaurants'); // Go back to restaurants page
    } catch (error) {
      alert(error.message);
    }
  };

  // Calculate cart count for the nav link
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="App">
      <header className="App-header">
        <nav className="app-nav">
          <div className="nav-brand">
            <Link to={token ? "/restaurants" : "/"}>Food Delivery App</Link>
          </div>
          <div className="nav-links">
            {!token ? (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            ) : (
              <>
                <Link to="/restaurants">Restaurants</Link>
                <Link to="/cart">Cart ({cartItemCount})</Link>
                <button onClick={handleLogout}>Logout</button>
              </>
            )}
          </div>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes: These will redirect to login if the user is not authenticated */}
          <Route 
            path="/restaurants" 
            element={token ? <RestaurantsPage onAddToCart={handleAddToCart} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/cart" 
            element={
              token ? 
              <CartPage 
                cartItems={cart} 
                onPlaceOrder={handlePlaceOrder} 
                customerDetails={customerDetails} 
                onDetailChange={handleDetailChange} 
              /> : 
              <Navigate to="/login" />
            } 
          />
          
          {/* Default Route: Redirects to restaurants if logged in, otherwise to login */}
          <Route path="*" element={<Navigate to={token ? "/restaurants" : "/login"} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;


