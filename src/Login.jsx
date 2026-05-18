import { useState } from 'react';

function Login({ onLoginSuccess, goBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        // We got the token! Save it to the browser's memory and log them in
        localStorage.setItem('adminToken', data.token);
        onLoginSuccess();
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Server error. Is the backend running?');
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 mt-16 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">🔐 Admin Login</h2>
        <button onClick={goBack} className="text-red-500 font-semibold hover:underline">Cancel</button>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input 
          type="text" 
          placeholder="Username" 
          className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input 
          type="password" 
          placeholder="Password" 
          className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="bg-gray-800 hover:bg-black text-white font-bold py-3 px-4 rounded-lg mt-2 transition duration-200">
          Login to Dashboard
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 text-center text-red-600 font-bold bg-red-50 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}

export default Login;