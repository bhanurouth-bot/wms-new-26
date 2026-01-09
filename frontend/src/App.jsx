import { useState, useEffect } from 'react'
// import axios from 'axios'
import api from './services/api' 
import Login from './components/Login';

// Import all your components
import ProductList from './components/ProductList'
import InventoryDashboard from './components/InventoryDashboard'
import InboundForm from './components/InboundForm'
import SalesOrderForm from './components/SalesOrderForm' // <--- The new component
import WarehouseMap from './components/WarehouseMap' // <--- IMPORT
import BatchTracer from './components/BatchTracer' // <--- IMPORT
import AIInsights from './components/AIInsights' // <--- IMPORT

function App() {
  const [token, setToken] = useState(localStorage.getItem('token')); // Load from storage
  const [status, setStatus] = useState("Connecting...");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  if (!token) {
    return <Login onLoginSuccess={(tk) => setToken(tk)} />;
  }

  // useEffect(() => {
  //   // Quick Health Check to the Backend
  //   axios.get('http://127.0.0.1:8000/')
  //     .then(() => setStatus("Online"))
  //     .catch(() => setStatus("Offline"))
  // }, [])

  useEffect(() => {
    // We check health, but now this request will carry the token!
    api.get('/') 
      .then(() => setStatus("Online"))
      .catch((err) => {
          console.error(err);
          setStatus("Offline");
      });
  }, []);

  // This function is passed to the Forms. When they succeed, they call this.
  const handleStockUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLogout = () => {
      localStorage.removeItem('token');
      setToken(null);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
      
      {/* HEADER */}
      <div className="app-header">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', letterSpacing: '-1px', margin: '0 0 5px 0' }}>
            Pharma<span style={{ color: '#3b82f6' }}>OS</span>
          </h1>
          <p style={{ margin: 0, color: '#94a3b8' }}>Unified ERP & WMS Platform</p>
        </div>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div className="status-indicator">
                <span style={{ height: '8px', width: '8px', background: '#10b981', borderRadius: '50%' }}></span>
                {status}
            </div>
            <button 
                onClick={handleLogout}
                style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer' }}
            >
                Log Out
            </button>
        </div>
      </div>

      {/* --- CONTENT --- */}
      <AIInsights />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
        <div><InboundForm onSuccess={handleStockUpdate} /></div>
        <div><SalesOrderForm onSuccess={handleStockUpdate} /></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <div><ProductList /></div>
          <div><InventoryDashboard key={refreshTrigger} /></div>
      </div>

      <WarehouseMap key={refreshTrigger} />
      <BatchTracer />

    </div>
  )
}

export default App