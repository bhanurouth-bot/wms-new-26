import React, { useState, useRef, useEffect } from 'react';
import { QrReader } from 'react-qr-reader';
import { inventoryService } from '../services/api';

const MobileScanner = () => {
    const [scanResult, setScanResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [camError, setCamError] = useState('');
    
    // 🔒 SPAM PREVENTION: Keep track of the last code to stop infinite loops
    const lastScanned = useRef(null);

    const handleScan = async (result, error) => {
        // 1. If we already found a code, stop listening (freeze mode)
        if (lastScanned.current) return;

        if (error) {
            // "No QR code found" errors happen every frame. Ignore them.
            if (error?.message?.includes('No MultiFormat Readers')) return;
            // Real camera errors (like "Permission Denied") should be shown
            if (error?.name === 'NotAllowedError') setCamError("Camera Permission Denied");
            return;
        }

        if (result && result.text) {
            const code = result.text;
            
            // 2. Lock the scanner
            lastScanned.current = code;
            setScanResult(code);
            
            // 3. Automation Logic
            if (code.startsWith('A-') || code.startsWith('B-')) {
                // Audio Feedback (Beep)
                new Audio('https://freetestdata.com/wp-content/uploads/2021/09/Free_Test_Data_1MB_MP3.mp3').play().catch(() => {}); // Optional: real beep sound needed
                await fetchBinData(code);
            }
        }
    };

    const fetchBinData = async (binCode) => {
        setLoading(true);
        try {
            const res = await inventoryService.getLiveStock();
            // Filter locally (In a real app, backend would filter: /stock?bin=X)
            const binItems = res.data.filter(item => item.bin_code === binCode);
            
            if (binItems.length === 0) {
                alert(`ℹ️ Bin ${binCode} is Empty.`);
            } else {
                const summary = binItems.map(i => `📦 ${i.product_name}: ${i.quantity} Units`).join('\n');
                alert(`✅ CONTENTS OF ${binCode}:\n\n${summary}`);
            }
        } catch (err) {
            alert("❌ Server Error: Could not fetch bin data.");
        } finally {
            setLoading(false);
        }
    };

    const resetScanner = () => {
        lastScanned.current = null;
        setScanResult(null);
        setCamError('');
    };

    return (
        <div className="glass-panel" style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, color: '#fbbf24' }}>🔫 Mobile Scanner</h3>
                {scanResult && (
                    <button 
                        onClick={resetScanner} 
                        style={{ padding: '5px 10px', background: '#3b82f6', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer' }}
                    >
                        🔄 Scan Next
                    </button>
                )}
            </div>
            
            {/* CAMERA VIEWPORT */}
            <div style={{ 
                margin: '0 auto', 
                width: '100%', 
                maxWidth: '400px', 
                height: '300px', // Force height to prevent layout jumps
                border: '2px solid #334155', 
                borderRadius: '12px', 
                overflow: 'hidden',
                position: 'relative',
                background: '#000'
            }}>
                {camError ? (
                    <div style={{ color: '#ef4444', padding: '40px' }}>
                        🚫 {camError}<br/><small>Please allow camera access in settings.</small>
                    </div>
                ) : (
                    <QrReader
                        onResult={handleScan}
                        constraints={{ facingMode: 'environment' }} 
                        videoContainerStyle={{ paddingTop: 0, height: '100%' }} // Force fit
                        videoStyle={{ objectFit: 'cover', height: '100%' }}
                        ViewFinder={() => (
                            <div style={{
                                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                width: '200px', height: '200px', border: '2px solid rgba(255,255,255,0.5)', borderRadius: '12px'
                            }}></div>
                        )}
                    />
                )}
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '10px' }}>
                {loading ? "⏳ Fetching Data..." : scanResult ? "✅ Code Detected" : "Point camera at Bin Label"}
            </p>
            
            {scanResult && (
                <div style={{ marginTop: '10px', padding: '8px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '6px', color: '#6ee7b7' }}>
                    {scanResult}
                </div>
            )}
        </div>
    );
};

export default MobileScanner;