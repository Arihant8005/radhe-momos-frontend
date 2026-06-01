import { useState, useEffect, useCallback } from 'react';

function Admin({ goBack }) {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '' });
  const [imageFile, setImageFile] = useState(null);

  const token = localStorage.getItem('adminToken');

const handleCompleteOrder = async (orderId) => {
    // 1. Ask the chef to confirm so they don't accidentally click it!
    if (!window.confirm("Is this order fully cooked and delivered?")) return;

    try {
      const token = localStorage.getItem('adminToken'); // Grab the security key
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // 2. Magically remove the order from the screen without refreshing the page!
        setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
      } else {
        alert("Something went wrong trying to complete the order.");
      }
    } catch (error) {
      alert("Server error. Could not complete order.");
    }
  };

  // 👇 PASTE THIS NEW FUNCTION RIGHT HERE 👇
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // 🚨 Notice we are using your exact token name: 'adminToken'
      const token = localStorage.getItem('adminToken'); 
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/status/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');
      setOrders((prevOrders) => 
        prevOrders.map((order) => 
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      // Socket.io will automatically trigger the UI update!
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update order status.");
    }
  };
  // 👆 END NEW FUNCTION 👆

  // 🚨 CLOUD UPDATE: Points to your live Render server
  const fetchOrders = useCallback(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/orders`, { 
      headers: { 'Authorization': `Bearer ${token}` } 
    })
      .then(res => res.ok ? res.json() : Promise.reject('Unauthorized'))
      .then(data => setOrders(data))
      .catch(() => { alert("Session expired."); goBack(); });
  }, [token, goBack]);

  // 🚨 CLOUD UPDATE: Points to your live Render server
  const fetchMenu = useCallback(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/menu`)
      .then(res => res.json())
      .then(data => setMenuItems(data));
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchMenu();
  }, [fetchOrders, fetchMenu]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', newItem.name);
    formData.append('description', newItem.description);
    formData.append('price', Number(newItem.price));
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      // 🚨 CLOUD UPDATE: Points to your live Render server
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/menu`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
        body: formData
      });

      if (response.ok) {
        alert("✅ Item added successfully!");
        setNewItem({ name: '', description: '', price: '' });
        setImageFile(null); 
        document.getElementById('imageUpload').value = '';
        fetchMenu(); 
      }
    } catch (error) {
      alert("❌ Failed to add item.");
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      // 🚨 CLOUD UPDATE: Points to your live Render server
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/menu/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchMenu();
    } catch (error) {
      alert("❌ Failed to delete item.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">👨‍🍳 Restaurant Dashboard</h2>
        <button onClick={goBack} className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700">
          Exit Dashboard
        </button>
      </div>

      <div className="flex gap-4 mb-8 border-b pb-4">
        <button 
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'orders' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          📦 View Orders
        </button>
        <button 
          onClick={() => setActiveTab('menu')}
          className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'menu' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          🍔 Manage Menu
        </button>
      </div>

      {activeTab === 'orders' && (
        <div className="grid gap-6">
          {orders.length === 0 ? (
  <p className="text-xl text-gray-500">No orders yet.</p>
) : (
  orders.map(order => (
    <div key={order._id} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500 mb-4">
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold">{order.customerName}</h3>
          <p className="text-gray-600">📞 {order.phoneNumber}</p>
          <p className="text-gray-600">📍 {order.deliveryAddress}</p>
          <div className="mt-2">
            <span className="font-bold text-gray-700">Status: </span>
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded font-bold text-sm">
              {order.status || 'Pending'}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-800">₹{order.totalPrice}</p>
        </div>
      </div>

      <button 
        onClick={() => handleCompleteOrder(order._id)}
        className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow transition"
      >
        ✅ Mark as Completed
      </button>
      <button 
              onClick={() => updateOrderStatus(order._id, 'Cooking')}
              className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
            >
              👨‍🍳 Cooking
            </button>
            
            <button 
              onClick={() => updateOrderStatus(order._id, 'Out for Delivery')}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              🛵 Delivery
            </button>

    </div>
  ))
)}
        </div>
      )}

      {activeTab === 'menu' && (
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Add New Item Form */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 h-fit">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Add New Menu Item</h3>
            <form onSubmit={handleAddItem} className="flex flex-col gap-4">
              <input type="text" placeholder="Item Name (e.g. Cheese Momos)" required className="border p-2 rounded"
                value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
              
              <input type="number" placeholder="Price (₹)" required className="border p-2 rounded"
                value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} />
              
              <div className="border p-2 rounded bg-gray-50">
                <label className="block text-sm font-bold text-gray-700 mb-1">Upload Image:</label>
                <input 
                  id="imageUpload"
                  type="file" 
                  accept="image/*" 
                  required 
                  className="w-full"
                  onChange={e => setImageFile(e.target.files[0])} 
                />
              </div>
              
              <textarea placeholder="Description" required className="border p-2 rounded" rows="2"
                value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
              
              <button type="submit" className="bg-green-500 text-white font-bold py-2 rounded hover:bg-green-600">
                + Add Item to Menu
              </button>
            </form>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4 text-gray-800">Current Menu</h3>
            <div className="flex flex-col gap-4">
              {menuItems.map(item => (
                <div key={item._id} className="bg-white p-4 rounded-xl shadow border border-gray-100 flex items-center gap-4">
                  <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                  <div className="flex-grow">
                    <h4 className="font-bold text-gray-800">{item.name}</h4>
                    <p className="text-green-600 font-bold">₹{item.price}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteItem(item._id)}
                    className="bg-red-100 text-red-600 p-2 rounded hover:bg-red-200 transition"
                    title="Delete Item"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default Admin;