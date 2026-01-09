import { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode"; // <--- NEW LIBRARY
import api from './services/api';
import Login from './components/Login';

// Components
import ProductList from './components/ProductList';
import InventoryDashboard from './components/InventoryDashboard';
import InboundForm from './components/InboundForm';
import SalesOrderForm from './components/SalesOrderForm';
import WarehouseMap from './components/WarehouseMap';
import BatchTracer from './components/BatchTracer';
import AIInsights from './components/AIInsights';
import MobileScanner from './components/MobileScanner';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userRole, setUserRole] = useState(null); // <--- STORE ROLE
  const [status, setStatus] = useState("Connecting...");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showScanner, setShowScanner] = useState(false);

  // --- AUTH LOGIC ---
  useEffect(() => {
    if (token) {
      try {
        // Decode the token to get "sub" (email) and "role"
        const decoded = jwtDecode(token);
        setUserRole(decoded.role); // e.g., 'ADMIN' or 'PICKER'
      } catch (e) {
        console.error("Invalid Token", e);
        handleLogout();
      }
    }
  }, [token]);

  // --- HEALTH CHECK ---
  useEffect(() => {
    if (token) {
      api.get('/') 
        .then(() => setStatus("Online"))
        .catch(() => setStatus("Offline"));
    }
  }, [token]);

  const handleStockUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLogout = () => {
      localStorage.removeItem('token');
      setToken(null);
      setUserRole(null);
  };

  // If no token, show Login
  if (!token) {
    return <Login onLoginSuccess={(tk) => setToken(tk)} />;
  }

  // --- RENDER HELPERS (RBAC) ---
  const isAdmin = userRole === 'ADMIN';
  const isManager = userRole === 'MANAGER' || isAdmin;
  // Pickers see the basics. Admins see everything.

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
      
      {/* HEADER */}
      <div className="app-header">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', letterSpacing: '-1px', margin: '0 0 5px 0' }}>
            Pharma<span style={{ color: '#3b82f6' }}>OS</span>
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <p style={{ margin: 0, color: '#94a3b8' }}>Unified ERP & WMS Platform</p>
            {/* SHOW BADGE OF CURRENT ROLE */}
            <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
              {userRole || 'LOADING...'}
            </span>
          </div>
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

      {/* --- CONTENT AREA --- */}

      {/* 1. INTELLIGENCE LAYER (Admins/Managers Only) */}
      {isManager && (
         <AIInsights />
      )}

      {/* 2. OPERATIONS (Everyone needs this) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
        <div><InboundForm onSuccess={handleStockUpdate} /></div>
        <div><SalesOrderForm onSuccess={handleStockUpdate} /></div>
      </div>

      {/* 3. DATA VISUALIZATION */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          
          {/* Master Data (Admins Only - Pickers shouldn't edit products) */}
          <div>
            {isManager ? <ProductList /> : (
              <div className="glass-panel" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                🔒 Master Data Restricted
              </div>
            )}
          </div>

          {/* Live Inventory (Everyone needs to see stock) */}
          <div><InventoryDashboard key={refreshTrigger} /></div>
      </div>

      {/* 4. DIGITAL TWIN (Everyone uses the map) */}
      <WarehouseMap key={refreshTrigger} />

      {/* 5. COMPLIANCE & RECALL (Admins Only) */}
      {isAdmin && (
         <BatchTracer />
      )}
{/* --- FLOATING SCAN BUTTON --- */}
      <button 
        onClick={() => setShowScanner(true)}
        style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            fontSize: '1.5rem',
            boxShadow: '0 10px 25px rgba(59, 130, 246, 0.5)',
            cursor: 'pointer',
            zIndex: 900,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}
      >
        📷
      </button>

      {/* --- SCANNER OVERLAY --- */}
      {showScanner && <MobileScanner onClose={() => setShowScanner(false)} />}

    </div>
  );
}

export default App;