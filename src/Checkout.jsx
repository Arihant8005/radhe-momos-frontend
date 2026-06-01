import { useState } from 'react';

function Checkout({ cart, totalPrice, goBack, clearCart, removeFromCart }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert("Your cart is empty!");
    setLoading(true);

    const orderData = {
      customerName: name,
      phoneNumber: phone,
      deliveryAddress: address,
      items: cart.map(item => ({ menuItem: item._id, 
        quantity: 1 , price: item.price})),
      totalPrice: totalPrice
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        setSuccess(true);
        clearCart(); // Wipe the cart data completely upon successful order/payment simulation
      } else {
        alert("Something went wrong processing your order. Try again!");
      }
    } catch (error) {
      alert("Server error. Is the backend application running?");
    } finally {
      setLoading(false);
    }
  };
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Your browser doesn't support geolocation.");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          if (data && data.display_name) {
            setAddress(data.display_name); // Updates your 'address' state!
          } else {
            alert("Could not find a street address.");
          }
        } catch (error) {
          console.error("Error fetching address:", error);
          alert("Failed to translate your location.");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Please allow location permissions to use this feature.");
        setIsLocating(false);
      }
    );
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-xl shadow-lg text-center border border-green-100">
        <span className="text-5xl">🎉</span>
        <h2 className="text-3xl font-bold text-green-600 mt-4 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">Your delicious momos order has been saved and sent to the kitchen.</p>
        <button onClick={goBack} className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition">
          Go Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 mt-4 grid md:grid-cols-2 gap-8">
      {/* Left Column: Order Summary List */}
      <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Order Summary</h3>
            <button onClick={goBack} className="text-red-500 font-semibold hover:underline">← Back to Menu</button>
          </div>

          {/* List of Cart Items with Individual Slicing */}
          <div className="flex flex-col gap-3 max-h-96 overflow-y-auto mb-4 pr-2">
            {cart.length === 0 ? (
              <p className="text-gray-400 py-4 text-center">Your cart is empty. Go back and pick some momos!</p>
            ) : (
              cart.map((item, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">{item.name}</h4>
                    <p className="text-xs text-green-600 font-semibold">₹{item.price}</p>
                  </div>
                  
                  {/* 🚨 THE INDIVIDUAL REMOVE BUTTON */}
                  <button 
                    onClick={() => removeFromCart(index)}
                    className="text-gray-400 hover:text-red-600 transition font-bold text-base p-1 px-2 rounded-md hover:bg-red-50"
                    title="Remove this item"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t pt-4 flex justify-between items-center">
          <span className="text-lg font-bold text-gray-700">Total Amount:</span>
          <span className="text-2xl font-black text-green-600">₹{totalPrice}</span>
        </div>
      </div>

      {/* Right Column: Checkout Form */}
      <div className="bg-white p-6 rounded-xl shadow border border-gray-100 h-fit">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Delivery Details</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            type="text" 
            placeholder="Your Full Name" 
            required 
            className="border p-3 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition"
            value={name} 
            onChange={e => setName(e.target.value)} 
          />
          <input 
            type="tel" 
            placeholder="Phone Number" 
            required 
            className="border p-3 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition"
            value={phone} 
            onChange={e => setPhone(e.target.value)} 
          />
          <div className="flex flex-col gap-2">
          
          <button
            type="button" // Important: Prevents the button from submitting the form!
            onClick={handleGetLocation}
            disabled={isLocating}
            className="bg-blue-100 text-blue-700 px-3 py-2 rounded font-semibold w-fit hover:bg-blue-200"
          >
            {isLocating ? '⏳ Locating...' : '📍 Auto-fill my location'}
          </button>

          <textarea 
            placeholder="Delivery Address" 
            value={address} 
            onChange={(e) => setAddress(e.target.value)} 
            required 
            rows="3"
            className="border p-2 rounded w-full"
          />
        </div>
          <button 
            type="submit" 
            disabled={loading || cart.length === 0} 
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg shadow transition duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : `Pay ₹${totalPrice}`}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Checkout;