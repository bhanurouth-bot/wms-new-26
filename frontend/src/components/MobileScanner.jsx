import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { complianceService } from '../services/api';

const MobileScanner = ({ onClose }) => {
    const [scanResult, setScanResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Initialize Scanner
        const scanner = new Html5QrcodeScanner(
            "reader", 
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );

        scanner.render(onScanSuccess, onScanFailure);

        // Cleanup on unmount
        return () => {
            scanner.clear().catch(error => console.error("Failed to clear scanner", error));
        };
    }, []);

    const onScanSuccess = async (decodedText, decodedResult) => {
        // Stop scanning after success to prevent flood
        // (In a real app, we might pause the scanner, but for now we just query)
        if (loading) return;
        
        console.log(`Scan result: ${decodedText}`, decodedResult);
        await fetchBatchDetails(decodedText);
    };

    const onScanFailure = (error) => {
        // Keeps scanning... just ignore errors like "No QR code found"
    };

    const fetchBatchDetails = async (batchNumber) => {
        setLoading(true);
        setError(null);
        try {
            // We use the Compliance Trace endpoint because it gives us EVERYTHING about a batch
            const response = await complianceService.traceBatch(batchNumber);
            setScanResult(response.data);
        } catch (err) {
            setError(`Batch ${batchNumber} not found in system.`);
            setScanResult(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh',
            background: '#0f172a', zIndex: 1000, display: 'flex', flexDirection: 'column'
        }}>
            {/* HEADER */}
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b' }}>
                <h2 style={{ margin: 0, color: '#fff' }}>📷 Scan Mode</h2>
                <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            {/* SCANNER VIEWPORT */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                
                {/* The Camera Feed Div */}
                {!scanResult && !loading && (
                    <div id="reader" style={{ width: '100%', maxWidth: '400px', border: '2px solid #3b82f6', borderRadius: '12px', overflow: 'hidden' }}></div>
                )}

                {/* LOADING STATE */}
                {loading && <div style={{ color: '#3b82f6', fontSize: '1.5rem' }}>Processing Scan...</div>}
                
                {/* ERROR STATE */}
                {error && (
                    <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', borderRadius: '12px', textAlign: 'center' }}>
                        {error}
                        <button onClick={() => { setError(null); setScanResult(null); }} style={{ display: 'block', margin: '15px auto 0', padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px' }}>Retry</button>
                    </div>
                )}

                {/* RESULT CARD */}
                {scanResult && (
                    <div style={{ width: '100%', maxWidth: '400px', background: '#1e293b', borderRadius: '16px', padding: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                        <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '5px' }}>IDENTIFIED BATCH</div>
                        <h2 style={{ margin: '0 0 10px 0', color: '#fbbf24', fontSize: '2rem', fontFamily: 'monospace' }}>
                            {scanResult.batch_info.batch_number}
                        </h2>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}>{scanResult.batch_info.product}</div>
                            <div style={{ color: scanResult.current_locations.length > 0 ? '#10b981' : '#ef4444' }}>
                                {scanResult.current_locations.length > 0 ? `${scanResult.current_locations[0].qty} Units in Stock` : 'Out of Stock'}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <button style={{ padding: '15px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold' }}>
                                📦 Move
                            </button>
                            <button style={{ padding: '15px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold' }}>
                                ✅ Audit
                            </button>
                        </div>
                        
                        <button 
                            onClick={() => setScanResult(null)} 
                            style={{ width: '100%', marginTop: '15px', padding: '15px', background: 'transparent', border: '1px solid #475569', color: '#94a3b8', borderRadius: '8px' }}
                        >
                            Scan Next Item
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MobileScanner;