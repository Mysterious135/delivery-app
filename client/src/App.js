import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import RestaurantsPage from './components/RestaurantsPage'; // Correct import
import CartPage from './components/CartPage';             // Correct import
import Register from './components/Register';
import Login from './components/Login';
import './layout-styles.css';

function App() {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // State for cart needs to live here in App to be shared between pages
  const [cart, setCart] = React.useState([]);
  const [customerDetails, setCustomerDetails] = React.useState({
    paymentMethod: 'Cash on Delivery',
  });

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
    // No longer navigating automatically
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
      ...customerDetails, // Includes paymentMethod, etc.
      items: cart.map(item => ({ itemId: item.id, quantity: item.quantity })),
    };

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/api/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) {
        throw new Error('Order placement failed');
      }
      const result = await response.json();
      alert(`Order placed successfully! Order ID: ${result.orderId}`);
      setCart([]); // Clear the cart
      navigate('/'); // Go back to restaurants page
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLoginSuccess = () => {
    navigate('/');
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    window.location.reload();
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="App">
      <header className="App-header">
        <nav className="app-nav">
          <div className="nav-brand">
            <Link to="/">Food Delivery App</Link>
          </div>
          <div className="nav-links">
            {token && <Link to="/cart">Cart ({cartItemCount})</Link>}
            {!token ? (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            ) : (
              <button onClick={handleLogout} className="logout-button">Logout</button>
            )}
          </div>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={token ? <RestaurantsPage onAddToCart={handleAddToCart} /> : <Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/cart" element={token ? <CartPage cartItems={cart} customerDetails={customerDetails} onDetailChange={handleDetailChange} onPlaceOrder={handlePlaceOrder} /> : <Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
