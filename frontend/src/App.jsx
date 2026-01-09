import { useState, useEffect } from 'react'
// import axios from 'axios'
import api from './services/api' 
// Import all your components
import ProductList from './components/ProductList'
import InventoryDashboard from './components/InventoryDashboard'
import InboundForm from './components/InboundForm'
import SalesOrderForm from './components/SalesOrderForm' // <--- The new component
import WarehouseMap from './components/WarehouseMap' // <--- IMPORT
import BatchTracer from './components/BatchTracer' // <--- IMPORT
import AIInsights from './components/AIInsights' // <--- IMPORT


function App() {
  const [status, setStatus] = useState("Connecting...")
  // This trigger is used to force the Inventory Dashboard to reload when stock changes
  const [refreshTrigger, setRefreshTrigger] = useState(0); 

  // useEffect(() => {
  //   // Quick Health Check to the Backend
  //   axios.get('http://127.0.0.1:8000/')
  //     .then(() => setStatus("Online"))
  //     .catch(() => setStatus("Offline"))
  // }, [])

  useEffect(() => {
  // Use the 'api' agent, not raw axios
  api.get('/')
    .then(() => setStatus("Online"))
    .catch(() => setStatus("Offline"))
}, [])

  // This function is passed to the Forms. When they succeed, they call this.
  const handleStockUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
      
      {/* --- HEADER SECTION --- */}
      <div className="app-header">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', letterSpacing: '-1px', margin: '0 0 5px 0' }}>
            Pharma<span style={{ color: '#3b82f6' }}>OS</span>
          </h1>
          <p style={{ margin: 0, color: '#94a3b8' }}>Unified ERP & WMS Platform</p>
        </div>

        <div className="status-indicator">
          <span style={{ height: '8px', width: '8px', background: '#10b981', borderRadius: '50%' }}></span>
          {status}
        </div>
      </div>
      
      {/* --- INTELLIGENCE LAYER --- */}
      <AIInsights />

      {/* --- OPERATIONS CENTER (Forms) --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', marginBottom: '40px' }}>
        
        {/* Left: INBOUND (Receiving) */}
        <div>
           <InboundForm onSuccess={handleStockUpdate} />
        </div>
        
        {/* Right: OUTBOUND (Dispatching) */}
        <div>
           <SalesOrderForm onSuccess={handleStockUpdate} />
        </div>

      </div>

      {/* --- DATA VISUALIZATION (Dashboards) --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
          
          {/* Left: Master Data */}
          <div>
            <ProductList />
          </div>

          {/* Right: Live Inventory Floor */}
          <div>
             <InventoryDashboard key={refreshTrigger} />
          </div>

      </div>

      {/* --- DIGITAL TWIN (Map) --- */}
      <WarehouseMap key={refreshTrigger} />


      {/* --- TRACEABILITY SECTION --- */}
      <BatchTracer />

    </div>
  )
}

export default App