import { useState, useEffect } from 'react';
import Checkout from './Checkout';
import Admin from './Admin';
import Login from './Login';

function App() {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/menu')
      .then(response => response.json())
      .then(data => setMenuItems(data))
      .catch(error => console.error("Error fetching menu:", error));
  }, []);

  const addToCart = (momo) => setCart([...cart, momo]);
  const clearCart = () => setCart([]);
  
  // 🚨 NEW FUNCTION: Removes exactly ONE item from the cart array using its index position
  const removeFromCart = (indexToRemove) => {
    setCart(cart.filter((_, index) => index !== indexToRemove));
  };

  const totalPrice = cart.reduce((total, item) => total + item.price, 0);

  if (showLogin) {
    return (
      <Login 
        onLoginSuccess={() => {
          setShowLogin(false);
          setShowAdmin(true);
        }} 
        goBack={() => setShowLogin(false)} 
      />
    );
  }

  if (showAdmin) {
    return <Admin goBack={() => setShowAdmin(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10 relative">
      <header className="bg-red-600 text-white p-6 shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold cursor-pointer" onClick={() => setShowCheckout(false)}>🥟 Radhe Momos</h1>
          <div className="flex items-center gap-4">
            <div className="text-lg font-semibold bg-red-700 px-4 py-2 rounded-lg">
              ₹{totalPrice} ({cart.length})
            </div>
            {cart.length > 0 && !showCheckout && (
              <div className="flex gap-2">
                <button 
                  onClick={clearCart}
                  className="bg-red-800 text-white font-bold px-4 py-2 rounded-lg hover:bg-red-900 transition"
                  title="Empty Entire Cart"
                >
                  🗑️ Clear All
                </button>
                <button 
                  onClick={() => setShowCheckout(true)}
                  className="bg-white text-red-600 font-bold px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  Checkout ➔
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {showCheckout ? (
        <Checkout 
          cart={cart} 
          totalPrice={totalPrice} 
          goBack={() => setShowCheckout(false)} 
          clearCart={clearCart}
          removeFromCart={removeFromCart} // 🚨 Passing the remove tool down to checkout!
        />
      ) : (
        <main className="max-w-6xl mx-auto p-6 mt-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Our Delicious Menu</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {menuItems.map((momo) => (
              <div key={momo._id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col">
                <img src={momo.imageUrl} alt={momo.name} className="w-full h-48 object-cover" />
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{momo.name}</h3>
                    <span className="text-lg font-bold text-green-600">₹{momo.price}</span>
                  </div>
                  <p className="text-gray-600 mb-4 text-sm flex-grow">{momo.description}</p>
                  <button 
                    onClick={() => addToCart(momo)}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200 mt-auto"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      <button
        onClick={() => setShowLogin(true)}
        className="fixed bottom-4 right-4 text-3xl opacity-100 bg-white p-3 rounded-full shadow-lg border border-gray-200 hover:scale-110 transition-transform duration-200"
        title="Admin Dashboard"
      >
        👨‍🍳
      </button>
    </div>
  );
}

export default App;