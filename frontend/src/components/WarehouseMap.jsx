import React, { useEffect, useState } from 'react';
import { inventoryService } from '../services/api';

const WarehouseMap = () => {
    const [bins, setBins] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedBin, setSelectedBin] = useState(null);

    useEffect(() => {
        loadMap();
    }, []);

    const loadMap = async () => {
        try {
            const response = await inventoryService.getLiveStock();
            const stockData = response.data;

            // Initialize visual grid (10 slots for Rack A)
            const binMap = {};
            for (let i = 1; i <= 10; i++) {
                const code = `A-01-${i.toString().padStart(2, '0')}`;
                binMap[code] = { code, items: [], status: 'EMPTY' };
            }

            // Fill with real data
            stockData.forEach(item => {
                if (!binMap[item.bin_code]) {
                    binMap[item.bin_code] = { code: item.bin_code, items: [], status: 'EMPTY' };
                }
                binMap[item.bin_code].items.push(item);
            });
            
            // Determine Status Logic (The "Brain" of the visual)
            Object.values(binMap).forEach(bin => {
                // If ANY item is quarantined, the whole bin is dangerous
                const hasQuarantine = bin.items.some(i => i.is_quarantined);
                const isCold = bin.items.some(i => i.is_cold_chain);
                const hasItems = bin.items.length > 0;

                if (hasQuarantine) {
                    bin.status = 'QUARANTINE';
                } else if (hasItems) {
                    bin.status = isCold ? 'COLD' : 'OCCUPIED';
                } else {
                    bin.status = 'EMPTY';
                }
            });

            setBins(binMap);
            setLoading(false);
        } catch (error) {
            console.error("Map Error", error);
            setLoading(false);
        }
    };

    // --- SIMULATION LOGIC ---
    const simulateHeatWave = async () => {
        if (!selectedBin) return alert("Select a Bin first to attack with heat!");
        
        const temp = prompt(`Enter Sensor Temp for ${selectedBin.code} (Max allowed is usually 8°C):`, "12");
        if (!temp) return;

        try {
            const res = await inventoryService.sendTelemetry({
                bin_code: selectedBin.code,
                temperature: parseFloat(temp)
            });
            
            if (res.data.status === "ALERT") {
                alert(`🚨 ALARM TRIGGERED! System Auto-Quarantined Batches: ${res.data.batches.join(", ")}`);
            } else {
                alert("✅ Temperature Nominal. No action taken.");
            }
            // Refresh map to see the red box
            loadMap(); 
        } catch (err) {
            console.error(err);
            alert("Sensor Communication Error");
        }
    };

    const getBinColor = (status) => {
        switch (status) {
            case 'QUARANTINE': return 'rgba(239, 68, 68, 0.6)'; // RED (Danger)
            case 'OCCUPIED': return 'rgba(16, 185, 129, 0.4)';  // Green (Normal)
            case 'COLD': return 'rgba(59, 130, 246, 0.5)';      // Blue (Cold Chain)
            default: return 'rgba(255, 255, 255, 0.05)';       // Transparent (Empty)
        }
    };

    return (
        <div className="glass-panel" style={{ marginTop: '30px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontWeight: 500 }}>🗺️ Digital Twin & IoT Control</h2>
                <button 
                    onClick={simulateHeatWave} 
                    className="badge badge-red" 
                    style={{ cursor: 'pointer', border: 'none', fontSize: '0.9rem', padding: '8px 16px' }}
                >
                    🌡️ Simulate Sensor Data
                </button>
            </div>
            
            <div style={{ display: 'flex', gap: '20px' }}>
                
                {/* GRID VIEW */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', flex: 1 }}>
                    {Object.values(bins).sort((a,b) => a.code.localeCompare(b.code)).map((bin) => (
                        <div 
                            key={bin.code}
                            onClick={() => setSelectedBin(bin)}
                            style={{
                                background: getBinColor(bin.status),
                                border: selectedBin?.code === bin.code ? '2px solid white' : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                padding: '20px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                position: 'relative'
                            }}
                        >
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{bin.code}</div>
                            
                            {/* Visual Icons */}
                            {bin.status === 'QUARANTINE' && <div style={{ fontSize: '1.5rem', marginTop: '5px' }}>☣</div>}
                            {bin.status === 'COLD' && <div style={{ position:'absolute', top:'5px', right:'5px', fontSize:'0.8rem' }}>❄</div>}
                            
                            {/* Qty Count */}
                            {bin.items.length > 0 && bin.status !== 'QUARANTINE' && (
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', marginTop: '5px' }}>
                                    {bin.items.reduce((sum, i) => sum + i.quantity, 0)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* SIDEBAR DETAILS */}
                <div style={{ width: '300px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '20px' }}>
                    <h4 style={{ margin: '0 0 15px 0', color: '#94a3b8' }}>BIN X-RAY</h4>
                    {selectedBin ? (
                        <>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '10px' }}>{selectedBin.code}</div>
                            {selectedBin.items.length === 0 ? <div style={{color:'#64748b'}}>Empty</div> : (
                                selectedBin.items.map((item, idx) => (
                                    <div key={idx} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <div style={{ color: '#fff', fontWeight: 'bold' }}>{item.product_name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{item.batch_number}</div>
                                        
                                        {item.is_quarantined ? (
                                            <span className="badge badge-red" style={{marginTop:'5px', background:'red', color:'white'}}>☣ BLOCKED</span>
                                        ) : (
                                            <span className="badge badge-green" style={{marginTop:'5px'}}>OK</span>
                                        )}
                                    </div>
                                ))
                            )}
                        </>
                    ) : (
                        <div style={{color:'#64748b'}}>Select a bin...</div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default WarehouseMap;