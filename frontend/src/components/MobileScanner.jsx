import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { inventoryService } from '../services/api';

const MobileScanner = () => {
    const [scanResult, setScanResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleScan = async (result, error) => {
        if (!!result) {
            setScanResult(result?.text);
            
            // AUTOMATION: If it looks like a Bin Code, fetch data automatically
            if (result?.text.startsWith('A-') || result?.text.startsWith('B-')) {
                fetchBinData(result?.text);
            }
        }
        if (!!error) {
            // console.info(error); // Ignore scan noise
        }
    };

    const fetchBinData = async (binCode) => {
        setLoading(true);
        try {
            // We use the live stock API, but filter for this specific bin
            // In a real app, we'd have a specific endpoint: /inventory/bin/{code}
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
        <div className="glass-panel" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#fbbf24' }}>🔫 Handheld Scanner</h3>
            
            <div style={{ margin: '20px auto', width: '300px', border: '2px solid #334155', borderRadius: '12px', overflow: 'hidden' }}>
                <QrReader
                    onResult={handleScan}
                    constraints={{ facingMode: 'environment' }} // Use Back Camera
                    style={{ width: '100%' }}
                />
            </div>

            <p style={{ color: '#94a3b8' }}>Point camera at a Bin Label or Batch QR</p>
            
            {scanResult && (
                <div style={{ marginTop: '20px', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                    <strong>Scanned:</strong> {scanResult}
                </div>
            )}
        </div>
    );
};

export default MobileScanner;