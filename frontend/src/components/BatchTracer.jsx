import React, { useState } from 'react';
import { complianceService } from '../services/api';

const BatchTracer = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [traceData, setTraceData] = useState(null);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        setError('');
        setTraceData(null);
        try {
            const response = await complianceService.traceBatch(searchQuery);
            setTraceData(response.data);
        } catch (err) {
            setError("Batch not found or invalid.");
        }
    };

    return (
        <div className="glass-panel" style={{ marginTop: '30px', border: '1px solid #ef4444' }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#f87171' }}>☣ Compliance & Recall Center</h2>

            {/* SEARCH BAR */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input 
                    type="text" 
                    placeholder="Enter Batch Number to Trace..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ flex: 1, padding: '12px', background: '#1e293b', border: '1px solid #334155', color: 'white', borderRadius: '6px' }}
                />
                <button type="submit" className="badge badge-red" style={{ fontSize: '1rem', cursor: 'pointer', border: 'none' }}>
                    🔍 TRACE
                </button>
            </form>

            {error && <div style={{ color: '#ef4444' }}>{error}</div>}

            {/* RESULTS VIEW */}
            {traceData && (
                <div style={{ animation: 'fadeIn 0.5s' }}>
                    
                    {/* 1. HEADER INFO */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>PRODUCT</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{traceData.batch_info.product}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>BATCH NO</div>
                            <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', color: '#fbbf24' }}>{traceData.batch_info.batch_number}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>EXPIRY</div>
                            <div style={{ fontSize: '1.2rem' }}>{traceData.batch_info.expiry}</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        
                        {/* 2. CURRENT INVENTORY (Where is it now?) */}
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '20px', borderRadius: '8px' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#34d399' }}>📍 Warehouse Locations</h4>
                            {traceData.current_locations.length === 0 ? (
                                <div style={{ color: '#64748b' }}>No stock currently in warehouse.</div>
                            ) : (
                                traceData.current_locations.map((loc, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <span>Bin: <strong style={{color:'#fff'}}>{loc.bin}</strong></span>
                                        <span className="badge badge-green">{loc.qty} Units</span>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* 3. SALES TRAIL (Who has it?) */}
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '20px', borderRadius: '8px' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#60a5fa' }}>🚚 Distribution Trail (Sales)</h4>
                            {traceData.sales_trail.length === 0 ? (
                                <div style={{ color: '#64748b' }}>No sales recorded yet.</div>
                            ) : (
                                traceData.sales_trail.map((sale, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{sale.customer}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Ord #{sale.order_id} • {new Date(sale.date).toLocaleDateString()}</div>
                                        </div>
                                        <span className="badge badge-blue">Sent {sale.qty_sold}</span>
                                    </div>
                                ))
                            )}
                        </div>

                    </div>
                    
                    {/* 4. EMERGENCY ACTION */}
                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                         <button 
                            style={{ background: '#ef4444', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '1px' }}
                            onClick={() => alert("🚨 RECALL INITIATED: Automatic emails sent to " + traceData.sales_trail.length + " customers.")}
                         >
                            ⚠ INITIATE BATCH RECALL
                         </button>
                    </div>

                </div>
            )}
        </div>
    );
};

export default BatchTracer;