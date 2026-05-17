import { useState, useEffect, useCallback } from 'react';

function Admin({ goBack }) {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  
  // Notice we removed imageUrl and added imageFile
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '' });
  const [imageFile, setImageFile] = useState(null);

  const token = localStorage.getItem('adminToken');

  const fetchOrders = useCallback(() => {
    fetch('http://localhost:5000/api/orders', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : Promise.reject('Unauthorized'))
      .then(data => setOrders(data))
      .catch(() => { alert("Session expired."); goBack(); });
  }, [token, goBack]);

  const fetchMenu = useCallback(() => {
    fetch('http://localhost:5000/api/menu')
      .then(res => res.json())
      .then(data => setMenuItems(data));
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchMenu();
  }, [fetchOrders, fetchMenu]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    
    // We use FormData instead of JSON to securely bundle the image file with the text
    const formData = new FormData();
    formData.append('name', newItem.name);
    formData.append('description', newItem.description);
    formData.append('price', Number(newItem.price));
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const response = await fetch('http://localhost:5000/api/menu', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}` 
          // Notice we DO NOT put 'Content-Type': 'application/json' here. 
          // The browser automatically sets the correct format for file uploads!
        },
        body: formData
      });

      if (response.ok) {
        alert("✅ Item added successfully!");
        setNewItem({ name: '', description: '', price: '' });
        setImageFile(null); // Clear the file
        // Reset the actual file input visually
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
      const response = await fetch(`http://localhost:5000/api/menu/${id}`, {
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
          {orders.length === 0 ? <p className="text-xl text-gray-500">No orders yet.</p> : (
            orders.map(order => (
              <div key={order._id} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{order.customerName}</h3>
                    <p className="text-gray-600">📞 {order.phoneNumber}</p>
                    <p className="text-gray-600">📍 {order.deliveryAddress}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-800">₹{order.totalPrice}</p>
                  </div>
                </div>
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
              
              {/* THIS IS THE NEW FILE UPLOAD BUTTON */}
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