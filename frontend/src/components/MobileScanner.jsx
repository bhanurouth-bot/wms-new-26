import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { inventoryService } from '../services/api';

// Accept the 'onClose' prop passed from App.jsx
const MobileScanner = ({ onClose }) => {
    const [scanResult, setScanResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleScan = async (result, error) => {
        if (!!result) {
            setScanResult(result?.text);
            
            // AUTOMATION: If it looks like a Bin Code, fetch data automatically
            if (result?.text.startsWith('A-') || result?.text.startsWith('B-')) {
                fetchBinData(result?.text);
            }
        }
        // error logic...
    };

    const fetchBinData = async (binCode) => {
        setLoading(true);
        try {
            const res = await inventoryService.getLiveStock();
            const binItems = res.data.filter(item => item.bin_code === binCode);
            
            if (binItems.length === 0) {
                alert(`Bin ${binCode} is Empty.`);
            } else {
                alert(`Bin ${binCode} contains:\n` + binItems.map(i => `${i.product_name}: ${i.quantity}`).join('\n'));
            }
        } catch (err) {
            alert("Failed to fetch bin data.");
        } finally {
            setLoading(false);
        }
    };

    return (
        // --- MODAL OVERLAY WRAPPER ---
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.9)', // Dark background
            zIndex: 10000, // On top of everything
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            
            {/* CLOSE BUTTON */}
            <button 
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}
            >
                ✕ Close
            </button>

            <div className="glass-panel" style={{ textAlign: 'center', width: '100%', maxWidth: '400px' }}>
                <h3 style={{ color: '#fbbf24', marginTop: 0 }}>🔫 Handheld Scanner</h3>
                
                <div style={{ 
                    margin: '20px auto', 
                    width: '100%', 
                    aspectRatio: '1/1', // Keep it square
                    border: '2px solid #334155', 
                    borderRadius: '12px', 
                    overflow: 'hidden',
                    background: '#000'
                }}>
                    <QrReader
                        onResult={handleScan}
                        constraints={{ facingMode: 'environment' }} // Use Back Camera
                        style={{ width: '100%' }}
                        videoContainerStyle={{ paddingTop: '100%' }} // Fix for some mobile browsers
                    />
                </div>

                <p style={{ color: '#94a3b8' }}>Point camera at a Bin Label or Batch QR</p>
                
                {scanResult && (
                    <div style={{ marginTop: '20px', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                        <strong>Scanned:</strong> {scanResult}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MobileScanner;