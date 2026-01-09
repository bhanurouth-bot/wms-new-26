import React, { useState, useEffect } from 'react';
import { QrReader } from 'react-qr-reader'; // Ensure you are using the modern version
import { inventoryService } from '../services/api';

const MobileScanner = ({ onScanSuccess }) => {
    const [scanResult, setScanResult] = useState(null);
    const [isPaused, setIsPaused] = useState(false); // <--- THE FIX: Pause State
    const [loading, setLoading] = useState(false);

    // This function handles the "Rapid Fire" scanning issue
    const handleScan = (result, error) => {
        if (isPaused) return; // Stop listening if we already found something
        
        if (result && result?.text) {
            setIsPaused(true); // 🛑 FREEZE CAMERA IMMEDIATELY
            setScanResult(result.text);
            
            // Optional: Haptic Feedback (Vibrate phone)
            if (navigator.vibrate) navigator.vibrate(200);
        }
        
        if (error) {
            // console.info(error); // Ignore frame errors
        }
    };

    const handleAction = async (actionType) => {
        if (!scanResult) return;
        setLoading(true);

        try {
            // Example logic - customize based on your needs
            if (actionType === 'AUDIT') {
                alert(`🔍 Auditing Batch: ${scanResult}`);
                // await inventoryService.auditBatch(scanResult);
            } else if (actionType === 'MOVE') {
                alert(`🚚 Moving Stock: ${scanResult}`);
                // await inventoryService.moveStock(scanResult);
            }
            
            // Reset after action is done
            setScanResult(null);
            setIsPaused(false); // ▶ RESUME SCANNING
            if (onScanSuccess) onScanSuccess(scanResult);

        } catch (err) {
            alert("Action Failed");
            setIsPaused(false); // Resume even on error
        } finally {
            setLoading(false);
        }
    };

    const resetScanner = () => {
        setScanResult(null);
        setIsPaused(false);
    };

    return (
        <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
            
            {/* 1. CAMERA VIEW */}
            <div style={{ 
                position: 'relative', 
                borderRadius: '20px', 
                overflow: 'hidden', 
                border: '2px solid #3b82f6',
                boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)'
            }}>
                {/* Only show camera if we haven't paused (optional performance boost) */}
                <QrReader
                    onResult={handleScan}
                    constraints={{ facingMode: 'environment' }}
                    scanDelay={500} // Slow down the scan rate
                    containerStyle={{ width: '100%', height: '300px' }}
                    videoStyle={{ objectFit: 'cover' }}
                />

                {/* SCANNER OVERLAY (Target Box) */}
                <div style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '200px', height: '200px',
                    border: '2px dashed rgba(255,255,255,0.8)',
                    borderRadius: '12px',
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)', // Dim outside area
                    pointerEvents: 'none' // Let clicks pass through
                }}></div>
            </div>

            {/* 2. RESULT / ACTION CARD (The "Alert Box") */}
            {scanResult && (
                <div className="glass-panel" style={{
                    marginTop: '20px',
                    padding: '20px',
                    border: '1px solid #10b981',
                    animation: 'slideUp 0.3s ease-out',
                    // FORCE Z-INDEX to be above everything
                    position: 'relative', 
                    zIndex: 1000 
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>SCANNED CODE</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', fontFamily: 'monospace' }}>
                            {scanResult}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <button 
                            onClick={() => handleAction('AUDIT')}
                            disabled={loading}
                            style={{
                                padding: '15px',
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            🔍 AUDIT
                        </button>

                        <button 
                            onClick={() => handleAction('MOVE')}
                            disabled={loading}
                            style={{
                                padding: '15px',
                                background: '#8b5cf6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            🚚 MOVE
                        </button>
                    </div>
                    
                    <button 
                        onClick={resetScanner}
                        style={{ width: '100%', marginTop: '15px', padding: '10px', background: 'transparent', border: '1px solid #64748b', color: '#94a3b8', borderRadius: '8px' }}
                    >
                        ❌ Cancel / Rescan
                    </button>
                </div>
            )}
        </div>
    );
};

export default MobileScanner;